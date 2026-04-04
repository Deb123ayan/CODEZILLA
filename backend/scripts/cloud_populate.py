import os
import django
import secrets

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Worker, MockPlatformData
from django.contrib.auth.models import User

import json

def populate():
    # Load all 600 records from the JSON file
    file_path = 'mock_platform_users.json'
    with open(file_path, 'r') as f:
        data = json.load(f)
        
    print(f"Reading {len(data)} items from {file_path}...")
    
    count = 0
    for item in data:
        if item['model'] == 'users.mockplatformdata':
            m, created = MockPlatformData.objects.get_or_create(
                phone=item['fields']['phone'],
                defaults=item['fields']
            )
            
            # Create User for this entry
            user, created_user = User.objects.get_or_create(username=m.phone)
            if created_user:
                user.set_password('password123')
                user.save()
                
            # Create Worker for this entry
            worker, created_worker = Worker.objects.get_or_create(
                phone=m.phone,
                defaults={
                    'user': user,
                    'name': m.name,
                    'platform': m.platform,
                    'partner_id': m.partner_id,
                    'weekly_earnings': m.weekly_earnings,
                    'zone': m.zone,
                    'city': m.city,
                    'aadhaar_number': m.aadhaar_number,
                    'pan_number': m.pan_number,
                    'onboarding_completed': True,
                    'is_verified': True,
                    'total_deliveries': m.total_deliveries,
                }
            )
            
            if created_worker:
                count += 1
                if count % 50 == 0:
                    print(f"Progress: {count} workers created...")
                    
    print(f"\nFinal sync complete! Total workers in cloud: {Worker.objects.count()}")

if __name__ == "__main__":
    populate()
