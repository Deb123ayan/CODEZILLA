# AI Parametric Insurance Platform (Backend)

Complete Django REST Framework backend for gig delivery workers' parametric insurance.

## Tech Stack
- **Framework:** Django + DRF
- **Database:** PostgreSQL (configured for SQLite by default for easy demo)
- **Background Tasks:** Celery + Redis
- **Auth:** JWT (SimpleJWT)

## Folder Structure
```
backend/
 ├── core/              # Project configuration (settings, urls, celery)
 ├── users/             # Worker management & Auth
 ├── policies/          # Policy Engine & Quoting
 ├── events/            # External Event Monitoring (Weather, AQI)
 ├── claims/            # Automated Claims Processing
 ├── api/               # Centralized API routing & Admin Views
 ├── celery_tasks/      # Background ingestion & trigger logic
 ├── payments/          # Payout processing mock
 ├── ai_engine/         # Risk calculation logic
 └── manage.py
```

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Start the Server:**
   ```bash
   python manage.py runserver
   ```

4. **Start Celery Worker (for automated claims):**
   ```bash
   celery -A core worker -l info
   ```

## Key API Endpoints

- `POST /api/workers/register/` - Register worker & get JWT
- `GET /api/policy/quote/` - Get weekly premium based on zone risk
- `POST /api/policy/purchase/` - Activate active coverage
- `GET /api/risk/predict/` - Real-time AI risk alerts (Winning Feature)
- `GET /api/admin/claims/` - Monitoring dashboard for payouts

## Automated Workflow
The platform uses background tasks to:
1. Fetch weather/AQI data every 10 mins.
2. Detect "disruption events" (e.g. Rainfall > 100mm).
3. Automatically identify workers with active policies in the zone.
4. Calculate lost income and generate claims.
5. Run automated fraud checks and trigger payouts.
