import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from users.models import Worker
from policies.models import Policy
from events.models import Event
from claims.models import Claim
from ai_engine.risk_calculator import audit_claim_for_fraud

class Command(BaseCommand):
    help = 'Simulates workers, policies, events, and claims with ML-based fraud detection'

    def handle(self, *args, **options):
        self.stdout.write(self.style.HTTP_INFO("Starting claim simulation script..."))

        # 1. Seed Sample Workers
        zones = ["Salt Lake", "Park Street", "New Town", "Gariahat"]
        
        worker_data = [
            {"name": "Ramesh Kumar", "phone": "9876543210", "zone": "Salt Lake", "platform": "Zomato", "city": "Kolkata"},
            {"name": "Suresh Das", "phone": "9876543211", "zone": "Park Street", "platform": "Swiggy", "city": "Kolkata"},
            {"name": "Priya Singh", "phone": "9876543212", "zone": "New Town", "platform": "Blinkit", "city": "Kolkata"},
            {"name": "Amit Shah", "phone": "9876543213", "zone": "Gariahat", "platform": "Amazon", "city": "Kolkata"},
            {"name": "Vikram Seth", "phone": "9876543214", "zone": "Salt Lake", "platform": "Swiggy", "city": "Kolkata"},
            {"name": "Anita Roy", "phone": "9876543215", "zone": "New Town", "platform": "Zomato", "city": "Kolkata"},
        ]

        created_workers = []
        for wd in worker_data:
            worker, created = Worker.objects.get_or_create(
                phone=wd["phone"],
                defaults={
                    "name": wd["name"],
                    "zone": wd["zone"],
                    "platform": wd["platform"],
                    "city": wd["city"],
                    "avg_daily_income": random.randint(600, 1500)
                }
            )
            if created:
                self.stdout.write(f"  [+] Created worker: {worker.name} in {worker.zone}")
            else:
                # Ensure they have a proper zone for the simulation if they already exist
                worker.zone = wd["zone"]
                worker.save()
            created_workers.append(worker)

        # 2. Assign Active Policies
        for worker in created_workers:
            policy, created = Policy.objects.get_or_create(
                worker=worker,
                status='ACTIVE',
                defaults={
                    "weekly_premium": random.randint(80, 200),
                    "coverage_limit": worker.avg_daily_income * 5,
                    "start_date": date.today() - timedelta(days=15),
                    "end_date": date.today() + timedelta(days=15),
                }
            )
            if created:
                self.stdout.write(f"  [+] Activated insurance policy for {worker.name}")

        # 3. Simulate Environmental Events
        simulated_events = [
            {"type": "WEATHER", "zone": "Salt Lake", "severity": 140}, # Extreme Rain
            {"type": "AQI", "zone": "New Town", "severity": 480},      # Hazardous Air
            {"type": "WEATHER", "zone": "Park Street", "severity": 115}, # Heavy Rain
        ]

        for ed in simulated_events:
            event = Event.objects.create(
                type=ed["type"],
                zone=ed["zone"],
                severity=ed["severity"]
            )
            self.stdout.write(self.style.SUCCESS(f"\n[EVENT] {event.type} triggered in {event.zone} (Severity: {event.severity})"))

            # 4. Process Claims for Event
            self.process_claims_for_event(event)

        self.stdout.write(self.style.SUCCESS("\nSimulation complete. All claims processed through ML Audit pipeline."))

    def process_claims_for_event(self, event):
        # Find workers in this zone with active policies
        workers = Worker.objects.filter(zone=event.zone)
        
        claims_count = 0
        for worker in workers:
            active_policy = Policy.objects.filter(worker=worker, status='ACTIVE').first()
            if active_policy:
                # Calculate compensation
                lost_hours = random.randint(4, 10)
                hourly_income = worker.avg_daily_income / 8
                compensation = int(hourly_income * lost_hours)
                
                claim = Claim.objects.create(
                    worker=worker,
                    event=event,
                    lost_hours=lost_hours,
                    compensation=compensation,
                    status='PENDING'
                )
                self.stdout.write(f"    - Claim created for {worker.name}: Rs.{compensation} ({lost_hours} hrs lost)")
                
                # 5. ML-Based Fraud Detection Audit
                # We simulate distance - some workers might be "far" from their zone, triggering fraud alerts
                is_fraud_test = random.random() < 0.2 # 20% chance of simulating a "far away" worker
                distance = random.uniform(15, 30) if is_fraud_test else random.uniform(0.1, 4.0)
                
                self.stdout.write(f"      Running ML Audit (Distance: {distance:.2f}km)...")
                
                passed_audit = audit_claim_for_fraud(
                    lost_hours=claim.lost_hours,
                    compensation=claim.compensation,
                    distance_km=distance
                )
                
                if passed_audit:
                    claim.status = 'PAID'
                    claim.save()
                    self.stdout.write(self.style.SUCCESS(f"      [v] ML Audit Passed: Payout processed."))
                else:
                    self.stdout.write(self.style.WARNING(f"      [!] ML Audit Failed: Potential anomaly detected. Flagged for review."))
                
                claims_count += 1
        
        if claims_count == 0:
            self.stdout.write("    No active policyholders found in this zone.")
