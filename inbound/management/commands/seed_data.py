from django.core.management.base import BaseCommand
from inbound.models import Bin


class Command(BaseCommand):
    help = 'Seeds the database with sample bins'

    def handle(self, *args, **kwargs):
        # Create sample bins
        bins_data = [
            {'bin_id': 'BIN-A001', 'location': 'Warehouse A - Row 1', 'capacity': 1, 'status': 'available'},
            {'bin_id': 'BIN-A002', 'location': 'Warehouse A - Row 1', 'capacity': 1, 'status': 'available'},
            {'bin_id': 'BIN-A003', 'location': 'Warehouse A - Row 2', 'capacity': 1, 'status': 'available'},
            {'bin_id': 'BIN-B001', 'location': 'Warehouse B - Row 1', 'capacity': 1, 'status': 'available'},
            {'bin_id': 'BIN-B002', 'location': 'Warehouse B - Row 1', 'capacity': 1, 'status': 'available'},
            {'bin_id': 'BIN-B003', 'location': 'Warehouse B - Row 2', 'capacity': 1, 'status': 'available'},
            {'bin_id': 'BIN-C001', 'location': 'Warehouse C - Row 1', 'capacity': 1, 'status': 'available'},
            {'bin_id': 'BIN-C002', 'location': 'Warehouse C - Row 1', 'capacity': 1, 'status': 'available'},
        ]
        
        for bin_data in bins_data:
            bin_obj, created = Bin.objects.get_or_create(
                bin_id=bin_data['bin_id'],
                defaults={
                    'location': bin_data['location'],
                    'capacity': bin_data['capacity'],
                    'status': bin_data['status']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created bin: {bin_obj.bin_id}'))
            else:
                self.stdout.write(self.style.WARNING(f'Bin already exists: {bin_obj.bin_id}'))
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
