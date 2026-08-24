from pathlib import Path
import os
import re

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker


ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_FILE)

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

if not all((DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)):
    raise RuntimeError(
        "DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASSWORD must be configured in backend/.env"
    )

DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=int(DB_PORT),
    database=DB_NAME,
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def recreateDatabase() -> None:
    if re.fullmatch(r"[A-Za-z0-9_$]+", DB_NAME) is None:
        raise ValueError("DB_NAME contains invalid characters")

    server_url = URL.create(
        drivername="mysql+pymysql",
        username=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=int(DB_PORT),
    )
    server_engine = create_engine(server_url, pool_pre_ping=True)
    quoted_name = f"`{DB_NAME}`"
    with server_engine.begin() as connection:
        connection.execute(text(f"DROP DATABASE IF EXISTS {quoted_name}"))
        connection.execute(text(f"CREATE DATABASE {quoted_name}"))
    server_engine.dispose()


class Base(DeclarativeBase):
    pass
