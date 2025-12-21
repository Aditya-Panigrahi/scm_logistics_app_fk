from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BinViewSet, ShipmentViewSet, AuditLogViewSet, InboundProcessViewSet, OutboundProcessViewSet

router = DefaultRouter()
router.register(r'bins', BinViewSet, basename='bin')
router.register(r'shipments', ShipmentViewSet, basename='shipment')
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')
router.register(r'inbound', InboundProcessViewSet, basename='inbound-process')
router.register(r'outbound', OutboundProcessViewSet, basename='outbound-process')

urlpatterns = [
    path('', include(router.urls)),
]
