from rest_framework import permissions

class IsAdminOrStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow Admins and Staff to edit objects.
    Read-only for others.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to authenticated users with ADMIN or STAFF role
        # Write permissions are only allowed to authenticated users with ADMIN or STAFF role
        return request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'STAFF']

class IsAdminOrStaff(permissions.BasePermission):
    """
    Allows access only to authenticated Admin or Staff users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'STAFF']
