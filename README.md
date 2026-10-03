# Pickleball Pro 🏓
**Full-Stack Match Scoring, Tournament Management, Player Analytics & Court Booking**

Pickleball Pro is a modern, responsive, mobile-first web and mobile platform built for competitive pickleball clubs, tournament directors, and casual players. It features authentic USA Pickleball rule enforcement (including the official side-out "0-0-2" server rotation and court positioning), alternative modern rally scoring, real-time speech referee calls, interactive tournament brackets, court reservation grids, and DUPR player tracking.

---

## 🚀 Key Features

### 1. Courtside Live Scoreboard & Speech Referee
- **Official Side-Out Scoring**: Enforces authentic doubles scoring with Server 1 and Server 2 rotations. Matches start on "0-0-2", where the first serving team receives only one serve before side-out.
- **Rally Scoring Toggle**: Modern point-per-rally mode for faster recreational matches or tie-breaks.
- **Audible Score Calling**: Integrated Web Speech API referee calls out scores aloud (e.g. *"4 - 3 - 1"*) on every rally change.
- **Giant Touch Tap Targets**: Designed for sweaty fingers courtside on mobile phones and tablets.
- **One-Touch Undo (Ctrl+Z)**: Full snapshot state history allows unlimited undo of accidental point clicks.
- **Match Point & Win-by-2 Detection**: Automatically tracks 11, 15, or 21-point targets with strict 2-point lead enforcement.

### 2. Interactive 2D Court Visualizer
- **Regulation Dimensions**: Accurate 20' × 44' court layout with a dedicated 7' Non-Volley Zone (The Kitchen).
- **Dynamic Player Positioning**: Tracks player switches on points scored and displays current right/left service court assignments.
- **Active Server Indicator**: Highlights the serving quadrant with a pulsing neon ring.

### 3. Tournament Bracket Management
- **Single Elimination & Round Robin**: Visual bracket trees with live scores, seeds, and advancement status.
- **One-Click Live Scoring**: Tap any bracket match to launch the courtside scoring interface instantly.
- **Custom Prize Pools & Seeding**: Auto-seeds opening rounds from registered players.

### 4. Court Booking & Schedule Grid
- **Hourly Reservation Grid**: Visual time-slot grid from 8:00 AM to 9:00 PM across all facility courts.
- **Court Amenities**: Displays surface type (Hardcourt Acrylic, Cushioned), location, and night lighting status.
- **Instant Booking**: One-click court reservations and cancellation management.

### 5. Player Roster & DUPR Rating Tracker
- **Skill Level Tracking**: Track official DUPR ratings (e.g. 3.5, 4.5, 5.9).
- **Performance Metrics**: Win rate percentages, matches played, and win/loss records.
- **Tactical Preference**: Flags preferred court sides (Left stacking vs. Right).

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.12, FastAPI, Uvicorn, SQLAlchemy |
| **Database** | SQLite (Zero-config local persistence, scalable to PostgreSQL) |
| **Audio / Speech**| Web Speech API (`SpeechSynthesisUtterance`) |
| **Testing** | Pytest (Scoring engine unit tests covering side-out, rally, and undo) |

---

## 🏁 Quickstart Guide

### 1. Launch Everything with One Command
From the root directory (`/home/viki/Projects/pickleball`):

```bash
./run_dev.sh
```

