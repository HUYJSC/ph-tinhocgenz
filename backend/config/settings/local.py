from .base import *

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Database
# Local SQLite for immediate zero-config tests, switchable to PostgreSQL via env
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
]
