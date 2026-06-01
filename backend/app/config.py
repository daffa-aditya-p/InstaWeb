import os
from datetime import timedelta
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "instaweb-local-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "instaweb-jwt-local-development-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'instance' / 'instaweb.sqlite'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

    # Midtrans Sandbox
    MIDTRANS_SERVER_KEY = os.getenv("MIDTRANS_SERVER_KEY", "")
    MIDTRANS_CLIENT_KEY = os.getenv("MIDTRANS_CLIENT_KEY", "Mid-client-F_unA-FZad4yCO6Z")
    MIDTRANS_MERCHANT_ID = os.getenv("MIDTRANS_MERCHANT_ID", "G751254483")
    MIDTRANS_IS_PRODUCTION = False
    MIDTRANS_SNAP_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions"
    MIDTRANS_API_URL = "https://api.sandbox.midtrans.com/v2"
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB upload limit
