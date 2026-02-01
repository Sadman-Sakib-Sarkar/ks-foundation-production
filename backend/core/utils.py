import os
import uuid

def get_file_path(instance, filename):
    """
    Generates a unique file path using UUID.
    Format: <app_label>/<model_name>/<uuid>.<ext>
    """
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join(instance._meta.app_label, instance._meta.model_name, filename)
