import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

ML_ROOT = Path(__file__).resolve().parent.parent


def _resolve_device(value: str) -> str:
    if value != "auto":
        return value
    try:
        import torch

        return "cuda" if torch.cuda.is_available() else "cpu"
    except ImportError:
        return "cpu"


class Config:
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))

    # Optional base model source used for serving and fine-tuning.
    # Accepts either a local checkpoint path or a Hugging Face repo ID.
    base_model_name: str = os.getenv("BASE_MODEL_NAME", "")
    fine_tuned_model_dir: Path = ML_ROOT / os.getenv(
        "FINE_TUNED_MODEL_DIR", "checkpoints/quiz-generator"
    )

    device: str = _resolve_device(os.getenv("DEVICE", "auto"))

    max_input_tokens: int = int(os.getenv("MAX_INPUT_TOKENS", "480"))
    max_new_tokens: int = int(os.getenv("MAX_NEW_TOKENS", "512"))
    # Default number of questions to generate when not specified by request
    default_num_questions: int = int(os.getenv("DEFAULT_NUM_QUESTIONS", "16"))

    @property
    def active_model_source(self) -> str:
        """Path to a local checkpoint or a configured Hugging Face model ID."""
        has_safetensors = self.fine_tuned_model_dir.exists() and any(
            self.fine_tuned_model_dir.glob("*.safetensors")
        )
        has_bin = (self.fine_tuned_model_dir / "pytorch_model.bin").exists()
        if has_safetensors or has_bin:
            return str(self.fine_tuned_model_dir)
        if self.base_model_name:
            return self.base_model_name
        return ""


config = Config()
