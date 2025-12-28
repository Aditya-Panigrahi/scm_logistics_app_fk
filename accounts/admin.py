from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Warehouse


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ['warehouse_id', 'name', 'location', 'contact_email', 'contact_phone', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['warehouse_id', 'name', 'location', 'contact_email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['warehouse_id']


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'warehouse', 'employee_id', 'phone_number', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['role', 'warehouse', 'is_active', 'is_staff', 'is_superuser', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'employee_id', 'phone_number']
    ordering = ['-date_joined']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Warehouse & Role', {
            'fields': ('role', 'warehouse', 'accessible_warehouses', 'phone_number', 'employee_id')
        }),
    )
    
    filter_horizontal = ['accessible_warehouses', 'groups', 'user_permissions']
