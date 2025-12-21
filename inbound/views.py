from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
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


class ShipmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing shipments"""
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing audit logs"""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer


class InboundProcessViewSet(viewsets.ViewSet):
    """ViewSet for handling inbound process operations"""
    
    @action(detail=False, methods=['post'])
    def scan_bin(self, request):
        """Validate and prepare bin for package assignment"""
        serializer = ScanBinSerializer(data=request.data)
        if serializer.is_valid():
            bin_id = serializer.validated_data['bin_id']
            
            # Get or create bin
            bin_obj, created = Bin.objects.get_or_create(
                bin_id=bin_id,
                defaults={
                    'location': 'Auto-created',
                    'capacity': 1,
                    'status': 'available'
                }
            )
            
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
        """Assign package to bin and create shipment record"""
        serializer = AssignPackageSerializer(data=request.data)
        if serializer.is_valid():
            bin_id = serializer.validated_data['bin_id']
            tracking_id = serializer.validated_data['tracking_id']
            
            # Get bin object
            bin_obj = Bin.objects.get(bin_id=bin_id)
            
            # Create shipment record
            shipment = Shipment.objects.create(
                tracking_id=tracking_id,
                bin=bin_obj,
                status='unregistered',
                time_in=timezone.now()
            )
            
            # Update bin status
            bin_obj.status = 'occupied'
            bin_obj.save()
            
            # Create audit log
            AuditLog.objects.create(
                action='assigned',
                shipment=shipment,
                user=request.user.username if request.user.is_authenticated else 'anonymous',
                details=f'Package {tracking_id} assigned to bin {bin_id}'
            )
            
            return Response({
                'success': True,
                'message': f'Package {tracking_id} successfully assigned to bin {bin_id}',
                'shipment': ShipmentSerializer(shipment).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def process_manifest(self, request):
        """Process manifest file and update shipment status to registered"""
        serializer = ManifestUploadSerializer(data=request.data)
        if serializer.is_valid():
            tracking_ids = serializer.validated_data['tracking_ids']
            
            updated_ids = []
            failed_ids = []
            
            for tracking_id in tracking_ids:
                try:
                    # Get shipment by tracking ID
                    shipment = Shipment.objects.get(tracking_id=tracking_id)
                    
                    # Check if already registered
                    if shipment.status == 'registered':
                        failed_ids.append({
                            'tracking_id': tracking_id,
                            'reason': 'Already registered'
                        })
                        continue
                    
                    # Update status to registered
                    shipment.status = 'registered'
                    shipment.time_registered = timezone.now()
                    shipment.save()
                    
                    # Create audit log
                    AuditLog.objects.create(
                        action='updated',
                        shipment=shipment,
                        user=request.user.username if request.user.is_authenticated else 'anonymous',
                        details=f'Status updated to registered via manifest upload'
                    )
                    
                    updated_ids.append(tracking_id)
                    
                except Shipment.DoesNotExist:
                    failed_ids.append({
                        'tracking_id': tracking_id,
                        'reason': 'Tracking ID not found in system'
                    })
                except Exception as e:
                    failed_ids.append({
                        'tracking_id': tracking_id,
                        'reason': str(e)
                    })
            
            return Response({
                'success': True,
                'message': f'Processed {len(tracking_ids)} tracking IDs',
                'total_processed': len(tracking_ids),
                'updated_count': len(updated_ids),
                'failed_count': len(failed_ids),
                'updated_ids': updated_ids,
                'failed_ids': failed_ids
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class OutboundProcessViewSet(viewsets.ViewSet):
    """ViewSet for handling outbound process operations"""
    
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
                        'time_in': shipment.time_in,
                        'time_registered': shipment.time_registered
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
                    'time_in': s.time_in,
                    'time_registered': s.time_registered
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
