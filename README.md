# Aitinerary

AI-powered travel planner built for the AMD Developer Hackathon. Aitinerary generates personalized, day-by-day trip itineraries based on your travel "vibe" — chill, adventure, luxury, or cultural — complete with an adaptive UI and clean, exportable plans.

Live demo: https://amd-hackathon-pi.vercel.app

## Features

- Generates structured, day-wise itineraries from a simple trip description
- Personalizes recommendations based on user-selected travel vibe
- Responsive UI for desktop and mobile
- AI-generated itinerary content ready for real-world travel use

## Tech Stack

- **Frontend:** React (JavaScript)
- **Backend:** Python

## Project Structure

```
AMD_Hackathon/
├── frontend/   # React application
└── backend/    # Python API server
```

## Setup

### Prerequisites

- Node.js (v18+) and npm
- Python 3.10+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/7078-cj/AMD_Hackathon.git
cd AMD_Hackathon
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory with any required API keys (e.g. your model/inference provider key). Use the provided `.env.example` as a guide — copy it and fill in your own values:

```bash
cp .env.example .env
```


Start the backend server (adjust the command/port to match the framework used in `backend/`, e.g. Flask/FastAPI/Django):

```bash
python manage.py runserver
# or: flask run
# or: uvicorn main:app --reload
```

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will typically be available at `http://localhost:5173` (Vite) or `http://localhost:3000`, and will call the backend API — make sure the backend URL is configured correctly (check for a `.env` or config file in `frontend/`).

## Usage

1. Start the backend server.
2. Start the frontend dev server.
3. Open the app in your browser, describe your trip and desired vibe, and generate your itinerary.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

## License

MIT License