# 🌍 EcoScan: AI-Powered Community Waste Management

![EcoScan Banner](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)

**EcoScan** is a real-time, gamified platform designed to empower communities to report, verify, and clean up local waste. By combining geolocation, real-time WebSocket synchronization, and advanced AI vision models, EcoScan bridges the gap between civic reporting and actual environmental action.

## ✨ Key Features

* **📍 Real-Time Geospatial Mapping:** Drop pins on an interactive map to report waste severity (Low, Medium, High).
* **🤖 AI Cleanup Verification:** Volunteers upload "after" photos. Our integrated Groq Vision LLM automatically analyzes the before/after photos to verify if the cleanup is legitimate before awarding points.
* **⚡ Live Synchronization:** Built on WebSockets, the map and leaderboards update instantly across all connected clients without needing to refresh.
* **🏆 Gamification & Leaderboards:** Volunteers earn points based on the severity of the waste they clean, driving community engagement through competitive leaderboards.
* **🌐 Multilingual Support:** Seamlessly toggle between English and Hindi to maximize accessibility.
* **✨ Premium 3D UI:** Features an optimized WebGL Three.js interactive globe and fluid glassmorphism design.

---

## 🛠️ Tech Stack & Architecture

### **Backend & Database**
* **Framework:** Python 3, FastAPI, Uvicorn (ASGI)
* **Database:** PostgreSQL (Neon Serverless), SQLAlchemy ORM
* **Real-Time Engine:** FastAPI Native WebSockets
* **AI Integration:** Groq API (`llama-4-scout-17b-16e-instruct` Vision Model)
* **Security:** PBKDF2 HMAC SHA-256 password hashing, Custom Token Auth

### **Frontend**
* **Framework:** React 18, Vite
* **Mapping:** React-Leaflet, Leaflet.js, Google Maps Tile API
* **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`
* **Styling:** Tailwind CSS, Custom CSS (Fluid keyframes, Canvas Canvas manipulation)
* **Networking:** Axios with global interceptors

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

## 👥 The Team

EcoScan was architected and developed by a dedicated team focused on scalable software and premium user experiences.

* **Shreyas** — *Backend & Database Architect*
  * Designed the PostgreSQL schema, built the FastAPI backend, implemented real-time WebSocket broadcasting, and engineered the AI vision integration.
* **Rajdeep** — *Frontend Developer*
  * Developed the React application, integrated the Leaflet mapping system, managed global state, and engineered the WebGL/Three.js visualizations.
* **Tulsi** — *UI/UX Designer*
  * Designed the user journey, crafted the glassmorphism aesthetic, created fluid animations, and ensured a highly accessible, mobile-responsive layout.

---

## 🚀 Local Development Setup

To run EcoScan locally, you will need two terminal windows—one for the FastAPI backend and one for the React frontend.

## 1. Backend Setup
```bash
cd backend
```
## Create and activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```
## Install dependencies
```bash
pip install -r requirements.txt
```
## Start the server
```bash
uvicorn main:app --reload
```

## 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
## 3. Environment Variables
### Create a .env file in your backend/ directory:

```bash
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://user:password@host/dbname
```
### Create a .env file in your frontend/ directory:
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/updates
```
---

## 🔒 License
This project is proprietary. All rights reserved by the EcoScan team.