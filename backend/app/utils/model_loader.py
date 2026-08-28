import os
from huggingface_hub import hf_hub_download


BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

ML_DIR = os.path.join(BASE_DIR, "ml")

HF_MODEL_REPO = os.getenv(
    "HF_MODEL_REPO",
    "DeekshithaGilla23/trafficvision-ai-model"
)

HF_TOKEN = os.getenv("HF_TOKEN")


MODEL_FILES = [
    "traffic_model.pkl",
    "holiday_encoder.pkl",
    "weather_encoder.pkl",
    "weather_description_encoder.pkl",
]


def ensure_model_files():
    """
    Local development:
        Uses existing backend/ml/*.pkl files.

    Production:
        If files are missing, downloads them from the private
        Hugging Face model repository.
    """

    os.makedirs(ML_DIR, exist_ok=True)

    resolved_paths = {}

    for filename in MODEL_FILES:

        local_path = os.path.join(ML_DIR, filename)

        # Local development path
        if os.path.exists(local_path):
            resolved_paths[filename] = local_path
            continue

        # Production download
        print(f"Downloading {filename} from Hugging Face (Repo: {HF_MODEL_REPO})...")
        try:
            downloaded_path = hf_hub_download(
                repo_id=HF_MODEL_REPO,
                filename=filename,
                token=HF_TOKEN if HF_TOKEN else None,
            )
        except Exception as e:
            if not HF_TOKEN:
                raise RuntimeError(
                    f"Failed to download {filename} from public repository. "
                    f"If the repository is private, please configure HF_TOKEN. Error: {e}"
                ) from e
            raise RuntimeError(
                f"Failed to download {filename} from Hugging Face repository. Error: {e}"
            ) from e

        resolved_paths[filename] = downloaded_path

    return resolved_paths