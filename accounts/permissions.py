from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """Permission class for superadmin only"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'SUPERADMIN'


class IsWarehouseAdminOrSuperAdmin(permissions.BasePermission):
    """Permission class for warehouse admin or superadmin"""
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                request.user.role in ['SUPERADMIN', 'WAREHOUSE_ADMIN'])


class IsOperationHeadOrAbove(permissions.BasePermission):
    """Permission class for operation head and above (read operations)"""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Read permissions for operation head
        if request.user.role == 'OPERATION_HEAD':
            return request.method in permissions.SAFE_METHODS
        
        # Full permissions for admin and superadmin
        return request.user.role in ['SUPERADMIN', 'WAREHOUSE_ADMIN']


class CanAccessInbound(permissions.BasePermission):
    """Permission for inbound process access"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class CanAccessOutbound(permissions.BasePermission):
    """Permission for outbound process access"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class CanAccessManifest(permissions.BasePermission):
    """Permission for manifest creation access"""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Operators cannot access manifest
        if request.user.role == 'OPERATOR':
            return False
        
        # Operation head can only view
        if request.user.role == 'OPERATION_HEAD':
            return request.method in permissions.SAFE_METHODS
        
        return True


class CanAccessInventoryDashboard(permissions.BasePermission):
    """Permission for inventory dashboard access"""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Operators cannot access dashboard
        return request.user.role != 'OPERATOR'
