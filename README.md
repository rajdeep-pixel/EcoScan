# 🌍 EcoScan — AI-Powered Community Waste Management

[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
[![Groq](https://img.shields.io/badge/Groq_AI-FF6C37?style=for-the-badge)](#)
[![Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=for-the-badge&logo=leaflet&logoColor=white)](#)

**EcoScan** is a real-time, gamified community waste management platform. Citizens report local waste spots on an interactive map; volunteers claim and clean them up. Every submission is automatically verified by an AI vision model before points are awarded. A second AI pipeline cross-checks the reported GPS location against Google Maps Street View to detect fraudulent or misplaced reports.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗺️ **Interactive Map** | Leaflet map with custom severity markers, Street & Satellite views |
| 🔥 **Snapchat-Style Heatmap** | Toggle a heat overlay to see high-density waste zones at a glance |
| 🤖 **AI Cleanup Verification** | Groq Vision LLM compares before & after photos to approve or reject cleanups |
| 📍 **Location Image Check** | AI cross-checks the uploaded image against Google Street View for the same coordinates |
| 🎯 **Severity Filter** | Filter map markers by status (Reported / Active / Cleaned) or severity (High / Medium / Low) |
| 🏆 **Gamified Leaderboard** | Volunteers earn points per cleanup (Low = 10 / Medium = 25 / High = 50 pts) with badge tiers |
| 🎨 **8 Visual Themes** | Midnight · Matrix · Sunset · Ocean · Purple · Cherry · Arctic · Forest |
| 🔄 **Live Refresh** | One-click report refresh with spinning indicator and "last refreshed Xs ago" tooltip |
| 📊 **Stats Drawer** | Analytics panel with reported / in-progress / cleaned breakdowns |
| 🌐 **Bilingual UI** | English and Hindi language support |
| 🔔 **Toast Notifications** | Contextual success / error / info toasts for all user actions |
| 🌐 **Real-Time WebSockets** | New reports and status changes broadcast instantly to all connected users |

---

## 🏗️ System Architecture

EcoScan uses a decoupled client-server architecture with real-time WebSocket synchronisation and two independent AI pipelines.

```mermaid
flowchart TB
    subgraph Client ["Frontend — React 18 + Vite"]
        UI[Professional Dark UI]
        Map[Leaflet Interactive Map]
        Heatmap[Snapchat Heatmap Layer]
        WSClient[WebSocket Client]
    end

    subgraph Backend ["FastAPI — Python 3"]
        Auth[Auth Handler]
        Report[Report Controller]
        WSMgr[WebSocket Manager]
        AI_Cleanup[AI Cleanup Verifier]
        AI_Location[AI Location Verifier]
    end

    subgraph External ["External Services"]
        Neon[(Neon PostgreSQL / SQLite)]
        Groq[Groq Vision API]
        StreetView[Google Street View API]
    end

    UI -->|REST API| Backend
    WSClient -->|Live Updates| WSMgr
    WSMgr --> WSClient
    Report --> Neon
    Auth --> Neon
    AI_Cleanup -->|Before & After Images| Groq
    AI_Location -->|GPS Coords + Photo| Groq
    AI_Location -->|Fetch Reference Image| StreetView
```

---

## 🎨 UI Design System

### Header (48px slim bar)
The top navigation bar is a strict **3-zone layout**:

```
[ Logo ]  ←── [ Map | Filter | Language | Theme | Refresh ] ──→  [ Live Stats ]
```

- Every button has `hover:scale-110` with smooth easing
- Custom **Tip tooltip** component with arrow + fade-in animation
- Grouped buttons in pill containers with vertical dividers

### Visual Themes
All themes use CSS `filter` (hue-rotate + saturation + brightness) for a zero-overhead, instant colour transformation:

| Theme | Hue Shift | Mood |
|---|---|---|
| 🌙 Midnight | None | Default dark teal |
| 💚 Matrix | +35° | Cyberpunk lime |
| 🌅 Sunset | +165° | Warm amber gold |
| 🌊 Ocean | +200° | Cool sky blue |
| 💜 Purple | +260° | Deep violet |
| 🌸 Cherry | +320° | Rose pink |
| ❄️ Arctic | +185° desaturated | Ice white-blue |
| 🌲 Forest | +55° | Earthy olive |

### Sidebar
- Collapsed rail: shows avatar, leaderboard icon, quick stats, logout
- Expanded: profile card · last report card · leaderboard shortcut · impact stats · badge tier progression
- Toggle: `PanelLeftClose / PanelLeftOpen` icon embedded in the header row

---

## 🤖 AI Pipelines

### 1 — Cleanup Verification (`ai_review.py`)
1. Volunteer uploads an **"after"** photo.
2. Backend sends both before and after base64 images + location description to **Groq Vision** (`meta-llama/llama-4-scout-17b-16e-instruct`).
3. Model returns structured JSON: `status` (approved / rejected), `confidence` (0.0–1.0), `summary`.
4. On approval → points awarded, marker turns cleaned (slate); on rejection → `verification-failed` status shown.

### 2 — Location Image Verification (`ai_review_location.py`)
1. When a citizen submits a report, the backend fetches a **Google Street View** static image for the GPS coordinates.
2. Both the citizen's uploaded photo and the Street View reference are sent to Groq Vision.
3. The model checks whether the uploaded photo plausibly matches the real-world location.
4. Result stored in `loc_verification_status` / `loc_verification_confidence` / `loc_verification_summary` columns.

---

## 📊 Database Schema

### Users Table
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | — |
| `name` | String | Display name |
| `email` | String | Unique |
| `password_hash` | String | PBKDF2-HMAC-SHA256 |
| `role` | String | `citizen` or `volunteer` |
| `auth_token` | String | Session token |
| `total_score` | Integer | Gamification points |
| `cleanup_count` | Integer | Verified cleanups |
| `report_count` | Integer | Reports submitted |

### Reports Table
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | — |
| `lat` / `lng` | Float | GPS coordinates |
| `severity` | String | `low` / `medium` / `high` |
| `status` | String | `reported` · `in-progress` · `pending-review` · `cleaned` · `verification-failed` |
| `desc` | String | Citizen description |
| `landmark` | String | Nearby reference |
| `image_data` | Text | Base64 before photo |
| `after_image_data` | Text | Base64 after photo |
| `reporter_id` | FK → Users | Who reported |
| `claimed_by_id` | FK → Users | Volunteer claiming |
| `verification_status` | String | Cleanup AI result |
| `verification_confidence` | Float | 0.0 – 1.0 |
| `verification_summary` | String | AI explanation |
| `loc_verification_status` | String | Location AI result |
| `loc_verification_confidence` | Float | 0.0 – 1.0 |
| `loc_verification_summary` | String | Location AI explanation |

---

## 🕹️ Demo Walkthrough

To see the full lifecycle, create **two accounts** — one Citizen and one Volunteer.

### Step 1 — Report (Citizen 👤)
1. Register / Login as **Citizen**
2. Click the **`+`** FAB (bottom-right)
3. Choose severity, drop a pin on the map, upload a before photo, add description + landmark
4. Submit — the marker broadcasts live to all connected users

### Step 2 — Clean Up (Volunteer 🧹)
1. Login as **Volunteer**
2. Click any reported marker → **"Claim for Cleanup"** (marker turns amber/pulsating)
3. After cleaning: click marker → **"Submit Proof"**, upload the after photo

### Step 3 — AI Verification 🤖
1. Groq Vision compares before & after photos
2. **Approved** → spot marked Cleaned, volunteer awarded points, leaderboard updates instantly
3. **Rejected** → status shows `verification-failed` with AI summary visible on the marker popup

### Step 4 — Explore the Map 🗺️
- Toggle **Heatmap View** (top-right on map) to see waste density
- Use the **Filter** dropdown in the header to isolate High / Active / Cleaned markers
- Switch **Visual Theme** from the palette icon in the header
- Click **Refresh** (↻) to pull the latest reports from the server

---

## 🚀 Local Development

Two terminals required.

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# API runs on http://localhost:8000
# Swagger UI: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5174
```

---

## ⚙️ Environment Variables

### `backend/.env`
```env
# Required — get your key at https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Optional — defaults to local SQLite (ecoscan.db)
DATABASE_URL=postgresql://user:password@host/dbname

# Optional — enables Google Street View location verification
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

### `frontend/.env`
```env
# Points the frontend to your deployed backend (optional in local dev)
VITE_API_BASE_URL=https://your-backend-api.com
```

---

## 🏅 Gamification — Badge Tiers (Volunteers)

| Badge | Points Required | Icon |
|---|---|---|
| Eco Explorer | ≥ 50 pts | 🌱 |
| Green Knight | ≥ 150 pts | ⚔️ |
| Eco Champion | ≥ 300 pts | 👑 |

Severity → points: **Low = 10 · Medium = 25 · High = 50**

---

## 🔒 License

This project is proprietary. All rights reserved by the EcoScan team.