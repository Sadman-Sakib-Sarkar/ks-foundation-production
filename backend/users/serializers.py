from rest_framework import serializers
from .models import CustomUser

from django.contrib.auth.password_validation import validate_password
from rest_framework.serializers import ValidationError

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        # Allow extra fields if passed, but typically strictly defined here
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.role = 'USER'
        user.is_verified = False 
        user.save()
        return user

class StaffRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.role = 'USER'  # Security Fix: Default to USER
        user.is_verified = False
        user.is_approved_staff = False
        user.is_staff_applicant = True # Flag as applicant
        user.save()
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        return attrs

class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=6, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(min_length=6, write_only=True)
    token = serializers.CharField(min_length=1, write_only=True)
    uidb64 = serializers.CharField(min_length=1, write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        return attrs

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_verified', 'is_approved_staff', 'is_staff_applicant',
                  'village_street', 'upazilla', 'district', 'division', 'country', 'mobile_number', 'profile_picture', 'is_superuser')
        read_only_fields = ('email', 'is_verified', 'is_approved_staff', 'is_superuser')

    def validate(self, attrs):
        # Check if role is being updated
        if 'role' in attrs:
            new_role = attrs['role']
            request = self.context.get('request')
            
            if self.instance and request and request.user:
                # 1. Prevent changing own role
                if self.instance.id == request.user.id and new_role != self.instance.role:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({"role": "You cannot change your own role."})

                # 2. Prevent changing role of an existing ADMIN (unless superuser)
                if self.instance.role == 'ADMIN' and new_role != 'ADMIN' and not request.user.is_superuser:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({"role": "You cannot change the role of an Administrator."})

                # 3. Prevent promoting to ADMIN (unless superuser)
                if new_role == 'ADMIN' and self.instance.role != 'ADMIN' and not request.user.is_superuser:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({"role": "Only Superusers can promote users to Administrator."})
        
        return attrs
