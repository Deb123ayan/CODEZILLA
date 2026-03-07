"""
simulate_weekly_claim.py
========================
Simulates a complete one-week journey for a single gig worker:
  1. Create a Worker and Policy (if not already existing).
  2. Generate 7 days of realistic environment data (weather / AQI / curfew).
  3. For each day, check if the event qualifies for a claim.
  4. Calculate total compensation.
  5. Persist everything to the database and print a detailed report.

Run from the backend directory:
    python simulate_weekly_claim.py
"""

import os
import sys
import django
import random
from datetime import date, timedelta, datetime

# ── Django setup ──────────────────────────────────────────────────────────────
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

# ── Model imports (after django.setup) ───────────────────────────────────────
from django.contrib.auth.models import User
from users.models import Worker
from policies.models import Policy
from events.models import Event
from claims.models import Claim

# ═════════════════════════════════════════════════════════════════════════════
# CONFIGURATION — adjust freely
# ═════════════════════════════════════════════════════════════════════════════
WORKER_PHONE    = "+91SIM002"
WORKER_NAME     = "Arjun Sharma"
PLATFORM        = "Swiggy"
PARTNER_ID      = "SWG847321"
ZONE            = "Indiranagar, Bangalore"
CITY            = "Bangalore"
WEEKLY_EARNINGS = 4500        # ₹
WORKING_HOURS   = 8           # hours / day
WORKING_DAYS    = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
VEHICLE_TYPE    = "Bike"
PLAN_TYPE       = "STANDARD"  # STANDARD or PREMIUM

# Thresholds (matching onboarding.md)
THRESHOLDS = {
    "WEATHER": {"metric": "rainfall_mm", "trigger": 50,  "unit": "mm/day",   "max_score": 40},
    "AQI":     {"metric": "aqi",         "trigger": 300, "unit": "AQI index", "max_score": 30},
    "CURFEW":  {"metric": "duration_h",  "trigger": 2,   "unit": "hours",    "max_score": 20},
}

# Coverage limits
PLAN_CONFIG = {
    "STANDARD": {"daily_payout": 800,  "coverage_hours": 8,  "weekly_premium": 52},
    "PREMIUM":  {"daily_payout": 1200, "coverage_hours": 12, "weekly_premium": 78},
}

# ═════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═════════════════════════════════════════════════════════════════════════════

def sep(char="-", n=62):
    print(char * n)

def header(title):
    sep("=")
    print(f"  {title}")
    sep("=")

def sub(title):
    sep()
    print(f"  >> {title}")
    sep()

# ═════════════════════════════════════════════════════════════════════════════
# STEP 1 — Upsert Worker + Policy
# ═════════════════════════════════════════════════════════════════════════════
def setup_worker_and_policy(plan: str = PLAN_TYPE):
    header("STEP 1 — Setting up Worker & Policy")

    # Auth user
    user, _ = User.objects.get_or_create(username=WORKER_PHONE)
    user.set_unusable_password()
    user.save()

    # Worker
    worker, created = Worker.objects.get_or_create(
        phone=WORKER_PHONE,
        defaults=dict(
            user=user,
            name=WORKER_NAME,
            platform=PLATFORM,
            partner_id=PARTNER_ID,
            city=CITY,
            zone=ZONE,
            weekly_earnings=WEEKLY_EARNINGS,
            working_hours=WORKING_HOURS,
            working_days=WORKING_DAYS,
            vehicle_type=VEHICLE_TYPE,
            is_verified=True,
            onboarding_completed=True,
            avg_daily_income=WEEKLY_EARNINGS // 6,
        )
    )
    status_label = "created" if created else "already existed"
    print(f"  [OK] Worker '{worker.name}' ({PARTNER_ID}) - {status_label}")

    # Policy  — always create a fresh one for this simulation week
    cfg = PLAN_CONFIG[plan]
    today = date.today()
    policy = Policy.objects.create(
        worker=worker,
        plan_type=plan,
        weekly_premium=cfg["weekly_premium"],
        coverage_limit=cfg["daily_payout"],
        payment_method="MANUAL",
        start_date=today,
        end_date=today + timedelta(days=6),
        status="ACTIVE",
    )
    print(f"  [POLICY] #{policy.policy_number}: {plan} plan | Rs.{cfg['weekly_premium']}/week")
    print(f"      Valid: {policy.start_date} -> {policy.end_date}")
    print(f"      Daily payout cap: Rs.{cfg['daily_payout']} | Coverage: {cfg['coverage_hours']}h/day")

    return worker, policy

