from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from accounts.permissions import (
    IsOperationHeadOrAbove, CanAccessInbound, 
    CanAccessOutbound, CanAccessManifest, CanAccessInventoryDashboard
)
from .models import Bin, Shipment, AuditLog
from .serializers import (
    BinSerializer, ShipmentSerializer, AuditLogSerializer,
    ScanBinSerializer, ScanPackageSerializer, AssignPackageSerializer,
    ManifestUploadSerializer, SearchPackageSerializer, SearchBinSerializer,
    DissociatePackageSerializer
)


class BinViewSet(viewsets.ModelViewSet):
    """ViewSet for managing bins"""
    queryset = Bin.objects.all()
    serializer_class = BinSerializer
    permission_classes = [IsAuthenticated, IsOperationHeadOrAbove]
    
    def get_queryset(self):
        """Filter bins by user's warehouse or warehouse_id query param"""
        user = self.request.user
        queryset = super().get_queryset()
        
        if user.role == 'SUPERADMIN':
            # Check if warehouse_id is provided in query params
            warehouse_id = self.request.query_params.get('warehouse_id')
            if warehouse_id:
                return queryset.filter(warehouse_id=warehouse_id)
            return queryset
        elif user.warehouse:
            return queryset.filter(warehouse=user.warehouse)
        return queryset.none()


class ShipmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing shipments"""
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer
    permission_classes = [IsAuthenticated, IsOperationHeadOrAbove]
    
    def get_queryset(self):
        """Filter shipments by user's warehouse or warehouse_id query param"""
        user = self.request.user
        queryset = super().get_queryset()
        
        if user.role == 'SUPERADMIN':
            # Check if warehouse_id is provided in query params
            warehouse_id = self.request.query_params.get('warehouse_id')
            if warehouse_id:
                return queryset.filter(warehouse_id=warehouse_id)
            return queryset
        elif user.warehouse:
            return queryset.filter(warehouse=user.warehouse)
        return queryset.none()


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing audit logs"""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, CanAccessInventoryDashboard]
    
    def get_queryset(self):
        """Filter audit logs by user's warehouse or warehouse_id query param"""
        user = self.request.user
        queryset = super().get_queryset()
        
        if user.role == 'SUPERADMIN':
            # Check if warehouse_id is provided in query params
            warehouse_id = self.request.query_params.get('warehouse_id')
            if warehouse_id:
                return queryset.filter(warehouse_id=warehouse_id)
            return queryset
        elif user.warehouse:
            return queryset.filter(warehouse=user.warehouse)
        return queryset.none()


