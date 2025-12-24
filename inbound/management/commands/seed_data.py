from django.core.management.base import BaseCommand
from inbound.models import Bin


class Command(BaseCommand):
    help = 'Seeds the database with sample bins'

    def handle(self, *args, **kwargs):
        # Create sample bins - L1R1B01 format (Level 1, Row 1, Bin 1)
        bins_data = [
            {'bin_id': 'L1R1B01', 'location': 'Level 1 - Row 1', 'capacity': 10, 'status': 'available'},
            {'bin_id': 'L1R1B02', 'location': 'Level 1 - Row 1', 'capacity': 10, 'status': 'available'},
            {'bin_id': 'L1R1B03', 'location': 'Level 1 - Row 1', 'capacity': 10, 'status': 'available'},
            {'bin_id': 'L1R2B01', 'location': 'Level 1 - Row 2', 'capacity': 10, 'status': 'available'},
            {'bin_id': 'L1R2B02', 'location': 'Level 1 - Row 2', 'capacity': 10, 'status': 'available'},
            {'bin_id': 'L1R2B03', 'location': 'Level 1 - Row 2', 'capacity': 10, 'status': 'available'},
            {'bin_id': 'L1R3B01', 'location': 'Level 1 - Row 3', 'capacity': 10, 'status': 'available'},
            {'bin_id': 'L1R3B02', 'location': 'Level 1 - Row 3', 'capacity': 10, 'status': 'available'},
            {'bin_id': 'L2R1B01', 'location': 'Level 2 - Row 1', 'capacity': 10, 'status': 'available'},
            {'bin_id': 'L2R1B02', 'location': 'Level 2 - Row 1', 'capacity': 10, 'status': 'available'},
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
