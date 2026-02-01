import secrets
import os
from django.core.mail import send_mail
from django.conf import settings


def generate_verification_token():
    """Generate a random 64-character verification token."""
    return secrets.token_urlsafe(48)


def send_verification_email(user, request=None):
    """
    Send a verification email to the user with a verification link.
    
    Args:
        user: The user instance to send the email to
        request: Optional HTTP request to build absolute URL
    """
    # Generate and save token
    token = generate_verification_token()
    user.email_verification_token = token
    user.save(update_fields=['email_verification_token'])
    
    # Build verification URL
    # In production, use a proper frontend URL
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    verification_url = f"{frontend_url}/verify-email?token={token}"
    
    subject = "Verify your email - KS Foundation"
    message = f"""Hello {user.first_name or 'User'},

Thank you for registering with the Kashimuddin Sarkar Foundation!

Please click the link below to verify your email address:

{verification_url}

If you did not create an account, you can safely ignore this email.

Best regards,
KS Foundation Team
"""
    
    try:
        result = send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        print(f"[Verification Email] Sent to {user.email}, result: {result}")
        return True
    except Exception as e:
        print(f"[Verification Email] Failed to send to {user.email}: {e}")
        return False


def verify_email_token(token):
    """
    Verify an email token and mark the user as verified.
    
    Args:
        token: The verification token
        
    Returns:
        tuple: (success: bool, message: str, user: User or None)
    """
    from .models import CustomUser
    
    if not token:
        return False, "No verification token provided.", None
    
    try:
        user = CustomUser.objects.get(email_verification_token=token)
        
        if user.is_verified:
            return False, "Email is already verified.", user
        
        user.is_verified = True
        user.email_verification_token = None  # Clear token after use
        user.save(update_fields=['is_verified', 'email_verification_token'])
        
        return True, "Email verified successfully!", user
        
    except CustomUser.DoesNotExist:
        return False, "Invalid verification token.", None
