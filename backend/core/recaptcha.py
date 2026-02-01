import requests
import os
from django.conf import settings


def verify_recaptcha(token, action=None):
    """
    Verify reCAPTCHA v3 token with Google's API.
    
    Args:
        token: The reCAPTCHA token from the client
        action: Optional action name to verify
        
    Returns:
        tuple: (success: bool, score: float, error_message: str or None)
    """
    if not token:
        return False, 0.0, "No reCAPTCHA token provided"
    
    secret_key = os.getenv('RECAPTCHA_SECRET_KEY', '')
    
    if not secret_key:
        # If no secret key is configured, skip verification (development mode)
        return True, 1.0, None
    
    try:
        response = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={
                'secret': secret_key,
                'response': token,
            },
            timeout=10
        )
        result = response.json()
        
        success = result.get('success', False)
        score = result.get('score', 0.0)
        
        if not success:
            error_codes = result.get('error-codes', [])
            return False, score, f"reCAPTCHA verification failed: {error_codes}"
        
        # Check action if provided
        if action and result.get('action') != action:
            return False, score, f"reCAPTCHA action mismatch: expected {action}, got {result.get('action')}"
        
        # Check score threshold (0.5 is a common threshold)
        if score < 0.5:
            return False, score, f"reCAPTCHA score too low: {score}"
        
        return True, score, None
        
    except requests.RequestException as e:
        return False, 0.0, f"reCAPTCHA verification request failed: {str(e)}"
    except Exception as e:
        return False, 0.0, f"reCAPTCHA verification error: {str(e)}"
