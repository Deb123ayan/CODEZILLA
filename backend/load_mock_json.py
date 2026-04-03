import os
import django
import json
from datetime import datetime

import sys
# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from users.models import MockPlatformData

def load_mock_data():
    json_path = 'mock_platform_users.json'
    
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print(f"Loading {len(data)} records...")
    
    # Optional: Clear existing data first to prevent duplicates
    count = MockPlatformData.objects.all().count()
    if count > 0:
        print(f"Clearing {count} existing records...")
        MockPlatformData.objects.all().delete()
        
    to_create = []
    for entry in data:
        fields = entry['fields']
        # Convert date string to date object if needed, but Django handles strings too
        to_create.append(MockPlatformData(
            platform=fields.get('platform'),
            phone=fields.get('phone'),
            partner_id=fields.get('partner_id'),
            name=fields.get('name'),
            city=fields.get('city', 'Bangalore'),
            zone=fields.get('zone'),
            weekly_earnings=fields.get('weekly_earnings', 0),
            total_deliveries=fields.get('total_deliveries', 0),
            rating=fields.get('rating', 4.5),
            vehicle_type=fields.get('vehicle_type', 'Bike'),
            joined_date=fields.get('joined_date', datetime.now().date()),
            is_active=fields.get('is_active', True),
            aadhaar_number=fields.get('aadhaar_number'),
            pan_number=fields.get('pan_number')
        ))
        
        # Bulk create in chunks to avoid memory issues with 12k records
        if len(to_create) >= 500:
            MockPlatformData.objects.bulk_create(to_create)
            to_create = []
            
    if to_create:
        MockPlatformData.objects.bulk_create(to_create)
        
    print("Done! All mock data loaded successfully.")

if __name__ == "__main__":
    load_mock_data()
