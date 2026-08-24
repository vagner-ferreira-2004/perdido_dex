import subprocess
import sys
from pathlib import Path

from database.database import recreateDatabase

PROJECT_ROOT = Path(__file__).resolve().parent
BACKEND_DIR = PROJECT_ROOT


def resetDatabase() -> None:
    recreateDatabase()
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], cwd=BACKEND_DIR, check=True)
    subprocess.run([sys.executable, "-m", "database.seeds.seed"], cwd=BACKEND_DIR, check=True)


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "db:reset":
        resetDatabase()
    else:
        print("Usage: py manage.py db:reset")
        raise SystemExit(1)
