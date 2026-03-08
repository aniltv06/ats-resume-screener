import sys
import os

# Make the backend root importable so routers/services can be resolved
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app  # noqa: E402 — must come after sys.path patch