# =============================================================================
# STEP 2 - Generate synthetic weekly conditions
# =============================================================================
def generate_week_data(start_date: date) -> list[dict]:
    """
    Returns a list of 7 day-dicts with randomised env conditions.
    Roughly 2-3 days are seeded with claim-worthy readings so the
    simulation is interesting rather than trivially all-pass/all-fail.
    """
    random.seed(42)                  # reproducible run
    days = []
    bad_day_indices = random.sample(range(7), k=random.randint(2, 4))

    for i in range(7):
        d = start_date + timedelta(days=i)
        day_name = d.strftime("%a")
        is_working = day_name in WORKING_DAYS
        bad = i in bad_day_indices and is_working

        # Rainfall: normal 5-25 mm, bad day can spike to 40-100 mm
        rainfall = random.randint(55, 100) if bad and random.random() < 0.5 else random.randint(5, 35)
        # AQI: normal 80-250, bad day 280-400
        aqi       = random.randint(300, 420) if bad and random.random() < 0.5 else random.randint(80, 270)
        # Curfew hours: usually 0, bad day 0-5 h
        curfew_h  = random.randint(2, 5) if bad and random.random() < 0.4 else 0

        days.append(dict(
            date=d,
            day_name=day_name,
            is_working=is_working,
            rainfall_mm=rainfall,
            aqi=aqi,
            curfew_hours=curfew_h,
        ))

    return days

# =============================================================================
# STEP 3 - Evaluate each day for claims
# =============================================================================
def evaluate_claims(worker: Worker, policy: Policy, week: list[dict]) -> list[dict]:
    plan_cfg  = PLAN_CONFIG[policy.plan_type]
    hourly    = WEEKLY_EARNINGS / (len(WORKING_DAYS) * WORKING_HOURS)

    claim_records = []

    for day in week:
        day_claims = []

        if not day["is_working"]:
            continue   # Off day - no claim eligibility

        # 1. WEATHER trigger
        if day["rainfall_mm"] > THRESHOLDS["WEATHER"]["trigger"]:
            lost_h = min(WORKING_HOURS, WORKING_HOURS * (day["rainfall_mm"] / 100))
            compensation = min(round(lost_h * hourly), plan_cfg["daily_payout"])
            day_claims.append(dict(type="WEATHER", metric=f"Rainfall {day['rainfall_mm']} mm",
                                   lost_hours=round(lost_h, 1), compensation=compensation))

        # 2. AQI trigger
        if day["aqi"] > THRESHOLDS["AQI"]["trigger"]:
            lost_h = min(WORKING_HOURS, WORKING_HOURS * ((day["aqi"] - 200) / 400))
            compensation = min(round(lost_h * hourly), plan_cfg["daily_payout"])
            day_claims.append(dict(type="AQI", metric=f"AQI {day['aqi']}",
                                   lost_hours=round(lost_h, 1), compensation=compensation))

        # 3. CURFEW trigger
        if day["curfew_hours"] >= THRESHOLDS["CURFEW"]["trigger"]:
            lost_h = day["curfew_hours"]
            compensation = min(round(lost_h * hourly), plan_cfg["daily_payout"])
            day_claims.append(dict(type="CURFEW", metric=f"Curfew {day['curfew_hours']}h",
                                   lost_hours=lost_h, compensation=compensation))

        if day_claims:
            claim_records.append(dict(date=day["date"], day_name=day["day_name"],
                                      conditions=day, claims=day_claims))

    return claim_records

