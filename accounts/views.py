from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser, Warehouse
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, 
    ChangePasswordSerializer, WarehouseSerializer
)


class AuthViewSet(viewsets.ViewSet):
    """ViewSet for authentication operations"""
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new user"""
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login user and return JWT tokens"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            user = authenticate(username=username, password=password)
            
            if user is not None:
                if user.is_active:
                    refresh = RefreshToken.for_user(user)
                    
                    return Response({
                        'user': UserSerializer(user).data,
                        'tokens': {
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                        }
                    })
                else:
                    return Response(
                        {'error': 'User account is disabled.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                return Response(
                    {'error': 'Invalid credentials.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current user details"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'Wrong password.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({'message': 'Password updated successfully.'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user management"""
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter users based on role"""
        user = self.request.user
        queryset = super().get_queryset()
        
        if user.role == 'SUPERADMIN':
            # Superadmin can see all users
            return queryset
        elif user.role in ['WAREHOUSE_ADMIN', 'OPERATION_HEAD']:
            # Warehouse admin can see users in their warehouse
            return queryset.filter(warehouse=user.warehouse)
        else:
            # Operators can only see themselves
            return queryset.filter(id=user.id)
    
    def get_serializer_class(self):
        """Use RegisterSerializer for create, UserSerializer for others"""
        if self.action == 'create':
            return RegisterSerializer
        return UserSerializer
    
    def perform_create(self, serializer):
        """Only superadmin and warehouse admin can create users"""
        user = self.request.user
        if user.role not in ['SUPERADMIN', 'WAREHOUSE_ADMIN']:
            raise permissions.PermissionDenied("You don't have permission to create users.")
        serializer.save()
    
    def perform_update(self, serializer):
        """Handle password updates separately"""
        user = self.request.user
        if user.role not in ['SUPERADMIN', 'WAREHOUSE_ADMIN']:
            raise permissions.PermissionDenied("You don't have permission to update users.")
        
        # If password is in the data, hash it properly
        if 'password' in self.request.data and self.request.data['password']:
            instance = serializer.save()
            instance.set_password(self.request.data['password'])
            instance.save()
        else:
            serializer.save()


class WarehouseViewSet(viewsets.ModelViewSet):
    """ViewSet for warehouse management"""
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter warehouses based on user role"""
        user = self.request.user
        queryset = super().get_queryset()
        
        if user.role == 'SUPERADMIN':
            return queryset
        elif user.warehouse:
            return queryset.filter(warehouse_id=user.warehouse.warehouse_id)
        return queryset.none()
    
    def perform_create(self, serializer):
        """Only superadmin can create warehouses"""
        if self.request.user.role != 'SUPERADMIN':
            raise permissions.PermissionDenied("Only superadmin can create warehouses.")
        serializer.save()
