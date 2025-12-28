from django.contrib import admin
from .models import Bin, Shipment, AuditLog


@admin.register(Bin)
class BinAdmin(admin.ModelAdmin):
    list_display = ['bin_id', 'warehouse', 'location', 'capacity', 'status', 'created_at', 'updated_at']
    list_filter = ['warehouse', 'status', 'created_at']
    search_fields = ['bin_id', 'location', 'warehouse__name', 'warehouse__warehouse_id']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['warehouse', 'bin_id']
    
    fieldsets = (
        ('Bin Information', {
            'fields': ('bin_id', 'warehouse', 'location', 'capacity', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ['tracking_id', 'warehouse', 'bin', 'status', 'manifested', 'time_in', 'time_out', 'created_at', 'updated_at']
    list_filter = ['warehouse', 'status', 'manifested', 'created_at']
    search_fields = ['tracking_id', 'bin__bin_id', 'warehouse__name', 'warehouse__warehouse_id']
    readonly_fields = ['created_at', 'updated_at', 'time_in']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Shipment Information', {
            'fields': ('tracking_id', 'warehouse', 'bin', 'status', 'manifested')
        }),
        ('Timestamps', {
            'fields': ('time_in', 'time_out', 'created_at', 'updated_at')
        }),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'warehouse', 'action', 'shipment', 'user', 'timestamp', 'details']
    list_filter = ['warehouse', 'action', 'timestamp', 'user']
    search_fields = ['shipment__tracking_id', 'user', 'details', 'warehouse__name', 'warehouse__warehouse_id']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']
    
    fieldsets = (
        ('Audit Information', {
            'fields': ('warehouse', 'action', 'shipment', 'user', 'details')
        }),
        ('Timestamp', {
            'fields': ('timestamp',)
        }),
    )
