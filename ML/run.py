"""Run helper for the ML FastAPI service.

Usage:
    python run.py            # use defaults from app.config
    python run.py --host 0.0.0.0 --port 8000 --no-warm

The script will attempt to warm and load the local model before starting the
server. Use `--abort-on-fail` to stop startup if warming fails.
"""
import argparse
import sys
import time

from app.config import config
from app.services.model_loader import get_model, is_model_loaded


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default=config.host)
    parser.add_argument("--port", type=int, default=config.port)
    parser.add_argument("--no-warm", action="store_true", help="Don't warm/load the model before start")
    parser.add_argument("--abort-on-fail", action="store_true", help="Abort startup if model warm fails")
    parser.add_argument("--reload", action="store_true", help="Enable uvicorn reload (dev)")

    args = parser.parse_args()

    print(f"[run] starting ML service on {args.host}:{args.port}")
    print(f"[run] active_model_source={config.active_model_source}")

    if not args.no_warm:
        print("[run] warming model from local files...")
        try:
            # get_model uses lru_cache and will construct QuizModel if needed
            get_model()
        except Exception as exc:
            print(f"[run] model warm failed: {exc}")
            if args.abort_on_fail:
                print("[run] aborting due to --abort-on-fail")
                sys.exit(1)
            else:
                print("[run] continuing startup without loaded model")

    if is_model_loaded():
        print("[run] model successfully loaded and ready")
    else:
        print("[run] model not loaded at startup")

    # Defer to uvicorn to run the ASGI app. Import here to avoid adding uvicorn
    # as a hard requirement when merely importing this module.
    import uvicorn

    uvicorn.run("app.main:app", host=args.host, port=args.port, reload=args.reload)


if __name__ == "__main__":
    main()
