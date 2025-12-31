from rest_framework import serializers
from .models import Bin, Shipment, AuditLog


class BinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bin
        fields = ['bin_id', 'location', 'capacity', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ShipmentSerializer(serializers.ModelSerializer):
    bin_id = serializers.CharField(source='bin.bin_id', read_only=True)
    assigned_operator_name = serializers.CharField(source='assigned_operator.get_full_name', read_only=True, allow_null=True)
    assigned_operator_username = serializers.CharField(source='assigned_operator.username', read_only=True, allow_null=True)
    
    class Meta:
        model = Shipment
        fields = ['tracking_id', 'bin', 'bin_id', 'assigned_operator', 'assigned_operator_name', 'assigned_operator_username', 'status', 'manifested', 'time_in', 'time_out', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'time_in']


class AuditLogSerializer(serializers.ModelSerializer):
    tracking_id = serializers.CharField(source='shipment.tracking_id', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ['id', 'action', 'shipment', 'tracking_id', 'user', 'timestamp', 'details']
        read_only_fields = ['timestamp']


class ScanBinSerializer(serializers.Serializer):
    """Serializer for scanning bin"""
    bin_id = serializers.CharField(max_length=100)
    
    def validate_bin_id(self, value):
        # Accept any bin_id, will auto-create if doesn't exist
        return value


class ScanPackageSerializer(serializers.Serializer):
    """Serializer for scanning package"""
    tracking_id = serializers.CharField(max_length=100)


class AssignPackageSerializer(serializers.Serializer):
    """Serializer for assigning package to bin"""
    bin_id = serializers.CharField(max_length=100)
    tracking_id = serializers.CharField(max_length=100)


class ManifestUploadSerializer(serializers.Serializer):
    """Serializer for processing manifest upload"""
    tracking_ids = serializers.ListField(
        child=serializers.CharField(max_length=100),
        allow_empty=False
    )
    
    def validate_tracking_ids(self, value):
        if not value:
            raise serializers.ValidationError("Tracking IDs list cannot be empty")
        
        # Remove duplicates and empty strings
        cleaned_ids = list(set([tid.strip() for tid in value if tid.strip()]))
        
        if not cleaned_ids:
            raise serializers.ValidationError("No valid tracking IDs provided")
        
        return cleaned_ids


class SearchPackageSerializer(serializers.Serializer):
    """Serializer for searching package by tracking ID"""
    tracking_id = serializers.CharField(max_length=100)


class SearchBinSerializer(serializers.Serializer):
    """Serializer for searching bin contents"""
    bin_id = serializers.CharField(max_length=100)


class DissociatePackageSerializer(serializers.Serializer):
    """Serializer for dissociating package from bin"""
    tracking_id = serializers.CharField(max_length=100)
    bin_id = serializers.CharField(max_length=100)
    
    def validate(self, data):
        tracking_id = data['tracking_id']
        bin_id = data['bin_id']
        
        # Check if shipment exists
        try:
            shipment = Shipment.objects.get(tracking_id=tracking_id)
        except Shipment.DoesNotExist:
            raise serializers.ValidationError(f"Tracking ID {tracking_id} not found")
        
        # Check if shipment is in the specified bin
        if not shipment.bin or shipment.bin.bin_id != bin_id:
            raise serializers.ValidationError(
                f"Package {tracking_id} is not in bin {bin_id}"
            )
        
        # Check if already picked up
        if shipment.status == 'picked-up':
            raise serializers.ValidationError(
                f"Package {tracking_id} has already been picked up"
            )
        
        return data


class AssignOperatorSerializer(serializers.Serializer):
    """Serializer for assigning shipments to operator"""
    tracking_ids = serializers.ListField(
        child=serializers.CharField(max_length=100),
        allow_empty=False
    )
    operator_id = serializers.IntegerField()
    
    def validate_tracking_ids(self, value):
        if not value:
            raise serializers.ValidationError("Tracking IDs list cannot be empty")
        return value
