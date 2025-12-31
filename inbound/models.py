from django.db import models
from django.utils import timezone
from django.conf import settings


class Bin(models.Model):
    """Storage container for packages"""
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Maintenance'),
    ]
    
    bin_id = models.CharField(max_length=100, unique=True, primary_key=True)
    warehouse = models.ForeignKey('accounts.Warehouse', on_delete=models.CASCADE, related_name='bins', null=True, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    capacity = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['bin_id']
    
    def __str__(self):
        return f"{self.bin_id} - {self.status}"


class Shipment(models.Model):
    """Package/shipment information"""
    STATUS_CHOICES = [
        ('manifested', 'Manifested'),
        ('putaway', 'Putaway'),
        ('picklist-created', 'Picklist Created'),
        ('picked', 'Picked'),
        ('unregistered', 'Unregistered'),
        ('registered', 'Registered'),
        ('picked-up', 'Picked Up'),
        ('dispatched', 'Dispatched'),
        ('delivered', 'Delivered'),
    ]
    
    tracking_id = models.CharField(max_length=100, unique=True, primary_key=True)
    warehouse = models.ForeignKey('accounts.Warehouse', on_delete=models.CASCADE, related_name='shipments', null=True, blank=True)
    bin = models.ForeignKey(Bin, on_delete=models.SET_NULL, null=True, blank=True, related_name='shipments')
    assigned_operator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_shipments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unregistered')
    manifested = models.BooleanField(default=False)
    time_in = models.DateTimeField(default=timezone.now)
    time_out = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-time_in']
    
    def __str__(self):
        return f"{self.tracking_id} - {self.status}"


class AuditLog(models.Model):
    """Audit log for tracking all actions"""
    ACTION_CHOICES = [
        ('assigned', 'Assigned'),
        ('updated', 'Updated'),
        ('dissociated', 'Dissociated'),
        ('dispatched', 'Dispatched'),
        ('delivered', 'Delivered'),
    ]
    
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='audit_logs')
    warehouse = models.ForeignKey('accounts.Warehouse', on_delete=models.CASCADE, related_name='audit_logs', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.action} - {self.shipment.tracking_id} at {self.timestamp}"