# =============================================================================
# STEP 4 - Persist to DB
# =============================================================================
def persist_claims(worker: Worker, claim_records: list[dict]):
    db_claims = []
    for record in claim_records:
        for c in record["claims"]:
            event = Event.objects.create(
                type=c["type"],
                zone=worker.zone,
                severity=int(c["lost_hours"] * 10),   # proxy severity
            )
            claim = Claim.objects.create(
                worker=worker,
                event=event,
                lost_hours=int(c["lost_hours"]),
                compensation=c["compensation"],
                status="PAID",
            )
            db_claims.append(claim)
    return db_claims

# =============================================================================
# STEP 5 - Print Report
# =============================================================================
def print_report(worker, policy, week, claim_records, db_claims):
    header("SIMULATION REPORT - Weekly Claim Analysis")
    print(f"  Worker  : {worker.name}  ({worker.platform} | {worker.partner_id})")
    print(f"  Zone    : {worker.zone}")
    print(f"  Plan    : {policy.plan_type}  (Rs.{policy.weekly_premium}/week)")
    print(f"  Period  : {policy.start_date}  ->  {policy.end_date}")
    sep()

    # Daily breakdown
    print("  DAY-BY-DAY ENVIRONMENT DATA")
    sep()
    print(f"  {'Date':<12} {'Day':<5} {'Work':<6} {'Rain mm':<9} {'AQI':<6} {'Curfew h':<10} Claim?")
    sep()
    claimable_dates = {r["date"] for r in claim_records}
    for day in week:
        flag = "[CLAIM] YES" if day["date"] in claimable_dates else "[OK]  No "
        working = "Yes" if day["is_working"] else "Off"
        print(f"  {str(day['date']):<12} {day['day_name']:<5} {working:<6} "
              f"{day['rainfall_mm']:<9} {day['aqi']:<6} {day['curfew_hours']:<10} {flag}")

    # Claim detail
    total_compensation = 0
    total_lost_hours   = 0
    sub("CLAIM DETAILS")
    if not claim_records:
        print("  No claimable events - great week for the worker!")
    else:
        for record in claim_records:
            print(f"\n  {record['date'].strftime('%A, %d %b %Y')}")
            for c in record["claims"]:
                print(f"      [TRIGGER] {c['type']} - {c['metric']}")
                print(f"       Lost hrs : {c['lost_hours']}h")
                print(f"       Payout   : Rs.{c['compensation']}")
                total_compensation += c["compensation"]
                total_lost_hours   += c["lost_hours"]

    # Summary
    sub("WEEKLY SUMMARY")
    print(f"  Claimable days          : {len(claim_records)} / 7")
    print(f"  Total lost working hours: {round(total_lost_hours, 1)}h")
    print(f"  Total compensation      : Rs.{total_compensation}")
    print(f"  Weekly premium paid     : Rs.{policy.weekly_premium}")
    net = total_compensation - policy.weekly_premium
    print(f"  Net benefit to worker   : Rs.{net}  {'(NET POSITIVE)' if net >= 0 else '(NET NEGATIVE - quiet week)'}")
    sep()
    print(f"  DB Claim records saved  : {len(db_claims)}")
    sep("=")
    print("  Simulation complete!")
    sep("=")

# =============================================================================
# MAIN
# =============================================================================
if __name__ == "__main__":
    start = date.today() - timedelta(days=6)   # simulate last 7 days

    worker, policy      = setup_worker_and_policy()
    week                = generate_week_data(start)
    claim_records       = evaluate_claims(worker, policy, week)
    db_claims           = persist_claims(worker, claim_records)

    print_report(worker, policy, week, claim_records, db_claims)
