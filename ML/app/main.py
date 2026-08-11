from fastapi import FastAPI, HTTPException

from app.config import config
from app.schemas import HealthResponse, QuizRequest, QuizResponse
from app.services.model_loader import get_model, is_model_loaded
from app.services.quiz_generator import generate_quiz

app = FastAPI(title="EduTrack ML Service", version="1.0.0")


@app.on_event("startup")
def warm_model():
    # Print which model source we're attempting to load (helpful for debugging)
    print(f"[startup] active_model_source={config.active_model_source}")
    try:
        get_model()
    except (FileNotFoundError, ImportError, RuntimeError) as exc:
        print(f"[startup] skipping warm-up: {exc}")


@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        modelSource=config.active_model_source,
        device=config.device,
        modelLoaded=is_model_loaded(),
    )


@app.post("/generate-quiz", response_model=QuizResponse)
def generate_quiz_endpoint(request: QuizRequest):
    try:
        questions = generate_quiz(request.lessonText, request.numQuestions)
    except Exception as exc:
        # Most common cause: the local model failed to load (missing checkpoint,
        # out of memory, or bad files). Surface a clear error instead of a bare 500.
        raise HTTPException(
            status_code=503,
            detail=(
                f"ML model failed to load or generate ({exc.__class__.__name__}: {exc}). "
                "If this persists, ensure checkpoints/quiz-generator/ contains a local "
                "fine-tuned model or set BASE_MODEL_NAME to a valid local checkpoint path "
                "or Hugging Face model ID."
            ),
        ) from exc

    if not questions:
        raise HTTPException(
            status_code=422,
            detail="Model could not produce well-formed questions from this lesson text",
        )

    return QuizResponse(questions=questions)


if __name__ == "__main__":
    # Lets `python -m app.main` start the server with HOST/PORT read from .env via
    # config.py, instead of hardcoding them into a CLI flag.
    import uvicorn

    uvicorn.run("app.main:app", host=config.host, port=config.port, reload=True)
