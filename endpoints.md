# GigShield API Endpoints

> **Base URL**: `http://localhost:8000`

---

## 🔐 Authentication & Onboarding

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/otp/generate/` | Generate 6-digit OTP for phone number | None |
| `POST` | `/api/auth/otp/verify/` | Verify OTP, returns JWT tokens + worker status | None |
| `POST` | `/api/auth/platform/connect/` | Mock OAuth — generates partner ID, earnings, zone | None |
| `POST` | `/api/auth/screenshot/verify/` | Upload screenshot for forensic verification | None |
| `POST` | `/api/auth/work-details/` | Update worker's earnings, hours, days, vehicle | None |
| `POST` | `/api/auth/finalize/` | Complete onboarding, create insurance policy | None |

### `POST /api/auth/otp/generate/`
```json
// Request
{ "phone": "+919876543210" }

// Response 200
{ "message": "OTP sent successfully", "code": "******" }
```

### `POST /api/auth/otp/verify/`
```json
// Request
{ "phone": "+919876543210", "code": "123456" }

// Response 200
{
  "message": "OTP verified",
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>",
  "is_new_user": true,
  "onboarding_completed": false
}
```

### `POST /api/auth/platform/connect/`
```json
// Request
{ "phone": "+919876543210", "platform": "Zomato" }

// Response 200
{
  "message": "Connected to platform successfully",
  "data": {
    "partner_id": "ZOM847562",
    "name": "Rajesh Kumar",
    "weekly_earnings": 4200,
    "zone": "Koramangala, Bangalore"
  }
}
```

### `POST /api/auth/screenshot/verify/`
```
// Request (multipart/form-data)
phone: "+919876543210"
screenshot: <image_file>

// Response 201
{
  "id": "<uuid>",
  "status": "VERIFIED" | "REVIEW" | "FAILED",
  "forensics_score": 22,
  "total_trust_score": 22,
  "forensics_report": { "metadata": [...], "integrity": [...] }
}
```

### `POST /api/auth/work-details/`
```json
// Request
{
  "phone": "+919876543210",
  "weekly_earnings": 4200,
  "working_hours": 6,
  "working_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "vehicle_type": "Bike"
}

// Response 200
{ "message": "Work details updated" }
```

### `POST /api/auth/finalize/`
```json
// Request
{
  "phone": "+919876543210",
  "plan_type": "STANDARD",
  "payment_method": "UPI_AUTOPAY"
}

// Response 200
{ "message": "Onboarding finalized and protection started" }
```

---

## 📋 Worker Registration (Legacy)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/workers/register/` | Direct worker registration (fallback) | None |

### `POST /api/workers/register/`
```json
// Request
{
  "name": "Rajesh Kumar",
  "phone": "+919876543210",
  "platform": "Zomato",
  "city": "Bangalore",
  "zone": "Koramangala",
  "avg_daily_income": 600
}

// Response 201
{
  "message": "Worker account created",
  "worker": { ... },
  "access": "<jwt_token>",
  "refresh": "<jwt_token>"
}
```

---

## 🛡️ Policy Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/policy/quote/?worker_id=<uuid>` | Get AI-calculated premium quote | JWT (Worker/Staff) |
| `POST` | `/api/policy/purchase/` | Purchase and activate a policy | JWT (Worker/Staff) |

### `GET /api/policy/quote/?worker_id=<uuid>`
```json
// Response 200
{
  "worker_id": "<uuid>",
  "zone": "Koramangala",
  "avg_income": 600,
  "premium": 45,
  "coverage": 900,
  "risks": { "weather": 0.4, "pollution": 0.3 }
}
```

### `POST /api/policy/purchase/`
```json
// Request
{ "worker_id": "<uuid>", "payment_status": "SUCCESS" }

// Response 201
{
  "message": "Policy activated successfully",
  "policy_id": "<uuid>",
  "policy_number": "IGW-2026-A3B8D1",
  "worker": "Rajesh Kumar",
  "valid_until": "2026-03-14"
}
```

---

## 💰 Payouts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/payout/process/` | Process claim payout | JWT (Admin only) |

### `POST /api/payout/process/`
```json
// Request
{ "claim_id": "<uuid>" }

// Response 200
{
  "message": "Payout successful",
  "claim_id": "<uuid>",
  "amount": 500,
  "status": "PAID"
}
```

---

## 👨‍💼 Admin Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/admin/workers/` | List all registered workers | None* |
| `GET` | `/api/admin/risk-zones/` | Risk heatmap (events by zone) | None* |
| `GET` | `/api/admin/claims/` | Claims monitoring stats | None* |

*\*Currently set to AllowAny for development*

### `GET /api/admin/workers/`
```json
// Response 200
[
  {
    "id": "<uuid>",
    "name": "Rajesh Kumar",
    "platform": "Zomato",
    "partner_id": "ZOM847562",
    "city": "Bangalore",
    "zone": "Koramangala",
    "avg_daily_income": 600,
    "weekly_earnings": 4200,
    "vehicle_type": "Bike",
    "is_verified": true,
    "onboarding_completed": true,
    "created_at": "2026-03-07T..."
  }
]
```

### `GET /api/admin/risk-zones/`
```json
// Response 200
[
  { "zone": "Salt Lake", "event_count": 5 },
  { "zone": "Park Street", "event_count": 3 }
]
```

### `GET /api/admin/claims/`
```json
// Response 200
{
  "total_claims": 25,
  "paid_claims": 18,
  "pending_claims": 7,
  "total_payout": 12500
}
```

---

## 🤖 AI Risk Prediction

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/risk/predict/?zone=<name>` | Real-time AI disruption forecast | None |

### `GET /api/risk/predict/?zone=Salt Lake`
```json
// Response 200
{
  "zone": "Salt Lake",
  "forecast_data": {
    "forecast_rain": 120,
    "forecast_wind": 25,
    "aqi": 350
  },
  "ai_analysis": {
    "disruption_probability": 0.72,
    "risk_level": "HIGH",
    "alert": "High rain risk tomorrow. Stay safe!"
  },
  "timestamp": "2026-03-07T00:00:00Z"
}
```

---

## 🔑 JWT Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/token/` | Get JWT token pair (username/password) | None |
| `POST` | `/api/token/refresh/` | Refresh expired access token | None |

---

## 📖 API Documentation (Swagger/Redoc)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/swagger/` | Swagger UI interactive docs |
| `GET` | `/redoc/` | ReDoc formatted docs |
| `GET` | `/swagger.json/` | Raw OpenAPI schema |

---

## 📊 Summary

| Category | Count |
|----------|-------|
| Onboarding & Auth | 6 endpoints |
| Legacy Registration | 1 endpoint |
| Policy Management | 2 endpoints |
| Payouts | 1 endpoint |
| Admin Dashboard | 3 endpoints |
| AI/Risk | 1 endpoint |
| JWT Auth | 2 endpoints |
| Docs | 3 endpoints |
| **Total** | **19 endpoints** |
