from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, Warehouse


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ['warehouse_id', 'name', 'location', 'contact_email', 'contact_phone', 'is_active']


class UserSerializer(serializers.ModelSerializer):
    warehouse_details = WarehouseSerializer(source='warehouse', read_only=True)
    accessible_warehouses_details = WarehouseSerializer(source='accessible_warehouses', many=True, read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'warehouse', 'warehouse_details', 'accessible_warehouses_details',
            'phone_number', 'employee_id', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = CustomUser
        fields = [
            'username', 'password', 'password2', 'email', 'first_name', 
            'last_name', 'role', 'warehouse', 'phone_number', 'employee_id'
        ]
    
    def validate(self, attrs):
        # Only validate password match if password2 is provided
        password2 = attrs.get('password2')
        if password2 and attrs['password'] != password2:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Validate role-warehouse relationship
        role = attrs.get('role')
        warehouse = attrs.get('warehouse')
        
        if role != 'SUPERADMIN' and not warehouse:
            raise serializers.ValidationError({
                "warehouse": "Warehouse is required for non-superadmin users."
            })
        
        return attrs
    
    def create(self, validated_data):
        # Remove password2 if it exists
        validated_data.pop('password2', None)
        password = validated_data.pop('password')
        
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
