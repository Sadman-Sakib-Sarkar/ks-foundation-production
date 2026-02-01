from django.core.exceptions import ValidationError

def validate_file_size(value):
    """
    Validates that the file size is less than 5MB.
    """
    filesize = value.size
    
    if filesize > 5 * 1024 * 1024:
        raise ValidationError("The maximum file size that can be uploaded is 5MB")
    else:
        return value

def validate_large_file_size(value):
    """
    Validates that the file size is less than 50MB.
    """
    filesize = value.size
    
    if filesize > 50 * 1024 * 1024:
        raise ValidationError("The maximum file size that can be uploaded is 50MB")
    else:
        return value
