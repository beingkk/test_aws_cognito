# test_aws_cognito

A simple web application with a NextJS frontend and FastAPI backend.

## Structure

```
.
├── backend/    # FastAPI backend (Python, managed with uv)
└── frontend/   # NextJS frontend (TypeScript, managed with npm)
```

## Getting started

### Backend

The backend uses [uv](https://docs.astral.sh/uv/) for dependency management.

**Install uv** (if not already installed):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Install dependencies and run the backend:**

```bash
cd backend
uv sync
uv run python main.py
```

The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/` to see the hello world response.

### Frontend

The frontend uses [npm](https://nodejs.org/) for dependency management. Node.js 18+ is required.

**Install dependencies and run the frontend:**

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.