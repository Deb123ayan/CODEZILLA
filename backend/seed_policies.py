import os
import django
import sys
import random
from datetime import date, timedelta

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Worker
from policies.models import Policy

def seed_policies():
    workers = Worker.objects.all()
    if not workers.exists():
        print("No workers found. Please register some workers first.")
        return

    platforms = ['Zomato', 'Swiggy', 'Blinkit', 'Amazon', 'Flipkart', 'Zepto']
    plans = ['STANDARD', 'PREMIUM']
    
    for worker in workers:
        # Create 1-2 policies for each worker
        num_policies = random.randint(1, 2)
        for i in range(num_policies):
            plan = random.choice(plans)
            status = 'ACTIVE' if i == 0 else 'EXPIRED'
            
            # Use worker's platform for branding
            platform = worker.platform
            
            premium = random.randint(30, 60)
            coverage = random.randint(1000, 3000)
            
            start_date = date.today() - timedelta(days=random.randint(0, 30))
            end_date = start_date + timedelta(days=7)
            
            Policy.objects.get_or_create(
                worker=worker,
                platform=platform,
                plan_type=plan,
                weekly_premium=premium,
                coverage_limit=coverage,
                start_date=start_date,
                end_date=end_date,
                status=status
            )
            print(f"Added {plan} policy for worker {worker.name} ({platform})")

if __name__ == "__main__":
    seed_policies()
