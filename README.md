# 🌍 EcoScan: AI-Powered Community Waste Management

[![Status](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](#)

**EcoScan** is a real-time, gamified community waste management platform designed to empower citizens to report local waste and volunteers to verify and clean up spots. By combining interactive Leaflet mapping, real-time WebSocket synchronization, and advanced AI vision models, EcoScan bridges the gap between community civic reporting and environmental action.

---

## 🏗️ System Architecture & Design

EcoScan uses a decoupled client-server architecture built for high responsiveness, secure authentication, and low-latency real-time state synchronization.

```mermaid
flowchart TB
    subgraph Client [Frontend App - React & Leaflet]
        UI[Glassmorphism UI]
        Map[Interactive Leaflet Map]
        WSClient[WebSocket Client]
    end

    subgraph Backend [FastAPI Server]
        Auth[Authentication Handler]
        Report[Report Controller]
        WSMgr[WebSocket Connection Manager]
        AI[AI Vision Verification Service]
    end

    subgraph External [Services]
        Neon[(Neon Serverless PostgreSQL)]
        Groq[Groq Vision API]
    end

    UI -->|1. REST API Requests| Backend
    Map -->|2. Drop Pin and View Markers| UI
    WSClient -->|3. Live Updates JSON| WSMgr
    WSMgr --> WSClient
    Report -->|4. Read and Write Models| Neon
    Auth -->|5. Password Hash and Token Verification| Neon
    AI -->|6. Compare before and after images| Groq
```

### 1. Frontend Architecture
- **Component Design:** Built using **React 18** and **Vite** with component-driven styling. It features a responsive grid with dark glassmorphism styling and custom HSL colors.
- **3D Interactive Graphics:** Powered by **Three.js** via `@react-three/fiber` and `@react-three/drei` to render an optimized WebGL interactive globe on the landing page showing active global waste reports.
- **Interactive Mapping:** Powered by **React-Leaflet** and **Leaflet.js**, featuring custom vector marker rendering, styled dark Google Maps street view tiles, and custom location-picking overlays.
- **Network Layer:** Axios with request interceptors to automatically attach Bearer Auth tokens stored in session storage.

### 2. Backend Architecture
- **API Framework:** Built on **FastAPI** (Python 3) using an ASGI interface with **Uvicorn** for async request handling.
- **Real-Time Synchronizer:** Built using native WebSockets. When a report is created or updated, the server broadcasts JSON payloads to all active WebSocket connections, updating the map and leaderboards instantly without client refreshes.
- **ORM & Database:** SQLAlchemy ORM handles relations. It supports PostgreSQL (Neon Serverless) in production and automatically falls back to SQLite (`ecoscan.db`) locally.
- **Security Pipeline:** PBKDF2 HMAC SHA-256 password hashing with a secure token authentication scheme.

### 3. AI Verification Pipeline
- **API Integration:** Connects to the **Groq Vision API** to review submitted cleanup proofs.
- **Model Configuration:** Employs **`meta-llama/llama-4-scout-17b-16e-instruct`** for high-accuracy multimodal comparisons.
- **Verification Logic:**
  1. The volunteer uploads an "after" cleanup photo.
  2. The backend sends both the original "before" image and the new "after" image to Groq in a structured base64 payload.
  3. The model reviews description and landmark context to verify that the photo shows the same location and that the waste has been successfully cleaned.
  4. The model returns a structured JSON output mapping the verification to `approved` or `rejected`, a confidence score (0.0 to 1.0), and a detailed explanation summary.

---

## 📊 Database Schema & Data Model

The database holds two primary entities with relational integrity:

### **Users Table**
- `id` (Integer, Primary Key)
- `name` (String, Unique) - Volunteer/Citizen identifier
- `email` (String, Unique)
- `password_hash` (String) - Encrypted credentials
- `role` (String) - `citizen` or `volunteer`
- `auth_token` (String, Indexed) - Session identifier
- `total_score` (Integer) - Gamified scoreboard points
- `cleanup_count` (Integer) - Total verified cleanups
- `report_count` (Integer) - Total reported waste spots

### **Reports Table**
- `id` (Integer, Primary Key)
- `lat` (Float) / `lng` (Float) - Coordinates of the waste
- `severity` (String) - `low` (10 pts), `medium` (25 pts), `high` (50 pts)
- `status` (String) - `reported` | `in-progress` | `cleaned` | `pending-review` | `verification-failed`
- `desc` (String) - Citizen notes
- `landmark` (String) - Geolocation reference
- `image_data` (String) - Before-cleanup base64 image
- `after_image_data` (String) - After-cleanup base64 proof
- `reporter_id` (ForeignKey -> Users) - Reporter link
- `claimed_by_id` (ForeignKey -> Users) - Volunteer link
- `verification_status` (String) - `not-started` | `approved` | `rejected` | `unavailable`
- `verification_confidence` (Float) - Confidence level
- `verification_summary` (String) - AI summary explanation

---

## 🕹️ Interactive Demo Walkthrough

To experience the full gamified lifecycle of EcoScan, you should create **two separate accounts** (one for reporting and one for cleaning) to see the live WebSockets and AI verification in action:

### **Step 1: Report as a Citizen 👤**
1. **Register/Login** as a **Citizen**.
2. Click the **`+` (Add)** floating button in the bottom right.
3. Select the **Severity** of the waste (Low, Medium, High).
4. Click **"Drop pin on map instead"** to enter location-picking mode, then click anywhere on the interactive map.
5. Upload a **"Before"** photo of the garbage, add a short description and landmark, and click **"Submit Report"**.
6. The map will instantly broadcast the new pin to all active users in real-time.

### **Step 2: Clean up as a Volunteer 🧹**
1. **Log out** of the Citizen account, and **Register/Login** with a new email as a **Volunteer**.
2. Locate the reported marker on the map and click it to view details.
3. Click **"Claim for Cleanup"**. The marker will turn to a pulsating yellow, indicating a volunteer is on the way.
4. Once cleaned, click the marker and select **"Submit Proof"**.
5. Upload the **"After"** cleanup photo and submit.

### **Step 3: AI Verification & Scoring 🤖**
1. The **Groq Vision LLM** (`meta-llama/llama-4-scout-17b-16e-instruct`) immediately runs a before-and-after comparison of the photos.
2. It evaluates whether the photos show the same location and if the waste has actually been removed.
3. **If Approved:** The spot is marked as **"Cleaned"** (slate-gray icon), the volunteer is automatically awarded points based on severity (Low = 10, Medium = 25, High = 50 pts), and the global Leaderboard updates live!
4. **If Rejected:** The status changes to **"Verification Failed"**, showing the AI's explanation summary.

---

## 🚀 Local Development Setup

To run EcoScan locally, you will need two terminal windows—one for the FastAPI backend and one for the React frontend.

### **1. Backend Setup**
```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

### **2. Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

---

## ⚙️ Environment Variables

### **Backend (`backend/.env`)**
```bash
# Obtain your key from https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# SQLite is default, but you can specify PostgreSQL for production:
DATABASE_URL=postgresql://user:password@host/dbname
```

### **Frontend (`frontend/.env`)**
*Note: In local development, the frontend automatically falls back to `http://localhost:8000` and `ws://localhost:8000/ws/updates` out of the box.*
```bash
# Points frontend to backend endpoints
VITE_API_BASE_URL=https://your-backend-api.com
```

---

## 🔒 License
This project is proprietary. All rights reserved by the EcoScan team.