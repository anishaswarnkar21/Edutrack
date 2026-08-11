# EduTrack

Web-based classroom management system with AI quiz generation and performance analytics —
implemented as a MERN app (MongoDB, Express, React, Node) plus a separate Python ML
microservice for AI-powered quiz generation, per the project proposal
(`Minor Project EduTrack (1) (1).pdf`).

## Architecture

```
frontend/   React SPA (Vite), MVVM architecture
backend/    Node.js + Express REST API, MongoDB (Mongoose), layered architecture
ML/         Python + FastAPI microservice, Hugging Face seq2seq model (fine-tunable)
ML-local/   Python + FastAPI microservice, runs today with zero ML deps (synthetic mode)
            or a small existing local HF question-generation model - see below
```

```
React (frontend) --HTTP/JWT--> Express (backend) --HTTP (no auth, localhost-only)--> FastAPI (ML or ML-local)
                                     |
                                  MongoDB
```

There are **two interchangeable ML services** - same `/health` + `/generate-quiz` contract,
so the backend just points `ML_SERVICE_URL` at whichever one is running:

- **`ML/`** (default, port 8000) — the medium model, `google/flan-t5-base` (~250M params),
  and the one you'll fine-tune per the project's "one important model" requirement (see
  [ML/app/training/README.md](ML/app/training/README.md)). Generation is a two-stage
  pipeline (ask the model for a genuine comprehension question, then ask it to answer that
  question extractively from the same passage; 3 distractors are built from the lesson's own
  vocabulary) - a single prompt asking for the full MCQ format in one shot proved unreliable
  in testing. Real MCQs, not fill-in-the-blank; ~4-5s per question on CPU.
- **`ML-local/`** (port 8001) — for iterating with zero setup: a synthetic (rule-based,
  zero-ML-dependency) mode by default, or a small existing question-generation model
  (`valhalla/t5-small-qg-hl`) already published on the HF Hub. Lower quality than `ML/` but
  instant and needs nothing installed beyond FastAPI. See [ML-local/README.md](ML-local/README.md).

- **backend** owns auth, class/attendance/lesson/analytics data, and orchestrates quiz
  generation: it extracts lesson PDF text (`pdf-parse`) and calls the ML service, then
  persists the returned questions.
- **ML** only does one thing: given lesson text, return structured MCQs. It's a separate
  service (not an in-process call, not a hosted LLM API) specifically so you can fine-tune
  and iterate on the model independently of the web app. See
  [`ML/app/training/README.md`](ML/app/training/README.md).
- **frontend** follows MVVM: `models/` (plain data classes) + `services/` (API calls — the
  Model's data-access layer) + `viewmodels/` (hooks holding state & logic) + `views/` /
  `components/` (presentation only, no business logic).

Full API contract (backend⇄frontend and backend⇄ML) is documented in [UPDATES.md](UPDATES.md).

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a connection string to one)
- Python 3.10+

## Setup

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env      # edit MONGO_URI / JWT_SECRET as needed
npm run dev                 # http://localhost:5000
npm run seed:admin          # creates the one admin account (see "Admin account" below)
```

### 2. ML service — pick ONE to run

**Option A: `ML/` (default — the medium model, real MCQs)**

```powershell
cd ML
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

`run.ps1` creates the venv, installs dependencies, and starts the server in one step — see
[ML/README.md](ML/README.md) for the manual steps and IDE notes. First request after startup
downloads `google/flan-t5-base` (~1GB) from the Hugging Face Hub if not already cached.
Generation runs in the background after a lesson is uploaded, so this doesn't block the UI -
expect the "Quiz ready" badge to take 20-30s to flip on CPU.

**Option B: `ML-local/` (instant, zero setup, lower quality)**

```powershell
cd ML-local
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

`run.ps1` creates the venv, installs what's needed for the current mode, and starts the
server in one step — see [ML-local/README.md](ML-local/README.md) for details.

Whichever you run, set `backend/.env`'s `ML_SERVICE_URL` to match its port (`8000` or `8001`).
No API key/auth is needed between backend and either ML service - both only ever run on
localhost.

### 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev                 # http://localhost:5173
```

Start order: MongoDB → ML service → backend → frontend (backend calls the ML service, so
bring that up first; the frontend just needs the backend reachable).

## Admin account

There's no "admin" option on the public register form — the only way to get one is:

```bash
cd backend
npm run seed:admin
```

Idempotent (safe to re-run) - creates one admin from `ADMIN_NAME`/`ADMIN_EMAIL`/
`ADMIN_PASSWORD` in `backend/.env` (defaults: `Admin` / `admin@edutrack.local` /
`ChangeMe123!` - **change the password after first login**, from Profile). Log in with those
credentials like any other account; the sidebar automatically switches to the admin view
(Overview / Users / Classes) instead of the teacher/student one. Admins can edit or delete
any user (with cascading cleanup of their classes/enrollments/attendance/results) and any
class, and reset any user's password directly.

## Fine-tuning the quiz model

The AI-Powered Quiz Generation module is designed around **one** model you fine-tune
yourself: see [`ML/app/training/README.md`](ML/app/training/README.md) for the full
label → prepare → train → serve loop. No backend or frontend changes are needed once
you've trained it — `ML/app/config.py` picks up the fine-tuned checkpoint automatically.

## Repo docs

- [UPDATES.md](UPDATES.md) — running build log + architecture decisions + full API contract
- [backend README-level comments](backend/src/config/config.js) — see inline comments in
  `config.js` for why local disk storage / separate ML service were chosen over the
  proposal's AWS S3 / hosted LLM API
- [ML/README.md](ML/README.md) — ML service setup and endpoints
- [ML/app/training/README.md](ML/app/training/README.md) — fine-tuning walkthrough
