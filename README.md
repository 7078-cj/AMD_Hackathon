
<img width="1919" height="938" alt="image" src="https://github.com/user-attachments/assets/f1595233-6e3a-4661-8d9b-4c425106da99" />


<img width="1919" height="866" alt="image" src="https://github.com/user-attachments/assets/57ace4a8-a7d9-497e-8948-38fbd5e0d774" />

# Aitinerary

AI-powered travel planner built for the **AMD Developer Hackathon**. Aitinerary generates personalized, day-by-day trip itineraries based on your travel "vibe" — chill, adventure, luxury, or cultural — complete with an adaptive UI and clean, exportable plans.

**Live demo:** https://amd-hackathon-pi.vercel.app

---

## What We Built

Aitinerary takes a short natural-language trip description (destination, dates, and a chosen "vibe") and turns it into a structured, day-by-day itinerary. A Django backend orchestrates the LLM call and enriches the response with real location data, while a React/Vite frontend renders an adaptive, exportable UI that adjusts its look and content based on the selected vibe.

**Flow:** user input → Django API (`backend/`) → LLM (Fireworks AI, running on AMD Instinct GPUs) generates itinerary structure → Geoapify enriches locations → structured JSON returned → React frontend (`frontend/`) renders the day-by-day plan.

## AMD Resource Usage

This project uses **Fireworks AI** as its primary LLM provider. Fireworks serves its models on **AMD Instinct MI300X GPUs**, which is how our itinerary-generation calls make use of AMD compute for this hackathon track.

- All LLM calls are made from the backend, in [`backend/`](./backend) (see LLM client/service module).
- The Fireworks API key is supplied via `FIREWORKS_AI_KEY` in `backend/.env`.
- Gemini is included only as a fallback/alternate provider for local development flexibility — **for AMD track evaluation, run with `FIREWORKS_AI_KEY` set (and `GEMINI_AI_KEY` left blank)** so all generation traffic goes through AMD-backed compute.

## Main Code Path (Easy-to-Find Implementation)

| What | Where |
|---|---|
| LLM prompt construction & Fireworks/Gemini call | `backend/api/travel/ai.py` — itinerary generation service/view |
| Itinerary API endpoint | `backend/` — Django URLs/views for `/api/` |
| Geoapify location enrichment | `backend/api/travel/geocoder.py` — location service module |
| Frontend itinerary UI | `frontend/src/` — itinerary/trip components |
| Vibe-based adaptive styling | `frontend/src/` — vibe/theme logic |

```
AItinerary/
├── frontend/   # React (Vite) application — UI, vibe theming, itinerary display
└── backend/    # Django API server — LLM orchestration, itinerary generation, location enrichment
```

## External Services Used

| Service | Purpose | Required? |
|---|---|---|
| [Fireworks AI](https://fireworks.ai) | LLM inference on AMD Instinct GPUs — generates itinerary content | Yes (or Gemini, see note above) |
| [Google Gemini](https://ai.google.dev) | Alternate LLM provider (local dev fallback) | Optional |
| [Geoapify](https://www.geoapify.com) | Location/place data used to enrich itinerary stops | Yes |

All keys are supplied via environment variables — see [Setup](#setup) below. No service is called from the frontend directly; all external API calls happen server-side in `backend/`.

## Features

- Generates structured, day-wise itineraries from a simple trip description
- Personalizes recommendations based on user-selected travel vibe
- Responsive UI for desktop and mobile
- AI-generated itinerary content ready for real-world travel use

## Tech Stack

- **Frontend:** React + Vite (JavaScript)
- **Backend:** Django (Python)
- **LLM providers:** Fireworks AI (AMD Instinct GPUs) or Gemini (pick one — Fireworks recommended for AMD track)
- **Location data:** Geoapify

## Setup

You can run Aitinerary either with Docker (recommended, fastest) or manually on your machine. Either path gets you a fully **runnable** local instance.

### Prerequisites

- Docker & Docker Compose (for the Docker setup), **or**
- Node.js (v18+) + npm and Python 3.12 (for a manual setup)
- Git
- API keys: **Fireworks AI** (recommended, AMD-backed) or Gemini, plus a Geoapify API key

### 1. Clone the repository

```bash
git clone [https://github.com/7078-cj/AMD_Hackathon.git](https://github.com/7078-cj/AItinerary.git)
cd AItinerary
```

### 2. Configure environment variables

**Backend** — use `backend/.env.example` as a guide, copy it and fill in your own values:

```bash
cp backend/.env.example backend/.env
```

```dotenv
SECRET_KEY=secret key
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173
# Use FIREWORKS_AI_KEY for AMD-backed inference (recommended for this track).
# Only set one of the two LLM keys.
FIREWORKS_AI_KEY=<Fireworks api key>
GEMINI_AI_KEY=<Gemini Api key>
GEOAPIFY_API_KEY=<Geoapify api key>
```

**Frontend** — use `frontend/.env.example` as a guide, copy it and fill in your own values:

```bash
cp frontend/.env.example frontend/.env
```

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api/
VITE_WS_URL=ws://127.0.0.1:8000
```

### 3. Run with Docker (recommended)

From the repo root, once both `.env` files are in place:

```bash
docker compose up --build
```

This builds and starts both services:

- Backend (Django) → http://localhost:8000
- Frontend (React/Vite) → http://localhost:5173

The backend container automatically runs migrations (`python manage.py migrate`) before starting the server.

To stop:

```bash
docker compose down
```

### 4. Manual setup (without Docker)

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

**Frontend** (in a new terminal):

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

- Backend runs on: `http://127.0.0.1:8000`
- Frontend runs on: `http://localhost:5173`

## Usage

1. Start the backend and frontend (via Docker Compose or manually).
2. Open `http://localhost:5173` in your browser.
3. Describe your trip and desired vibe, and generate your itinerary.

## Originality

Aitinerary was built from scratch by our team for the AMD Developer Hackathon. Third-party dependencies (React, Django, and the Fireworks/Gemini/Geoapify SDKs/APIs) are used as libraries and services only; all application logic, prompt design, and UI were written by us for this submission.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

## License

MIT License
