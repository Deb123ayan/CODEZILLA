import os
import django
import sys
import random
from decimal import Decimal

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Worker
from deliveries.models import Delivery

def assign_deliveries():
    workers = Worker.objects.all()
    if not workers.exists():
        print("No workers found in the database. Please run migrations and create some workers.")
        return

    # Categorized delivery items
    catalog = {
        'QUICK_COMMERCE': [
            {"name": "Pizza & Soda", "price": 450},
            {"name": "Burger King Combo", "price": 320},
            {"name": "Starbucks Coffee", "price": 180},
            {"name": "Sushi Platter", "price": 850},
            {"name": "Street Food Box", "price": 150},
        ],
        'GROCERY': [
            {"name": "Fresh Fruits & Veggies", "price": 1200},
            {"name": "Milk & Dairy Pack", "price": 250},
            {"name": "Cooking Oil 5L", "price": 850},
            {"name": "Housekeeping Supplies", "price": 950},
            {"name": "Baby Care Diapers", "price": 1100},
        ],
        'PARCEL': [
            {"name": "Samsung Galaxy S23", "price": 15000},
            {"name": "Levi's T-Shirt", "price": 600},
            {"name": "Nike Running Shoes", "price": 4500},
            {"name": "Office Laptop Bag", "price": 1200},
            {"name": "Premium Perfume", "price": 3500},
        ]
    }

    # Platform to Category mapping
    platform_map = {
        'Zomato': 'QUICK_COMMERCE', 'Swiggy': 'QUICK_COMMERCE',
        'Blinkit': 'GROCERY', 'Zepto': 'GROCERY',
        'Amazon': 'PARCEL', 'Flipkart': 'PARCEL'
    }

    print(f"Assigning deliveries to {workers.count()} agents...")

    for worker in workers:
        # Use title() to match the map keys (e.g. 'zomato' -> 'Zomato')
        target_category = platform_map.get(worker.platform.title(), 'PARCEL')
        available_items = catalog.get(target_category)
        
        # Blinkit gets more deliveries as requested
        num_to_assign = random.randint(10, 15) if worker.platform.lower() == 'blinkit' else random.randint(2, 5)
        print(f"Assigning {num_to_assign} new {target_category} deliveries to {worker.name} ({worker.platform})...")
        
        for _ in range(num_to_assign):
            item = random.choice(available_items)
            
            lat_offset = random.uniform(-0.015, 0.015)
            lng_offset = random.uniform(-0.015, 0.015)
            
            base_lat = worker.latitude if worker.latitude else 28.6139
            base_lng = worker.longitude if worker.longitude else 77.2090

            delivery = Delivery.objects.create(
                worker=worker,
                category=target_category,
                products=[item],
                city=worker.city if worker.city else "New Delhi",
                location=f"Society {random.randint(1,50)}, Phase {random.randint(1,3)}",
                latitude=float(base_lat) + lat_offset,
                longitude=float(base_lng) + lng_offset,
                amount=Decimal(str(item['price'])),
                status='ASSIGNED'
            )
            print(f"  - Created {target_category} delivery {delivery.id} total: INR {delivery.amount}")

    print("\n[SUCCESS] Successfully assigned platform-specific deliveries to all agents.")

if __name__ == "__main__":
    assign_deliveries()
