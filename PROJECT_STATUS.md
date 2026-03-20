# Zafby: Complete Platform Documentation & Status

## � 1. What is Zafby?
Zafby is an AI-driven income protection and security layer built specifically for the modern gig economy. It provides automated insurance for drivers operating on platforms like Zomato, Swiggy, Zepto, Blinkit, Amazon, and Flipkart. 

By analyzing live weather, traffic, and platform telemetry, Zafby detects unpreventable disruptions (e.g., severe storms or platform outages) and triggers instant, automated payouts—ensuring drivers never lose a day's wage to circumstances beyond their control.

---

## ✨ 2. Comprehensive Core Features

### 🛡️ AI Verification & Fraud Detection Engine
- **Screenshot Forensics**: Workers verify their platform identity by uploading profile screenshots. Zafby's AI scrutinizes the image metadata (EXIF data) and tests integrity to ensure the screenshot isn't tampered with or downloaded from the internet.
- **Auto-Approval Pipeline**: Images reaching a threshold integrity score of `20` are automatically moved to a `VERIFIED` status without human intervention, activating the worker's account instantly.

### 💸 Automated Smart Payouts
- **Zero-Friction Claims**: When a disruption occurs in a verified worker's zone, Zafby cross-references the event securely via an orchestrated AI service.
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
1. A gig worker navigates to the Zafby Landing Page.
2. They initiate registration, supplying their phone number. 
3. The Django backend fires the **Generate OTP View**, returning a 6-digit secure token.
4. The worker submits the token via the **Verify OTP View**. Upon validation, the system instantly logs them in, generating a JWT Access token and sealing their active frontend session under `UserGuard`.

### Step 2: Identity & Platform Authentication
1. The worker selects their specific delivery platform (e.g., Zomato, Zepto) from a grid.
2. The user executes the mock **Platform Connect** step, tying their phone directly to a newly generated `PartnerID` and linking their geographical `Zone`.
3. They upload an earnings or profile screenshot to the **AI Verification Pipeline**.
4. The Python Image Forensics module decomposes the image bytes. If deemed authentic, it flags `is_verified=True`.

### Step 3: Activating Protection & Operating
1. The worker secures their final Active Policy (Standard or Premium) tier, with the secure discount automatically applied if their forensics score returned clean.
2. Once activated, they are dropped into their **Live Dashboard**. 
3. Here, they safely monitor their "Coverage Per Event" (e.g., ₹2000), "Weekly Premium" (e.g., ₹35 deduction), and watch their "Earnings vs. Protected" trends dynamically scale.

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
- **Styling**: `Tailwind CSS`, highly optimized using `cn` (clsx/tailwind-merge) utilities for complex, adaptive, glassmorphism aesthetics.
- **Data Visuals**: Recharts integration (`LineChart`, `PieChart`, `BarChart`) bound seamlessly within Tailwind's responsive grid boundaries.

### Backend Protocol
- **Core Server**: `Python 3` + `Django REST Framework`.
- **Database**: `SQLite3` (Development) transitioning robustly into scalable SQL instances.
- **Architecture**: Separated context apps (`users`, `fraud_detection`, `policies`, `celery_tasks`). 
- **Validation**: Strict `ViewSets` parsing `multipart-form` data alongside token-based session tracking (`RefreshTokens`).

---

## � 5. Current Implementation Checkmarks
- ✅ Full OTP passwordless authentication flow with GenerateOTPView and VerifyOTPView generating JWT tokens.
- ✅ Worker model with comprehensive fields: platform choice (Zomato/Swiggy/etc), zone, pricing_plan, wallet_savings, total_deliveries, govt_id, is_verified.
- ✅ Real-time WeatherService integrating OpenWeatherMap API for claim verification (heavy rain fraud detection) with simulation fallback.
- ✅ InsuranceAI ML service loading joblib models: fraud_model, disruption_model, premium_model for predictions.
- ✅ Risk calculator computing dynamic premiums and realtime risk alerts based on zone/weather/AQI/platform.
- ✅ Celery background tasks: process_claims_for_event, run_fraud_check, ingest_external_data, expire_policies.
- ✅ Claims model with status tracking (PENDING/APPROVED/REJECTED/FRAUD) and compensation tracking.
- ✅ Admin API views: AdminWorkerListView (24k workers), AdminRiskHeatmapView, AdminClaimsMonitoringView, AdminAnalyticsView.
- ✅ Frontend UserAuthContext and AdminAuthContext with sessionStorage and guards preventing unauthorized access.
- ✅ Admin dashboards: AdminAnalytics.tsx with stats/charts, AdminAlerts.tsx with event log and zone broadcasts.
- ✅ TanStack Query integration for efficient data fetching across dashboard components.
- ✅ Complete edge-to-edge UI restructuring for mobile-view responsiveness across standard pages and deep admin dashboards.
- ✅ Table data-wrapping `whitespace-nowrap` optimizations to preserve grid integrity on small mobile layouts. 
- ✅ Active separation of authentication states (Worker Dashboard tracking strictly apart from the Admin portal layout tracking).
- ✅ Completed Python Image Forensics endpoints to validate profile truth. 
- ✅ Implemented smooth anchoring links on the `Landing.tsx` mapping visually down to the Features/Partners sections.
