from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Warehouse(models.Model):
    """Warehouse/Facility model for multi-warehouse support"""
    warehouse_id = models.CharField(max_length=50, unique=True, primary_key=True)
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=255)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['warehouse_id']
    
    def __str__(self):
        return f"{self.warehouse_id} - {self.name}"


class CustomUserManager(UserManager):
    """Custom manager to set SUPERADMIN role for superusers"""
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('role', 'SUPERADMIN')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return super().create_superuser(username, email, password, **extra_fields)


class CustomUser(AbstractUser):
    """Custom user model with warehouse and role support"""
    ROLE_CHOICES = [
        ('SUPERADMIN', 'Superadmin'),
        ('OPERATION_HEAD', 'Operation Head'),
        ('WAREHOUSE_ADMIN', 'Warehouse Admin'),
        ('OPERATOR', 'Operator'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='OPERATOR')
    
    objects = CustomUserManager()
    warehouse = models.ForeignKey(
        Warehouse, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='users'
    )
    # For superadmin to access multiple warehouses
    accessible_warehouses = models.ManyToManyField(
        Warehouse,
        related_name='superadmin_users',
        blank=True
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    employee_id = models.CharField(max_length=50, blank=True, null=True)
    
    class Meta:
        ordering = ['username']
    
    def __str__(self):
        return f"{self.username} - {self.role}"
    
    def get_accessible_warehouses(self):
        """Return list of warehouses user can access"""
        if self.role == 'SUPERADMIN':
            return list(self.accessible_warehouses.all())
        elif self.warehouse:
            return [self.warehouse]


@receiver(post_save, sender=CustomUser)
def assign_warehouses_to_superadmin(sender, instance, created, **kwargs):
    """Automatically assign all warehouses to SUPERADMIN users"""
    if instance.role == 'SUPERADMIN':
        # Assign all existing warehouses
        all_warehouses = Warehouse.objects.all()
        instance.accessible_warehouses.set(all_warehouses)


@receiver(post_save, sender=Warehouse)
def assign_warehouse_to_all_superadmins(sender, instance, created, **kwargs):
    """Automatically assign new warehouse to all SUPERADMIN users"""
    if created:
        superadmins = CustomUser.objects.filter(role='SUPERADMIN')
        for superadmin in superadmins:
            superadmin.accessible_warehouses.add(instance)
        return []
