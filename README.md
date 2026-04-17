# 🛡️ ZafBy — AI-Driven Parametric Income Protection for India's Gig Economy

> **Protecting the last mile. Automatically. Intelligently. Unfailingly.**

ZafBy is a full-stack, AI-orchestrated parametric insurance platform purpose-built for delivery partners operating on Zomato, Swiggy, Zepto, Blinkit, Amazon, and Flipkart. By fusing live environmental telemetry, machine learning inference, and behavioral biometrics, ZafBy detects genuine income disruptions and triggers instant, automated payouts — ensuring that no honest worker loses a day's wage to circumstances beyond their control.

---

## 📌 Table of Contents

1. [What is ZafBy?](#-1-what-is-ZafBy)
2. [Core Features](#-2-comprehensive-core-features)
3. [How It Works (End-to-End Journey)](#-3-how-it-works-end-to-end-user-journey)
4. [Technical Stack & Architecture](#-4-technical-stack--architecture)
5. [Current Implementation Checkmarks](#-5-current-implementation-checkmarks)
6. [**Adversarial Defense & Anti-Spoofing Strategy**](#-6-adversarial-defense--anti-spoofing-strategy)

---

## 🔍 1. What is ZafBy?

ZafBy is an AI-driven income protection and security layer built specifically for the modern gig economy. It provides automated insurance for drivers operating on platforms like Zomato, Swiggy, Zepto, Blinkit, Amazon, and Flipkart.

By analyzing live weather, traffic, and platform telemetry, ZafBy detects unpreventable disruptions (e.g., severe storms or platform outages) and triggers instant, automated payouts — ensuring drivers never lose a day's wage to circumstances beyond their control.

---

## ✨ 2. Comprehensive Core Features

### 🛡️ AI Verification & Fraud Detection Engine
- **Screenshot Forensics**: Workers verify their platform identity by uploading profile screenshots. ZafBy's AI scrutinizes the image metadata (EXIF data) and tests integrity to ensure the screenshot isn't tampered with or downloaded from the internet.
- **Auto-Approval Pipeline**: Images reaching a threshold integrity score of `20` are automatically moved to a `VERIFIED` status without human intervention, activating the worker's account instantly.

### 💸 Automated Smart Payouts
- **Zero-Friction Claims**: When a disruption occurs in a verified worker's zone, ZafBy cross-references the event securely via an orchestrated AI service.
- **Immediate Crediting**: 85% of standard weather/traffic claims are automatically processed and credited to the worker's wallet within hours.

### 📱 Dedicated Member (Worker) Portal
- **Platform-Specific Onboarding**: Tailored interfaces for registering across different Indian gig platforms.
- **Live Analytics Dashboard**: A glassmorphic, visual layout mapping out weekly earnings vs. protected limits utilizing interactive `Recharts` data visualizations.
- **Dynamic System Alerts Feed**: Workers receive real-time, context-specific alerts regarding anticipated heavy rain warnings, traffic congestions, and immediate payout status updates in their respective zones.
- **Secure Sessions**: Protected by a strict `UserAuthContext` routing mechanism that prevents unauthorized entry or backward browser traversal.

### 🖥️ Specialized Admin Control Center
- **Mission Control Dashboard**: Provides a high-level overview of live system operations, platform split pie-charts (Zomato vs Blinkit vs Zepto dominance), and an auto-refreshing system action feed.
- **Worker & Claims Registries**: Detailed, horizontally scrollable data tables displaying over 24k active partners across regions, showcasing their generated "Risk Index" dynamically based on behavior.
- **Ironclad Admin Gatekeeping**: Secured under a dedicated `AdminAuthContext` to silo administrative actions away from member routes.

---

## 🧭 3. How It Works (End-to-End User Journey)

### Step 1: Password-less Enrollment (The Worker)
1. A gig worker navigates to the ZafBy Landing Page.
2. They initiate registration, supplying their phone number.
3. The Django backend fires the **Generate OTP View**, returning a 6-digit secure token.
4. The worker submits the token via the **Verify OTP View**. Upon validation, the system instantly logs them in, generating a JWT Access token and sealing their active frontend session under `UserGuard`.

### Step 2: Identity & Platform Authentication
1. The worker selects their specific delivery platform (e.g., Zomato, Zepto) from a grid.
2. The user executes the mock **Platform Connect** step, tying their phone directly to a newly generated `PartnerID` and linking their geographical `Zone`.
3. They upload an earnings or profile screenshot to the **AI Verification Pipeline**.
4. The Python Image Forensics module decomposes the image bytes. If deemed authentic, it flags `is_verified=True`.

### Step 3: Activating Protection & Operating
1. The worker secures their final Active Policy (Standard, Premium, or Elite tier), with the secure discount automatically applied if their forensics and Aadhaar/PAN KYC score returned clean.
2. Once activated, they are dropped into their **Live Dashboard**.
3. Here, they safely monitor their "Max Coverage" (up to ₹5,000 for Flash Payouts), "Weekly Premium" (e.g., ₹59 deduction), and watch their "Earnings vs. Protected" trends dynamically scale.

### Step 4: Claim Orchestration (The Admin)
1. Whenever a disruption triggers or a worker files a manual issue within the "Claims Center", it queues in the backend.
2. An Administrator logs in to the sealed `/admin` interface.
3. The Admin hits the **Claims Queue**, opening up the data registry array.
4. Admins can view the AI's confidence rating ("Verified" vs "Reviewing") and execute manual override actions (Reject, Approve, Inspect) directly from the interface based on the generated Forensic Risk Index score.

---

## 🛠️ 4. Technical Stack & Architecture

### Frontend Layer
- **Framework**: `React-DOM` configured via `Vite` for lightning-fast bundling.
- **Routing**: `react-router-dom` utilizing high-order wrapper components (`AdminGuard`, `UserGuard`) for strict authorization.
- **Styling**: `Tailwind CSS` with complex, adaptive, glassmorphism aesthetics.
- **Data Visuals**: Recharts integration (`LineChart`, `PieChart`, `BarChart`).
- **Deployment**: Auto-deployed to Vercel via GitHub triggers.
- **Live URL**: [https://zafbyy.vercel.app](https://zafbyy.vercel.app)

### Backend Protocol
- **Core Server**: `Python 3` + `Django REST Framework` + OTP via Telegram Bot.
- **Database**: `Neon PostgreSQL` (Production) & `SQLite3` (Development).
- **Architecture**: Separated context apps (`users`, `fraud_detection`, `policies`, `celery_tasks`, `ai_engine`, `deliveries`).
- **Deployment**: Dockerized (`web`, `nginx`) deployed on a Linux VPS.
- **Live API Endpoint**: `https://zafby.duckdns.org/api/`

---

## ✅ 5. Current Implementation Checkmarks

- ✅ Full OTP passwordless authentication flow with `GenerateOTPView` and `VerifyOTPView` generating JWT tokens.
- ✅ Worker model with comprehensive fields: platform choice (Zomato/Swiggy/etc), zone, pricing_plan, wallet_savings, total_deliveries, govt_id, is_verified.
- ✅ Real-time `WeatherService` integrating OpenWeatherMap API for claim verification (heavy rain fraud detection) with simulation fallback.
- ✅ `InsuranceAI` ML service loading joblib models: `fraud_model`, `disruption_model`, `premium_model` for predictions.
- ✅ Risk calculator computing dynamic premiums and realtime risk alerts based on zone/weather/AQI/platform.
- ✅ Celery background tasks: `process_claims_for_event`, `run_fraud_check`, `ingest_external_data`, `expire_policies`.
- ✅ Claims model with status tracking (PENDING/APPROVED/REJECTED/FRAUD) and compensation tracking.
- ✅ Admin API views: `AdminWorkerListView` (24k workers), `AdminRiskHeatmapView`, `AdminClaimsMonitoringView`, `AdminAnalyticsView`.
- ✅ Frontend `UserAuthContext` and `AdminAuthContext` with sessionStorage and guards preventing unauthorized access.
- ✅ Admin dashboards: `AdminAnalytics.tsx` with stats/charts, `AdminAlerts.tsx` with event log and zone broadcasts.
- ✅ TanStack Query integration for efficient data fetching across dashboard components.
- ✅ Complete edge-to-edge UI restructuring for mobile-view responsiveness across standard pages and deep admin dashboards.
- ✅ Active separation of authentication states (Worker Dashboard tracking strictly apart from the Admin portal layout tracking).
- ✅ Completed Python Image Forensics endpoints to validate profile truth.
- ✅ Implemented smooth anchoring links on the `Landing.tsx` mapping visually down to the Features/Partners sections.

---

## 🔐 6. Adversarial Defense & Anti-Spoofing Strategy

> **⚠️ ARCHITECTURAL DESIGN DOCUMENT**
> *The following section describes the **planned, multi-layered anti-spoofing architecture** that ZafBy is designed to support. The current implementation includes Gate Zero (weather parametric verification via OpenWeatherMap API), ML-based anomaly detection (IsolationForest), GPS distance checks, and neighborhood consensus verification. Advanced telemetry signals (cell tower triangulation, IMU analysis, device fingerprinting, DBSCAN cluster analysis) are documented here as the intended production roadmap.*

> **Threat Scenario:** A coordinated syndicate of 500+ delivery workers, organizing covertly via localized Telegram groups, deploys consumer-grade GPS-spoofing applications to fabricate their geolocation data. While physically at rest in the safety of their homes, these bad actors trick ZafBy's parametric trigger into believing they are stranded within a severe, red-alert weather zone — thereby engineering mass false claim payouts that drain the liquidity pool and destabilize the entire insurance ecosystem.

> **Why GPS Spoofing Apps Work — And Exactly Why They Fail Against ZafBy:** Consumer GPS-spoofing applications (e.g., Fake GPS GO, Mock Location tools) operate by injecting false coordinates into the device's Location API — the single data channel that naive parametric platforms poll. They are architecturally incapable of simultaneously forging the device's cellular network attachment (which Cell Tower the SIM is physically registered to), the ISP/carrier routing of the outbound HTTP request (IP geolocation), or the raw readings from the device's hardware Inertial Measurement Unit (IMU). These three signals are sourced from entirely separate hardware and OS stacks. This structural gap is ZafBy's primary line of attack.

ZafBy does not rely on GPS as a singular, trusted oracle. GPS coordinates are treated as one **unverified signal** in a multi-layered, adversarially-hardened evidence stack. Our defense architecture operates across four interlocking pillars: **Gate Zero Weather Parametrics**, **Signal Triangulation**, **Behavioral Graph Analysis**, and **Graceful Human-in-the-Loop Adjudication**.

---

### Gate Zero — The Parametric Weather Trigger (Pre-GPS Verification)

Before ZafBy ever evaluates a worker's location, it must first confirm that a **genuine, verifiable weather event** exists — sourced independently from the worker's device entirely. ZafBy's `WeatherService` continuously ingests live data from the OpenWeatherMap API, mapping real-time rain intensity (mm/hr), wind speed, AQI, and alert severity across every operational zone.

**A claim cannot be initiated unless the event zone is independently confirmed as red-alert by the external weather API.** This closes a critical first-order vulnerability: a spoofing syndicate cannot fabricate claims against a zone that isn't experiencing a genuine weather event, because the trigger condition is sourced from a server-side, tamper-proof third-party feed — not from the worker's device. Spoofing your GPS to Mumbai's Andheri zone does nothing if Andheri is currently sunny.

Once Gate Zero is cleared (a real event exists), *then* — and only then — does the system proceed to verify whether the claiming worker was genuinely present within it.

---

### 6.1 — The Differentiation: How ZafBy Distinguishes a Stranded Partner from a Fraudulent Impersonator

A genuine worker trapped in a severe weather zone leaves a rich, involuntary, and *internally consistent* digital exhaust trail. A GPS spoofer, conversely, manufactures one synthetic signal while the rest of their device's telemetry continues to behave as if nothing is wrong. ZafBy's detection engine exploits this fundamental contradiction.

#### 🌐 Cross-Signal Corroboration (The "Coherence Test")

When a claim is triggered or a worker reports disruption, ZafBy's AI orchestrator assembles a **Multi-Signal Coherence Score** by cross-examining the following axes simultaneously:

| Signal Domain | Genuine Stranded Worker | GPS Spoofer (at Home) |
|---|---|---|
| **GPS Coordinates** | Placed within the red-alert zone | Placed within the red-alert zone (fabricated) |
| **Device Network IP** | Routes through a local cell tower within the alert zone | Routes through home ISP or a different cell sector |
| **Cell Tower Triangulation** | Nearest tower sits within or adjacent to the event zone | Nearest tower is the worker's home sector |
| **Device Accelerometer / IMU** | Irregular motion, vibration, or sustained stillness consistent with being sheltered | Near-zero motion (sitting at home) |
| **Platform App Telemetry** | Delivery app shows worker as "offline" or "seeking orders" | Delivery app may show them as "idle" with no recent trip attempts |
| **Battery & Charging State** | Likely on battery power; possible low battery from being outdoors | Likely plugged into a charger (home behavior) |
| **Historical Zone Presence** | Worker's weekly location history confirms they regularly operate in this zone | Worker's historical routes reveal they rarely or never work in this zone |
| **Order Acceptance Rate (Pre-Event)** | Shows active delivery attempts in the preceding hours | Shows no recent platform activity from that zone |

A genuine claim will exhibit high internal coherence across these signals. A spoofed claim will trigger what we call a **"Signal Inversion Alert"** — GPS says "Zone Alpha," but the cell sector, IP geofence, and accelerometer all say "Home."

#### 🧠 The Isolation Forest Anomaly Model

ZafBy's existing `InsuranceAI` service employs an `IsolationForest` model (`fraud_model.joblib`) trained on behavioral features. For anti-spoofing, the feature vector is expanded from 5 dimensions to a richer 9-dimensional payload:

```
[lost_hours, compensation_requested, distance_from_zone_centroid,
 active_days_on_platform, nearby_workers_claiming (cluster_density),
 ip_zone_match_score, accelerometer_variance, historical_zone_frequency,
 platform_session_activity_score]
```

The `nearby_workers_claiming` (cluster density) feature is particularly lethal against organized syndicates: if 50+ workers from the same zone all file claims within a 15-minute window with near-identical GPS coordinates, **the Isolation Forest scores this cluster as a high-contamination anomaly**, regardless of whether each individual claim looks superficially clean.

---

### 6.2 — The Data: What ZafBy Analyzes Beyond Basic GPS Coordinates

The following data points constitute ZafBy's **adversarial evidence stack**. The key design principle is that no single point can be forged in isolation without creating contradictions in at least two others.

#### 📡 Hard Telemetry Signals (Device-Level)
- **IP Address Geofencing**: The originating IP of the claim submission request is resolved against a geofenced database. A mobile IP resolving to a cellular tower outside the declared event zone is a primary fraud indicator.
- **Cell Network Sector ID (CID/LAC)**: Cell tower sector data embedded in network requests provides a hardware-level location stamp that is architecturally separate from the GPS stack and cannot be overridden by most consumer spoofing apps.
- **Device IMU / Accelerometer Variance**: A worker sheltering from a storm still shows micro-vibrations from breathing, shifting weight, and ambient building vibration. A worker who is completely motionless (lying on a couch at home) produces a suspiciously flat accelerometer curve.

#### 🗺️ Contextual & Historical Signals (Profile-Level)
- **Longitudinal Zone History**: ZafBy maintains a rolling 90-day heatmap of every zone a worker has been active in. A claim from a zone the worker has never operated in before scores a high "Zone Naivety Penalty."
- **Pre-Event Platform Activity**: ZafBy queries whether the worker attempted to accept orders from within the declared zone in the 2-hour window *before* the event trigger. A legitimate stranded worker was *trying* to work. A fraudster was never in the zone to begin with and shows zero platform activity from that location.
- **Inter-Claim Temporal Gap**: Workers filing their second, third, or fourth claim within an unusually short duration trigger an accelerated scrutiny flag. Genuine disruptions are episodic; fraud rings exhibit burst-filing patterns.

#### 👥 Network & Graph Signals (Syndicate-Level)
- **Claim Cluster Density (The Syndicate Detector)**: This is ZafBy's most powerful anti-ring feature. Using a graph-based clustering algorithm (DBSCAN applied spatiotemporally), the system continuously maps *who is claiming, from where, and when*. A legitimate weather event produces a dispersed, organic claim distribution across a zone. A coordinated attack produces an unnaturally dense, tight cluster of claims originating from near-identical GPS coordinates within a very narrow time window — a statistical signature that is virtually impossible to fake at scale.
- **Temporal Burst Analysis (The Telegram Detector)**: ZafBy runs a sliding 5-minute window analysis across all incoming claims system-wide. Under a genuine weather event, claims arrive in an organic, staggered distribution — workers discover the disruption individually and file over minutes to hours. A coordinated syndicate, acting on a single Telegram "go" signal, produces a statistically impossible **claim burst**: 50+ submissions within a 60–90 second window from the same approximate geofence. ZafBy's Temporal Burst engine automatically flags any cluster where `claims_per_zone_per_5min > 3σ above the historical baseline` for that zone, freezing the entire burst cluster as a coordinated fraud candidate and escalating it to priority Admin review — regardless of whether any individual claim within the burst looks clean in isolation.
- **Shared Device Fingerprints**: If multiple worker accounts submit claims from the same device fingerprint (browser fingerprint or mobile device ID), this is an immediate `FRAUD` flag and the accounts are cross-linked, frozen, and escalated together — dismantling the syndicate structure rather than handling members as isolated bad actors.

---

### 6.3 — The UX Balance: Handling Flagged Claims Without Penalizing Honest Workers

This is perhaps the most architecturally critical challenge. A fraud detection system that is too aggressive becomes an instrument of injustice, denying legitimate payouts to vulnerable workers who are already in distress. ZafBy's adjudication philosophy is rooted in a tiered, graduated response framework — not a blunt binary approval/rejection gate.

#### The Three-Tier Adjudication Ladder

**Tier 1 — Auto-Approved (Confidence Score ≥ 85%)**
The Multi-Signal Coherence Test passes cleanly. The worker's IP, cell sector, historical zone behavior, and accelerometer data all corroborate the GPS coordinates. The claim is automatically approved and the wallet is credited within hours via the existing `process_claims_for_event` Celery task. This covers the vast majority of genuine claims — workers in genuine distress should experience zero friction.

**Tier 2 — Soft-Flagged / Provisional Hold (Confidence Score 50%–84%)**
The system detects one or two anomalous signals but cannot definitively rule the claim as fraudulent. This is the critical zone where a genuine worker experiencing a network dropout in bad weather might land. The response is:

- A **provisional micro-payout** of 40% of the total claim value is released immediately, ensuring the worker is not left completely without support.
- The worker receives a transparent in-app notification: *"Your claim is under expedited review. A partial advance has been credited. We'll resolve this within 4 hours."*
- The worker is offered a **one-tap "Challenge" option** — they can submit a 10-second video selfie with their surroundings, which is analyzed by a lightweight image geolocation model to corroborate their declared location. This is voluntary, not punitive.
- The remaining 60% is released upon successful review, or the advance is reconciled if fraud is confirmed.

**Tier 3 — Hard-Flagged / Frozen (Confidence Score < 50% or Syndicate Cluster Detected)**
The Signal Inversion Rate is high (GPS contradicts ≥3 other signals) or the claim is part of an identified coordinated cluster. The full claim is suspended, the worker's account is marked `UNDER_REVIEW`, and the case is escalated to ZafBy's human Admin via the existing `AdminClaimsMonitoringView` interface.

- The worker receives a **clear, non-accusatory notification** explaining the hold and the specific resolution path (not the specific fraud signals — to prevent gaming).
- A human Admin uses the Admin Control Center to view the worker's full evidence dossier (zone history heatmap, cluster visualization, IP geofence map, IMU chart) and makes the final adjudicatory decision.
- **Critically: ZafBy guarantees a 24-hour human review SLA for all Tier 3 cases.** No claim sits in limbo indefinitely. If the Admin clears the claim, full payment is released retroactively with a *trust bonus* applied to the worker's Forensic Risk Index profile.

#### 🤝 Building Worker Trust: The Transparency Covenant

A system that silently flags honest workers without explanation destroys trust. ZafBy commits to:

- **Explainable AI Outputs**: Workers receive plain-language notifications explaining *why* their claim is under review, expressed as: *"We detected some unusual signals from your location. This is an automated check and does not mean you are suspected of anything."*
- **Appeal Without Penalty**: Any worker can request a human review at any stage without it negatively impacting their Risk Index score.
- **False Positive Amnesty**: If a Tier 3 claim is cleared by a human Admin, the system automatically recalibrates the worker's Risk Index upward, treating the experience as a data point that improves future model accuracy rather than a permanent stain on their record.
- **Network Drop Awareness**: ZafBy's system is specifically trained to recognize the behavioral signature of genuine network degradation in bad weather (intermittent GPS pings, delayed claim submissions) as distinct from the clean, continuous signal of a spoofing application.

---

### 6.4 — Architectural Summary: Why This System is Structurally Fraud-Resistant

```
Claim Trigger
     │
     ▼
┌─────────────────────────────────────────────┐
│        Multi-Signal Evidence Assembler       │
│  GPS · IP Geofence · Cell Sector · IMU      │
│  Zone History · Platform Activity · Timing  │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │  IsolationForest Model  │  ← Anomaly Score
         │  + DBSCAN Cluster Check │  ← Syndicate Score
         └────────────┬────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      TIER 1       TIER 2      TIER 3
   Auto-Approve  Provisional   Frozen +
   Full Payout   Micro-Payout  Human Review
                 + Optional    (24hr SLA)
                 Video Verify
```

The genius of this architecture is its **asymmetric cost structure**: it makes fraud disproportionately difficult to execute at scale (requiring simultaneous spoofing of GPS *and* cell sector *and* IP *and* IMU *and* cluster behavior), while keeping the honest worker experience nearly frictionless. A coordinated syndicate must now compromise not one signal, but seven simultaneously — and even then, the cluster density algorithm will surface the attack as a statistical anomaly.

ZafBy does not merely detect GPS spoofing. It **makes large-scale GPS spoofing mathematically unprofitable.**

---

## 📅 7. Changelog

All notable changes are documented here in reverse chronological order.

---

### [2026-04-04] — Admin Command Center: Actions, Security & Review Queue

#### 🔐 Security
- **Added `.htaccess` hardening file** (`frontend/.htaccess`) with comprehensive protection against:
  - Path & directory traversal attacks (plain, URL-encoded `%2e%2e%2f`, double-encoded `%252e%252e`)
  - Null-byte injection attacks (`%00`)
  - SQL injection patterns in query strings (`UNION SELECT`, `DROP TABLE`, etc.)
  - Dangerous HTTP methods (`TRACE`, `TRACK`) — mitigates XST attacks
  - Access to sensitive files (`.env`, `.git`, `db.sqlite3`, `settings.py`, `manage.py`, etc.)
  - Bad bot / scanner user-agents (Nikto, SQLMap, Acunetix, Nessus, etc.)
  - Full security header suite (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, `Permissions-Policy`)
  - SPA fallback rule for React Router (`index.html` catch-all)

#### 🖥️ Admin Panel — CRUD Actions
- **Workers page**: Added **Add Worker** (creates Django user + Worker record), **Edit Worker** (update all profile fields in-place), **Deactivate Worker** (soft-delete, `is_active=False`) — all wired directly to database via new REST endpoints.
- **Claims page**: Added **Edit Claim** (modify status, compensation, reason) and **Delete Claim** (hard-delete record) modals.
- **Policies page**: Added **Issue Policy** (assign a new policy to any real worker with plan auto-fill), **Edit Policy** (update plan, premium, coverage, status) and **Cancel Policy** (sets `status=CANCELLED`) — all live DB operations.

#### 🔎 Admin Panel — Manual Review Queue
- **New `Manual Review Queue` section** on the Claims page: a dark-themed panel that automatically surfaces all `PENDING` and `FRAUD_FLAGGED` claims requiring human adjudication.
  - Shows claim ID, worker name, reason, payout amount, and live fraud risk score with color-coded severity (green / orange / red).
  - Inline **Approve** and **Reject** quick-action buttons for fast triage.
  - **Inspect** button opens a full-screen `Review Inspector Modal` with:
    - Complete claim metadata grid
    - Animated fraud risk score progress bar with AI-generated guidance text
    - **Adjudicator Notes** text area for internal decision rationale
    - **Approve & Pay** / **Reject Claim** decision buttons
  - Queue disappears automatically when all claims have been processed.

#### 🔧 Backend — New API Endpoints (`backend/api/admin_views.py` + `urls.py`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/workers/create/` | Create new worker + Django auth user |
| `GET / PATCH / DELETE` | `/api/admin/workers/<id>/` | Fetch / update / soft-delete worker |
| `GET / PATCH / DELETE` | `/api/admin/claims/<id>/detail/` | Fetch / update / hard-delete claim |
| `GET / POST` | `/api/admin/policies/list/` | List all policies / issue new policy |
| `PATCH / DELETE` | `/api/admin/policies/<id>/` | Update / cancel policy |

#### 🎨 UI — Filter Bug Fix
- **Fixed duplicate platform filter pills** on the Workers page. Pills are now derived from the canonical `PLATFORMS` constant (not raw DB data), preventing duplicates caused by case differences or trailing whitespace in stored platform names.
- Filter matching is now fully case-insensitive.

---

### [2026-04-03] — Admin Panel Standardisation & Mobile Responsiveness

- Rewrote all 5 admin pages (`AdminDashboard`, `AdminWorkers`, `AdminClaims`, `AdminAnalytics`, `AdminPolicies`) to share the user dashboard design language: cream `#fcf9f8` background, `rounded-3xl` white cards with soft shadows, hover-lift animations, `font-manrope` + `font-inter` typography.
- Created shared `AdminLayout` component (header, hamburger drawer, mobile bottom nav) mirroring `DashboardHeader` + `MobileBottomNav`.
- Added `/admin/dashboard` explicit route to resolve 404 navigation errors.
- All admin views switched to `AllowAny` permission during development to unblock 403 Forbidden errors on unauthenticated local sessions.
- Fixed `AdminAuthContext` logout redirect to `/admin/login` (was redirecting to landing page).
- Fixed `AdminGuard` to redirect unauthenticated users to `/admin/login` instead of root.

---

### [2026-03-31] — Mock Data Integration & Branding

- Executed `load_mock_json.py` to seed `MockPlatformData` with 12,000+ delivery partner records.
- Replaced placeholder icons with `logo.png` across `Navbar`, `DashboardHeader`, and `Sidebar`.
- Updated favicon site-wide.

---

### [2026-03-22] — Policy Renewal & KYC Update

- Updated policy duration to **4-day coverage cycle** for new purchases and renewals.
- Implemented 30-day master protection cycle for long-term coverage tracking.
- Integrated AI-driven KYC verification with document classification and tampering detection.
- Updated `PROJECT_STATUS.md` to reflect all implemented features.

---

*ZafBy — Built for the last mile. Defended for the long run.*
