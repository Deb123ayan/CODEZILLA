import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import MockPlatformData
import datetime

# Basic Indian Names
FIRST_NAMES = ["Rahul", "Amit", "Priya", "Vikram", "Sneha", "Rohan", "Sanjay", "Neha", "Pooja", "Arun", 
               "Kavita", "Deepak", "Ravi", "Anjali", "Suresh", "Ramesh", "Kiran", "Meera", "Manoj", "Anita",
               "Gaurav", "Sunil", "Vivek", "Preeti", "Karthik", "Swati", "Nitin", "Anil", "Varun", "Shruti"]
LAST_NAMES = ["Sharma", "Singh", "Patel", "Reddy", "Gupta", "Kumar", "Rao", "Nair", "Iyer", "Joshi",
              "Verma", "Chowdhury", "Das", "Menon", "Bose", "Pillai", "Ahluwalia", "Dubey", "Yadav", "Ghosh"]
              
PLATFORMS = ["Zomato", "Swiggy", "Zepto", "Blinkit", "Amazon", "Flipkart"]
ZONES = ["Koramangala, Bangalore", "Indiranagar, Bangalore", "Whitefield, Bangalore", 
         "HSR Layout, Bangalore", "BTM Layout, Bangalore", "Electronic City, Bangalore",
         "Malleshwaram, Bangalore", "Jayanagar, Bangalore", "Marathahalli, Bangalore", "Bellandur, Bangalore"]
VEHICLES = ["Bike", "Scooter", "Cycle", "Bike"]

class Command(BaseCommand):
    help = 'Seeds the database with 100 mock platform users for each platform.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting existing MockPlatformData...")
        MockPlatformData.objects.all().delete()
        
        self.stdout.write("Generating new mock data (100 per platform)...")
        
        # We need unique phone numbers
        phone_counter = 9876500000
        
        records_to_create = []
        now = timezone.now()
        
        for platform in PLATFORMS:
            prefix = platform[:3].upper()
            
            for _ in range(100):
                phone_counter += 1
                phone_num = str(phone_counter)
                
                name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
                partner_id = f"{prefix}{random.randint(10000, 99999)}"
                zone = random.choice(ZONES)
                earnings = random.randint(2500, 8500)
                deliveries = random.randint(10, 500)
                rating = round(random.uniform(3.5, 5.0), 1)
                vehicle = random.choice(VEHICLES)
                joined_days_ago = random.randint(10, 1000)
                
                records_to_create.append(
                    MockPlatformData(
                        platform=platform,
                        phone=phone_num,
                        partner_id=partner_id,
                        name=name,
                        zone=zone,
                        weekly_earnings=earnings,
                        total_deliveries=deliveries,
                        rating=rating,
                        vehicle_type=vehicle,
                        city="Bangalore",
                        joined_date=now - datetime.timedelta(days=joined_days_ago),
                        is_active=True
                    )
                )
        
        MockPlatformData.objects.bulk_create(records_to_create)
        self.stdout.write(self.style.SUCCESS(f"Successfully created {len(records_to_create)} mock platform records!"))
        self.stdout.write(self.style.SUCCESS(f"Phone numbers range from 9876500001 to {phone_counter}."))
