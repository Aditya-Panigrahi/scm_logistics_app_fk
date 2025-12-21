from django.contrib import admin
from .models import Bin, Shipment, AuditLog


@admin.register(Bin)
class BinAdmin(admin.ModelAdmin):
    list_display = ['bin_id', 'location', 'capacity', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['bin_id', 'location']


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ['tracking_id', 'bin', 'status', 'time_in', 'time_out']
    list_filter = ['status']
    search_fields = ['tracking_id', 'bin__bin_id']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['action', 'shipment', 'user', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['shipment__tracking_id', 'user']
    readonly_fields = ['timestamp']
