import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Worker
from deliveries.models import Delivery

def assign():
    try:
        w = Worker.objects.get(name__icontains='Debayan', platform__icontains='blinkit')
        items = [
            {'name': 'Fresh Fruits & Veggies', 'price': 1200},
            {'name': 'Milk & Dairy Pack', 'price': 250},
            {'name': 'Cooking Oil 5L', 'price': 850},
            {'name': 'Housekeeping Supplies', 'price': 950},
            {'name': 'Baby Care Diapers', 'price': 1100}
        ]
        
        for i in range(5):
            Delivery.objects.create(
                worker=w,
                city=w.zone.split(',')[0].strip(),
                location=w.zone,
                status='ASSIGNED',
                products=[random.choice(items)],
                amount=random.randint(400, 2000),
                category='GROCERY'
            )
        print(f"Successfully assigned 5 new grocery deliveries to {w.name} (Blinkit)")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    assign()