class InboundProcessViewSet(viewsets.ViewSet):
    """ViewSet for handling inbound process operations"""
    permission_classes = [IsAuthenticated, CanAccessInbound]
    
    @action(detail=False, methods=['post'])
    def scan_bin(self, request):
        """Validate and prepare bin for package assignment"""
        serializer = ScanBinSerializer(data=request.data)
        if serializer.is_valid():
            bin_id = serializer.validated_data['bin_id']
            warehouse = request.user.warehouse
            
            # Get or create bin
            bin_obj, created = Bin.objects.get_or_create(
                bin_id=bin_id,
                defaults={
                    'warehouse': warehouse,
                    'location': 'Auto-created',
                    'capacity': 1,
                    'status': 'available'
                }
            )
            
            # Check if bin belongs to user's warehouse
            if bin_obj.warehouse != warehouse:
                return Response({
                    'success': False,
                    'errors': {'bin_id': [f'Bin {bin_id} belongs to a different warehouse.']}
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check if bin is available
            if bin_obj.status != 'available':
                return Response({
                    'success': False,
                    'errors': {'bin_id': [f'Bin {bin_id} is not available. Status: {bin_obj.status}']}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            message = f'Bin {bin_id} is ready for assignment'
            if created:
                message = f'New bin {bin_id} created and ready for assignment'
            
            return Response({
                'success': True,
                'message': message,
                'bin': BinSerializer(bin_obj).data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def scan_package(self, request):
        """Validate tracking ID"""
        serializer = ScanPackageSerializer(data=request.data)
        if serializer.is_valid():
            tracking_id = serializer.validated_data['tracking_id']
            return Response({
                'success': True,
                'message': f'Tracking ID {tracking_id} is valid and ready for assignment',
                'tracking_id': tracking_id
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def assign(self, request):
        """Assign package to bin and create/update shipment record"""
        serializer = AssignPackageSerializer(data=request.data)
        if serializer.is_valid():
            bin_id = serializer.validated_data['bin_id']
            tracking_id = serializer.validated_data['tracking_id']
            warehouse = request.user.warehouse
            
            # Get bin object
            bin_obj = Bin.objects.get(bin_id=bin_id)
            
            # Check if bin belongs to user's warehouse
            if bin_obj.warehouse != warehouse:
                return Response({
                    'success': False,
                    'errors': {'bin_id': [f'Bin {bin_id} belongs to a different warehouse.']}
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check bin capacity
            current_shipments_count = Shipment.objects.filter(bin=bin_obj, status='putaway').count()
            if current_shipments_count >= bin_obj.capacity:
                return Response({
                    'success': False,
                    'errors': {'bin_id': [f'Bin {bin_id} is at full capacity ({bin_obj.capacity}). Cannot assign more packages.']},
                    'capacity_exceeded': True
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if shipment exists (from manifest)
            try:
                shipment = Shipment.objects.get(tracking_id=tracking_id)
                # Existing shipment - update it
                shipment.bin = bin_obj
                shipment.warehouse = warehouse
                shipment.status = 'putaway'
                shipment.save()
                
                was_manifested = shipment.manifested
            except Shipment.DoesNotExist:
                # New shipment - not from manifest
                shipment = Shipment.objects.create(
                    tracking_id=tracking_id,
                    bin=bin_obj,
                    warehouse=warehouse,
                    status='putaway',
                    manifested=False,
                    time_in=timezone.now()
                )
                was_manifested = False
            
            # Update bin status if needed
            if current_shipments_count + 1 >= bin_obj.capacity:
                bin_obj.status = 'occupied'
                bin_obj.save()
            
            # Create audit log
            AuditLog.objects.create(
                action='assigned',
                shipment=shipment,
                warehouse=warehouse,
                user=request.user,
                details=f'Package {tracking_id} assigned to bin {bin_id}'
            )
            
            return Response({
                'success': True,
                'message': f'Package {tracking_id} successfully assigned to bin {bin_id}',
                'shipment': ShipmentSerializer(shipment).data,
                'bin_capacity_used': current_shipments_count + 1,
                'bin_capacity_total': bin_obj.capacity,
                'was_manifested': was_manifested
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def process_manifest(self, request):
        """Process manifest file and create/update shipment records with manifested status"""
        serializer = ManifestUploadSerializer(data=request.data)
        if serializer.is_valid():
            tracking_ids = serializer.validated_data['tracking_ids']
            
            created_ids = []
            updated_ids = []
            failed_ids = []
            
            for tracking_id in tracking_ids:
                try:
                    # Get or create shipment by tracking ID
                    shipment, created = Shipment.objects.get_or_create(
                        tracking_id=tracking_id,
                        defaults={
                            'status': 'manifested',
                            'manifested': True,
                            'time_in': timezone.now()
                        }
                    )
                    
                    if created:
                        # Create audit log for new shipment
                        AuditLog.objects.create(
                            action='updated',
                            shipment=shipment,
                            user=request.user.username if request.user.is_authenticated else 'anonymous',
                            details=f'Shipment created with manifested status via manifest upload'
                        )
                        created_ids.append(tracking_id)
                    else:
                        # Update existing shipment
                        shipment.status = 'manifested'
                        shipment.manifested = True
                        shipment.save()
                        
                        # Create audit log
                        AuditLog.objects.create(
                            action='updated',
                            shipment=shipment,
                            user=request.user.username if request.user.is_authenticated else 'anonymous',
                            details=f'Status updated to manifested via manifest upload'
                        )
                        updated_ids.append(tracking_id)
                    
                except Exception as e:
                    failed_ids.append({
                        'tracking_id': tracking_id,
                        'reason': str(e)
                    })
            
            return Response({
                'success': True,
                'message': f'Processed {len(tracking_ids)} tracking IDs',
                'total_processed': len(tracking_ids),
                'created_count': len(created_ids),
                'updated_count': len(updated_ids),
                'failed_count': len(failed_ids),
                'created_ids': created_ids,
                'updated_ids': updated_ids,
                'failed_ids': failed_ids
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class OutboundProcessViewSet(viewsets.ViewSet):
    """ViewSet for handling outbound process operations"""
    permission_classes = [IsAuthenticated, CanAccessOutbound]
    
    @action(detail=False, methods=['post'])
    def search_package(self, request):
        """Search for package by tracking ID"""
        serializer = SearchPackageSerializer(data=request.data)
        if serializer.is_valid():
            tracking_id = serializer.validated_data['tracking_id']
            
            try:
                shipment = Shipment.objects.select_related('bin').get(tracking_id=tracking_id)
                
                # Get bin information
                bin_info = None
                if shipment.bin:
                    bin_info = {
                        'bin_id': shipment.bin.bin_id,
                        'location': shipment.bin.location,
                        'status': shipment.bin.status
                    }
                
                return Response({
                    'success': True,
                    'package': {
                        'tracking_id': shipment.tracking_id,
                        'status': shipment.status,
                        'bin': bin_info,
                        'time_in': shipment.time_in
                    }
                }, status=status.HTTP_200_OK)
                
            except Shipment.DoesNotExist:
                return Response({
                    'success': False,
                    'errors': {'tracking_id': [f'Package {tracking_id} not found in system']}
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def search_bin(self, request):
        """Search for all packages in a bin"""
        serializer = SearchBinSerializer(data=request.data)
        if serializer.is_valid():
            bin_id = serializer.validated_data['bin_id']
            
            try:
                bin_obj = Bin.objects.get(bin_id=bin_id)
                
                # Get all shipments in this bin
                shipments = Shipment.objects.filter(bin=bin_obj)
                
                packages = [{
                    'tracking_id': s.tracking_id,
                    'status': s.status,
                    'time_in': s.time_in
                } for s in shipments]
                
                return Response({
                    'success': True,
                    'bin': {
                        'bin_id': bin_obj.bin_id,
                        'location': bin_obj.location,
                        'status': bin_obj.status,
                        'capacity': bin_obj.capacity
                    },
                    'packages': packages,
                    'package_count': len(packages)
                }, status=status.HTTP_200_OK)
                
            except Bin.DoesNotExist:
                return Response({
                    'success': False,
                    'errors': {'bin_id': [f'Bin {bin_id} not found in system']}
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def dissociate(self, request):
        """Dissociate package from bin (pickup)"""
        serializer = DissociatePackageSerializer(data=request.data)
        if serializer.is_valid():
            tracking_id = serializer.validated_data['tracking_id']
            bin_id = serializer.validated_data['bin_id']
            
            # Get shipment and bin
            shipment = Shipment.objects.get(tracking_id=tracking_id)
            bin_obj = shipment.bin
            
            # Clear bin association and update status
            shipment.bin = None
            shipment.status = 'picked-up'
            shipment.time_out = timezone.now()
            shipment.save()
            
            # Update bin status to available if no more packages
            remaining_packages = Shipment.objects.filter(bin=bin_obj).count()
            if remaining_packages == 0:
                bin_obj.status = 'available'
                bin_obj.save()
            
            # Create audit log
            AuditLog.objects.create(
                action='dissociated',
                shipment=shipment,
                user=request.user.username if request.user.is_authenticated else 'anonymous',
                details=f'Package {tracking_id} picked up from bin {bin_id}'
            )
            
            return Response({
                'success': True,
                'message': f'Package {tracking_id} successfully picked up from bin {bin_id}',
                'package': {
                    'tracking_id': shipment.tracking_id,
                    'status': shipment.status,
                    'time_out': shipment.time_out
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def get_bin_packages(self, request):
        """Get all putaway packages in a bin for pickup"""
        serializer = SearchBinSerializer(data=request.data)
        if serializer.is_valid():
            bin_id = serializer.validated_data['bin_id']
            
            try:
                bin_obj = Bin.objects.get(bin_id=bin_id)
                
                # Get all shipments in putaway status in this bin
                shipments = Shipment.objects.filter(bin=bin_obj, status__in=['putaway', 'picked'])
                
                packages = [{
                    'tracking_id': s.tracking_id,
                    'status': s.status,
                    'manifested': s.manifested,
                    'time_in': s.time_in
                } for s in shipments]
                
                return Response({
                    'success': True,
                    'bin': {
                        'bin_id': bin_obj.bin_id,
                        'location': bin_obj.location,
                        'status': bin_obj.status,
                        'capacity': bin_obj.capacity
                    },
                    'packages': packages,
                    'package_count': len(packages)
                }, status=status.HTTP_200_OK)
                
            except Bin.DoesNotExist:
                return Response({
                    'success': False,
                    'errors': {'bin_id': [f'Bin {bin_id} not found in system']}
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def pickup_package(self, request):
        """Mark package as picked after tracking ID verification"""
        tracking_id = request.data.get('tracking_id')
        expected_tracking_id = request.data.get('expected_tracking_id')
        
        if not tracking_id or not expected_tracking_id:
            return Response({
                'success': False,
                'errors': {'non_field_errors': ['Both tracking IDs are required']}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify tracking IDs match
        if tracking_id.strip().upper() != expected_tracking_id.strip().upper():
            return Response({
                'success': False,
                'errors': {'tracking_id': ['Tracking ID does not match. Please scan the correct package.']},
                'mismatch': True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            shipment = Shipment.objects.get(tracking_id=expected_tracking_id.strip().upper())
            
            if shipment.status != 'putaway':
                return Response({
                    'success': False,
                    'errors': {'tracking_id': [f'Package status is {shipment.status}, not available for pickup']}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update status to picked
            shipment.status = 'picked'
            shipment.save()
            
            # Create audit log
            AuditLog.objects.create(
                action='updated',
                shipment=shipment,
                user=request.user.username if request.user.is_authenticated else 'anonymous',
                details=f'Package {shipment.tracking_id} marked as picked'
            )
            
            return Response({
                'success': True,
                'message': f'Package {shipment.tracking_id} marked as picked',
                'package': {
                    'tracking_id': shipment.tracking_id,
                    'status': shipment.status
                }
            }, status=status.HTTP_200_OK)
            
        except Shipment.DoesNotExist:
            return Response({
                'success': False,
                'errors': {'tracking_id': [f'Package {expected_tracking_id} not found in system']}
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def dispatch_packages(self, request):
        """Dispatch all picked packages from bin after bin ID verification"""
        bin_id = request.data.get('bin_id')
        expected_bin_id = request.data.get('expected_bin_id')
        
        if not bin_id or not expected_bin_id:
            return Response({
                'success': False,
                'errors': {'non_field_errors': ['Both bin IDs are required']}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify bin IDs match
        if bin_id.strip().upper() != expected_bin_id.strip().upper():
            return Response({
                'success': False,
                'errors': {'bin_id': ['Bin ID does not match. Please scan the correct bin.']},
                'mismatch': True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            bin_obj = Bin.objects.get(bin_id=expected_bin_id.strip().upper())
            
            # Get all picked packages in this bin
            picked_shipments = Shipment.objects.filter(bin=bin_obj, status='picked')
            
            if not picked_shipments.exists():
                return Response({
                    'success': False,
                    'errors': {'bin_id': ['No picked packages found in this bin']}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            dispatched_count = 0
            dispatched_ids = []
            
            for shipment in picked_shipments:
                shipment.status = 'dispatched'
                shipment.time_out = timezone.now()
                shipment.bin = None  # Remove bin association
                shipment.save()
                
                # Create audit log
                AuditLog.objects.create(
                    action='dispatched',
                    shipment=shipment,
                    user=request.user.username if request.user.is_authenticated else 'anonymous',
                    details=f'Package {shipment.tracking_id} dispatched from bin {bin_obj.bin_id}'
                )
                
                dispatched_count += 1
                dispatched_ids.append(shipment.tracking_id)
            
            # Check if bin is now empty and update status
            remaining_packages = Shipment.objects.filter(bin=bin_obj).count()
            if remaining_packages == 0:
                bin_obj.status = 'available'
                bin_obj.save()
            
            return Response({
                'success': True,
                'message': f'Successfully dispatched {dispatched_count} packages from bin {bin_obj.bin_id}',
                'dispatched_count': dispatched_count,
                'dispatched_ids': dispatched_ids,
                'bin_status': bin_obj.status
            }, status=status.HTTP_200_OK)
            
        except Bin.DoesNotExist:
            return Response({
                'success': False,
                'errors': {'bin_id': [f'Bin {expected_bin_id} not found in system']}
            }, status=status.HTTP_404_NOT_FOUND)    
    @action(detail=False, methods=['post'])
    def process_picklist_file(self, request):
        """Process uploaded CSV/JSON file to create picklist"""
        import csv
        import json
        from io import TextIOWrapper
        
        if 'file' not in request.FILES:
            return Response({
                'success': False,
                'error': 'No file uploaded'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = request.FILES['file']
        file_extension = uploaded_file.name.split('.')[-1].lower()
        
        tracking_ids = []
        
        try:
            if file_extension == 'csv':
                # Parse CSV file
                file_data = TextIOWrapper(uploaded_file.file, encoding='utf-8')
                csv_reader = csv.reader(file_data)
                
                # Skip header if present
                header = next(csv_reader, None)
                
                for row in csv_reader:
                    if row and row[0].strip():
                        tracking_ids.append(row[0].strip().upper())
                        
            elif file_extension == 'json':
                # Parse JSON file
                file_data = uploaded_file.read().decode('utf-8')
                json_data = json.loads(file_data)
                
                # Handle both array and object with tracking_ids key
                if isinstance(json_data, list):
                    tracking_ids = [str(item).strip().upper() for item in json_data]
                elif isinstance(json_data, dict) and 'tracking_ids' in json_data:
                    tracking_ids = [str(item).strip().upper() for item in json_data['tracking_ids']]
                else:
                    return Response({
                        'success': False,
                        'error': 'Invalid JSON format. Expected array or object with "tracking_ids" key'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'success': False,
                    'error': 'Unsupported file format. Please upload CSV or JSON file'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not tracking_ids:
                return Response({
                    'success': False,
                    'error': 'No tracking IDs found in file'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Process tracking IDs
            processed_packages = []
            not_found = []
            
            for tracking_id in tracking_ids:
                try:
                    shipment = Shipment.objects.select_related('bin').get(tracking_id=tracking_id)
                    
                    # Only process if status is putaway
                    if shipment.status == 'putaway':
                        # Update status to picklist-created
                        shipment.status = 'picklist-created'
                        shipment.save()
                        
                        # Create audit log
                        AuditLog.objects.create(
                            action='updated',
                            shipment=shipment,
                            user=request.user.username if request.user.is_authenticated else 'anonymous',
                            details=f'Package {tracking_id} added to picklist'
                        )
                        
                        processed_packages.append({
                            'tracking_id': shipment.tracking_id,
                            'bin_id': shipment.bin.bin_id if shipment.bin else None,
                            'status': shipment.status
                        })
                    else:
                        not_found.append(f'{tracking_id} (status: {shipment.status})')
                        
                except Shipment.DoesNotExist:
                    not_found.append(tracking_id)
            
            return Response({
                'success': True,
                'packages': processed_packages,
                'found_count': len(processed_packages),
                'not_found': not_found,
                'not_found_count': len(not_found)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error processing file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def dispatch_single_package(self, request):
        """Dispatch a single package after tracking ID verification"""
        tracking_id = request.data.get('tracking_id')
        
        if not tracking_id:
            return Response({
                'success': False,
                'error': 'Tracking ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            shipment = Shipment.objects.select_related('bin').get(tracking_id=tracking_id.strip().upper())
            
            if shipment.status != 'picklist-created':
                return Response({
                    'success': False,
                    'error': f'Package status is {shipment.status}, cannot dispatch'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Store bin info before clearing
            bin_id = shipment.bin.bin_id if shipment.bin else None
            bin_obj = shipment.bin
            
            # Update shipment status and clear bin
            shipment.status = 'dispatched'
            shipment.time_out = timezone.now()
            shipment.bin = None
            shipment.save()
            
            # Update bin status if empty
            if bin_obj:
                remaining_packages = Shipment.objects.filter(bin=bin_obj).count()
                if remaining_packages == 0:
                    bin_obj.status = 'available'
                    bin_obj.save()
            
            # Create audit log
            AuditLog.objects.create(
                action='dispatched',
                shipment=shipment,
                user=request.user.username if request.user.is_authenticated else 'anonymous',
                details=f'Package {tracking_id} dispatched from picklist (bin: {bin_id})'
            )
            
            return Response({
                'success': True,
                'message': f'Package {tracking_id} dispatched successfully',
                'package': {
                    'tracking_id': shipment.tracking_id,
                    'status': shipment.status,
                    'bin_id': bin_id
                }
            }, status=status.HTTP_200_OK)
            
        except Shipment.DoesNotExist:
            return Response({
                'success': False,
                'error': f'Package {tracking_id} not found in system'
            }, status=status.HTTP_404_NOT_FOUND)