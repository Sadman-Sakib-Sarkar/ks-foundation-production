from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser
from .serializers import (
    UserRegistrationSerializer, 
    StaffRegistrationSerializer, 
    UserSerializer,
    ChangePasswordSerializer,
    RequestPasswordResetSerializer,
    SetNewPasswordSerializer
)
from django.contrib.auth import get_user_model
from core.pagination import StandardPagination

User = get_user_model()

# ... (rest of imports/classes)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'mobile_number']

    def get_queryset(self):
        # Only admin sees all users to manage them
        if self.request.user.role != 'ADMIN':
            return User.objects.none()
        
        queryset = User.objects.filter(is_verified=True).order_by('-date_joined')
        
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role.upper())
            
        return queryset

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        try:
            data = super().validate(attrs) # This sets self.user
        except Exception:
            from rest_framework.exceptions import AuthenticationFailed
            raise AuthenticationFailed("Invalid email or password.")
        
        if not self.user.is_verified:
             from rest_framework.exceptions import AuthenticationFailed
             raise AuthenticationFailed("Email is not verified.")
        
        if self.user.role == 'STAFF' and not self.user.is_approved_staff:
             # Allow login but restrict to USER privileges
             data['role'] = 'USER'
             # We don't change the DB role, just the token claim and response
             token = self.get_token(self.user)
             token['role'] = 'USER'
        else:
             data['role'] = self.user.role
             
        data['user_id'] = self.user.id
        data['email'] = self.user.email
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        # Verify reCAPTCHA
        from core.recaptcha import verify_recaptcha
        
        recaptcha_token = request.data.get('recaptcha_token')
        success, score, error = verify_recaptcha(recaptcha_token, action='login')
        
        if not success:
            return Response(
                {'recaptcha': error or 'reCAPTCHA verification failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().post(request, *args, **kwargs)

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)

    def perform_create(self, serializer):
        user = serializer.save()
        # Send verification email
        from .email_verification import send_verification_email
        send_verification_email(user)

class RegisterStaffView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = StaffRegistrationSerializer
    permission_classes = (permissions.AllowAny,)

    def perform_create(self, serializer):
        user = serializer.save()
        # Send verification email
        from .email_verification import send_verification_email
        send_verification_email(user)

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

# ... (imports)
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Allows usage if we eventually have stats for users too, 
        # but for now restrict or just return basic info. 
        # User asked for "Admin and Staff dashboard".
        if request.user.role not in ['ADMIN', 'STAFF']:
             return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        stats = {
            "total_users": User.objects.count(),
            "admin_users": User.objects.filter(role='ADMIN').count(),
            "staff_users": User.objects.filter(role='STAFF').count(),
            "regular_users": User.objects.filter(role='USER').count(),
        }

        # Lazy imports to avoid circular dependency and errors if apps change
        try:
            from library.models import Book
            stats["total_books"] = Book.objects.count()
        except ImportError:
            stats["total_books"] = 0

        try:
            from library.models import BorrowedBook
            stats["total_borrowed"] = BorrowedBook.objects.filter(is_returned=False).count()
            stats["total_returned"] = BorrowedBook.objects.filter(is_returned=True).count()
        except ImportError:
            stats["total_borrowed"] = 0
            stats["total_returned"] = 0

        try:
            from core.models import Member
            stats["total_members"] = Member.objects.count()
        except ImportError:
            stats["total_members"] = 0

        try:
            from core.models import Notice
            stats["total_notices"] = Notice.objects.count()
        except ImportError:
            stats["total_notices"] = 0

        try:
            from core.models import ContactMessage
            stats["total_messages"] = ContactMessage.objects.count()
            stats["unread_messages"] = ContactMessage.objects.filter(is_read=False).count()
        except ImportError:
            stats["total_messages"] = 0
            stats["unread_messages"] = 0

        try:
            from health.models import HealthCamp
            stats["total_health_camps"] = HealthCamp.objects.count()
        except ImportError:
            stats["total_health_camps"] = 0
            
        try:
            from blog.models import Post
            stats["total_posts"] = Post.objects.count()
        except ImportError:
             # Try BlogPost alternate name
            try:
                from blog.models import BlogPost
                stats["total_posts"] = BlogPost.objects.count()
            except ImportError:
                stats["total_posts"] = 0

        return Response(stats)



class UserAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Double check permission
        if self.request.user.role != 'ADMIN':
             return User.objects.none()
        return User.objects.all()

    def perform_destroy(self, instance):
        # Prevent deleting yourself
        if instance.id == self.request.user.id:
             from rest_framework.exceptions import ValidationError
             raise ValidationError("Cannot delete your own account.")
        instance.delete()

class ToggleStaffRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'ADMIN':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(pk=pk)
            # Prevent self-demotion to avoid locking out admin
            if user.pk == request.user.pk:
                 return Response({"error": "Cannot change your own role"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Prevent modifying an ADMIN
            if user.role == 'ADMIN' and not request.user.is_superuser:
                 return Response({"error": "Cannot change the role of an Administrator"}, status=status.HTTP_403_FORBIDDEN)

            if user.role == 'STAFF' and not user.is_approved_staff:
                # Approve pending staff
                user.is_approved_staff = True
                user.is_staff = True
            elif user.role == 'STAFF':
                # Demote approved staff to USER
                user.role = 'USER'
                user.is_staff = False
                user.is_approved_staff = False
            else:
                user.role = 'STAFF'
                user.is_staff = True
                user.is_approved_staff = True
            
            user.save()
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
             return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


from rest_framework.views import APIView

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        
        from .email_verification import verify_email_token
        success, message, user = verify_email_token(token)
        
        if success:
            return Response({'message': message}, status=status.HTTP_200_OK)
        else:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            
            if user.is_verified:
                return Response({'error': 'Email is already verified.'}, status=status.HTTP_400_BAD_REQUEST)
            
            from .email_verification import send_verification_email
            send_verification_email(user)
            
            return Response({'message': 'Verification email sent successfully.'}, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Don't reveal if email exists or not
            return Response({'message': 'If an account exists with this email, a verification email will be sent.'}, status=status.HTTP_200_OK)


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.data.get("old_password")):
            return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
        
        # set_password also hashes the password that the user will get
        user.set_password(serializer.data.get("new_password"))
        user.save()
        
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)

class RequestPasswordResetView(generics.GenericAPIView):
    serializer_class = RequestPasswordResetSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = request.data['email']
        
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            
            # Generate Token
            from django.contrib.auth.tokens import PasswordResetTokenGenerator
            from django.utils.encoding import smart_bytes
            from django.utils.http import urlsafe_base64_encode
            
                
            uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            
            # Reset URL (Frontend)
            import os
            current_site = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            absurl = f"{current_site}/password-reset/{uidb64}/{token}"
            
            # Send Email
            from django.core.mail import EmailMessage
            import os
            
            email_body = f'Hello, \n Use link below to reset your password \n {absurl}'
            
            data = {'email_body': email_body, 'to_email': user.email, 'email_subject': 'Reset your password'}
            
            # Using simple email for now, similar to email_verification
            email_msg = EmailMessage(
                subject=data['email_subject'], 
                body=data['email_body'], 
                to=[data['to_email']],
                from_email=os.getenv('DEFAULT_FROM_EMAIL', 'no-reply@ksfoundation.com')
            )
            email_msg.send()
            
        return Response({'message': 'We have sent you a link to reset your password'}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = SetNewPasswordSerializer
    permission_classes = [permissions.AllowAny]

    def patch(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        from django.contrib.auth.tokens import PasswordResetTokenGenerator
        from django.utils.encoding import smart_str, DjangoUnicodeDecodeError
        from django.utils.http import urlsafe_base64_decode
        
        password = request.data.get('password')
        token = request.data.get('token')
        uidb64 = request.data.get('uidb64')
        
        try:
            id = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=id)
            
            if not PasswordResetTokenGenerator().check_token(user, token):
                 return Response({'error': 'Token is invalid or expired'}, status=status.HTTP_401_UNAUTHORIZED)
            
            user.set_password(password)
            user.save()
            return Response({'message': 'Password reset success'}, status=status.HTTP_200_OK)
            
        except DjangoUnicodeDecodeError as identifier:
             return Response({'error': 'Token is invalid or expired'}, status=status.HTTP_401_UNAUTHORIZED)