This starts:
- **Frontend App**: [http://localhost:5174](http://localhost:5174)
- **Backend API Docs (Swagger)**: [http://localhost:8001/docs](http://localhost:8001/docs)

---

### 2. Running Individual Services

#### Backend:
```bash
cd backend
source .venv/bin/activate
export PYTHONPATH=.
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend:
```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5174
```

---

### 3. Running Unit Tests
To verify the pickleball scoring engine:

```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. pytest -p no:launch_testing tests/
```

All 6 test suites verify:
- Initial "0-0-2" score calling
- Doubles serving point awards and court-side swapping
- Side-out rotation from Server 1 $\rightarrow$ Server 2 $\rightarrow$ Opponent Side-Out
- Singles score parity (even on right, odd on left)
- Rally scoring mode
- Win-by-2 condition (e.g. 10-10 $\rightarrow$ 11-10 not won $\rightarrow$ 12-10 won)
- Full undo history snapshot restoration

---

## 📂 Project Structure

```
/home/viki/Projects/pickleball/
├── backend/
│   ├── app/
│   │   ├── database.py         # SQLite connection & session management
│   │   ├── models.py           # SQLAlchemy models: Player, Court, Match, Tournament
│   │   ├── schemas.py          # Pydantic v2 schemas
│   │   ├── scoring_engine.py   # Official Pickleball scoring rules & undo stack
│   │   ├── routers/
│   │   │   ├── matches.py      # Match creation, rally execution, undo, reset
│   │   │   ├── tournaments.py  # Tournament brackets and round advancement
│   │   │   ├── courts.py       # Court listings and hourly reservations
│   │   │   └── players.py      # Player directory and DUPR ratings
│   │   └── main.py             # FastAPI app with auto-seeding demo data
│   ├── requirements.txt
│   └── tests/
│       └── test_scoring.py     # Comprehensive rules test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Header & tab switcher
│   │   │   ├── LiveScoreTracker.tsx  # Courtside scoreboard & speech referee
│   │   │   ├── CourtVisualizer.tsx   # 2D 20'x44' court & player positioning
│   │   │   ├── TournamentBracket.tsx # Visual elimination tournament tree
│   │   │   ├── CourtBookingGrid.tsx  # Facility hourly booking grid
│   │   │   ├── PlayerStatsCard.tsx   # DUPR rating cards & win rates
│   │   │   └── NewMatchModal.tsx     # Match configuration modal
│   │   ├── services/
│   │   │   └── api.ts               # REST API service client
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── App.tsx                  # Main application state orchestrator
│   │   └── index.css                # Tailwind directives & dark theme
│   ├── vite.config.ts               # Proxy configuration to port 8001
│   ├── tailwind.config.js           # Pickleball court color themes
│   └── package.json
├── Dockerfile                       # Production multi-stage container
├── render.yaml                      # Render.com free blueprint
├── share_public.sh                  # Instant free Cloudflare HTTPS tunnel
├── run_dev.sh                       # Unified startup script
└── README.md
```

---

## 🌐 Free Hosting & Public Sharing Options

### Option 1: Instant Free Public Link (Live Right Now)
Your system has Cloudflare Tunnel installed. To generate an instant, secure public HTTPS URL accessible from any mobile phone or browser in the world (with zero accounts or fees):

```bash
./share_public.sh
```
This gives you a live `https://<unique-id>.trycloudflare.com` URL that routes directly to your court app.

---

### Option 2: 100% Free 24/7 Hosting on Hugging Face Spaces (Recommended)
Hugging Face provides free, non-sleeping 24/7 Docker CPU containers:
1. Create a free account at [huggingface.co](https://huggingface.co).
2. Click **New Space** $\rightarrow$ Space Name: `pickleball-pro` $\rightarrow$ Select **Docker** (Blank).
3. Push this directory to your Space repository:
   ```bash
   git remote add space https://huggingface.co/spaces/<YOUR-USERNAME>/pickleball-pro
   git push space main
   ```
4. Your app is live at `https://<YOUR-USERNAME>-pickleball-pro.hf.space` with 24/7 uptime!

---

### Option 3: Free Web Service on Render.com
Render offers a free tier for Docker/Python web services:
1. Push this project to GitHub.
2. Log in to [render.com](https://render.com) and click **New +** $\rightarrow$ **Blueprint**.
3. Select your repository (it will automatically read [`render.yaml`](file:///home/viki/Projects/pickleball/render.yaml) and [`Dockerfile`](file:///home/viki/Projects/pickleball/Dockerfile)).
4. Click **Apply** to deploy for free with automatic SSL.

