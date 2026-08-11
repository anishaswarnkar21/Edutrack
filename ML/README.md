# EduTrack ML Service

FastAPI microservice that generates multiple-choice quizzes from lesson text, using
either a local fine-tuned checkpoint or a configured Hugging Face sequence-to-sequence
model ID.
Called by the Node backend's AI-Powered Quiz Generation module over HTTP — see
`../UPDATES.md` for the full contract. This is the default/active ML service - `backend/.env`
points `ML_SERVICE_URL` here (`:8000`) unless you switch to `../ML-local/`.

## How generation works

A single prompt asking the model to emit a full MCQ (`Q: ... | A) ... B) ... C) ... D) ... |
ANSWER: X`) in one shot turned out unreliable — the model would ignore the format or fall
back to fill-in-the-blank phrasing. Generation is a **two-stage pipeline** instead
(`app/services/quiz_generator.py`):

1. Ask the model to write a genuine comprehension question about a passage.
2. Ask the model to answer that question extractively, from the same passage.
3. Build 3 distractors from the lesson's own vocabulary (words with a similar length to the
   correct answer), since the model isn't asked to invent plausible wrong answers.

Passage text is first filtered to drop PDF junk (table-of-contents dot-leaders, section-number
headings like "3.8.1", all-caps title pages) so questions come from actual lesson content, not
front-matter.

## Setup & run

### One-command way (Windows)

```powershell
cd ML
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

Creates `.venv` if missing, copies `.env.example` → `.env` if missing, installs
`requirements.txt`, and starts the server on the host/port from `.env`. Re-run it any time —
it's idempotent (skips venv/`.env` creation if they already exist, just reinstalls deps and
starts). If `BASE_MODEL_NAME` points at a Hugging Face repo ID, the service will use that
model when no local fine-tuned checkpoint is present.

### Manual way

```bash
cd ML
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
copy .env.example .env
python -m app.main
# or: uvicorn app.main:app --reload --port 8000
```

(`requirements.txt` also includes `datasets`/`accelerate`, which are only needed for
fine-tuning — see below — not for serving.)

Generation itself takes a few seconds per question on CPU (two model calls each) — fine
since it runs in the background right after a lesson is uploaded, not while a user waits.

### Running from the IDE

Don't use the editor's "Run Python File" button on `app/main.py` directly — it executes the
file standalone, which breaks the `from app.config import config` absolute imports (Python
only puts `ML/app/` on the path, not `ML/`, so there's no `app` package to find). Use
`run.ps1`/the manual commands above from a terminal, or the "ML: Run server" launch config
in `../.vscode/launch.json` (Run & Debug panel, F5) which runs it correctly as `python -m
app.main` with the working directory set to `ML/`.

## Endpoints

- `GET /health` — model load status, active model source, device (cpu/cuda)
- `POST /generate-quiz` (no auth - localhost-only) — body
  `{ "lessonText": "...", "numQuestions": 5 }`, returns
  `{ "questions": [{ "questionText", "options": [4 strings], "correctAnswerIndex" }] }`

## Fine-tuning your model

See [app/training/README.md](app/training/README.md) — the serving code
(`app/services/model_loader.py`) picks up a fine-tuned local checkpoint automatically once
it exists, otherwise it falls back to the configured `BASE_MODEL_NAME` value. If you fine-tune
toward the single-shot delimited-MCQ format described in that training README, you'd also want
to switch `generate_quiz()` in `app/services/quiz_generator.py` back to a one-call approach to
take advantage of it — the two-stage pipeline here is a workaround for the _un_-fine-tuned
model specifically.
