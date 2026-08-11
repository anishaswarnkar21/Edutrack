"""Lazy singleton loader for the quiz-generation seq2seq model.

Loads a local fine-tuned checkpoint from `config.fine_tuned_model_dir` when one
has been trained (see app/training/train.py). If no local checkpoint exists,
the loader falls back to the configured base model source.
"""
from pathlib import Path
from functools import lru_cache

try:
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
except ImportError:  # pragma: no cover - exercised in lightweight test environments
    AutoModelForSeq2SeqLM = None
    AutoTokenizer = None

from app.config import config

# Module-level flag indicating whether the model was successfully loaded.
_model_loaded = False


def _resolve_model_source(model_source: str) -> str:
    source_path = Path(model_source)
    if source_path.exists():
        return model_source

    if model_source:
        return model_source

    raise FileNotFoundError(
        "No model source is configured. Set BASE_MODEL_NAME to a local checkpoint "
        "path or Hugging Face repo ID, or train a model into checkpoints/quiz-generator/."
    )


class QuizModel:
    def __init__(self, model_source: str, device: str):
        if AutoModelForSeq2SeqLM is None or AutoTokenizer is None:
            raise ImportError(
                "transformers is required to load the quiz-generation model. "
                "Install the ML service dependencies from requirements.txt."
            )

        self.model_source = model_source
        self.device = device
        resolved_model_source = _resolve_model_source(model_source)
        print(f"[model_loader] resolved model source: {resolved_model_source}")
        self.tokenizer = AutoTokenizer.from_pretrained(resolved_model_source)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(resolved_model_source).to(device)
        self.model.eval()
        # Mark module-level loaded flag after successful construction
        global _model_loaded
        _model_loaded = True

    def generate(self, prompt: str, max_new_tokens: int) -> str:
        import torch

        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=config.max_input_tokens,
        ).to(self.device)

        with torch.no_grad():
            output_ids = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                num_beams=4,
                do_sample=False,
                early_stopping=True,
            )

        return self.tokenizer.decode(output_ids[0], skip_special_tokens=True)


@lru_cache(maxsize=1)
def get_model() -> QuizModel:
    return QuizModel(config.active_model_source, config.device)


def is_model_loaded() -> bool:
    """Return True if the model was successfully loaded into memory."""
    return _model_loaded
