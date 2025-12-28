from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, UserViewSet, WarehouseViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')

urlpatterns = [
    path('auth/register/', AuthViewSet.as_view({'post': 'register'}), name='auth-register'),
    path('auth/login/', AuthViewSet.as_view({'post': 'login'}), name='auth-login'),
    path('auth/me/', AuthViewSet.as_view({'get': 'me'}), name='auth-me'),
    path('auth/change-password/', AuthViewSet.as_view({'post': 'change_password'}), name='auth-change-password'),
    path('', include(router.urls)),
]
