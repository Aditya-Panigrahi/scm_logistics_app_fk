from django.contrib import admin
from .models import Bin, Shipment, AuditLog


@admin.register(Bin)
class BinAdmin(admin.ModelAdmin):
    list_display = ['bin_id', 'location', 'capacity', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    search_fields = ['bin_id', 'location']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Bin Information', {
            'fields': ('bin_id', 'location', 'capacity', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ['tracking_id', 'bin', 'status', 'manifested', 'time_in', 'time_out', 'created_at', 'updated_at']
    list_filter = ['status', 'manifested', 'created_at']
    search_fields = ['tracking_id', 'bin__bin_id']
    readonly_fields = ['created_at', 'updated_at', 'time_in']
    
    fieldsets = (
        ('Shipment Information', {
            'fields': ('tracking_id', 'bin', 'status', 'manifested')
        }),
        ('Timestamps', {
            'fields': ('time_in', 'time_out', 'created_at', 'updated_at')
        }),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'action', 'shipment', 'user', 'timestamp', 'details']
    list_filter = ['action', 'timestamp', 'user']
    search_fields = ['shipment__tracking_id', 'user', 'details']
    readonly_fields = ['timestamp']
    
    fieldsets = (
        ('Audit Information', {
            'fields': ('action', 'shipment', 'user', 'details')
        }),
        ('Timestamp', {
            'fields': ('timestamp',)
        }),
    )
