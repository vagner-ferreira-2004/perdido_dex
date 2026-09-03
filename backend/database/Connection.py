import logging

from sqlalchemy import text

from database.database import DATABASE_URL, engine
from sqlalchemy.orm import sessionmaker


logger = logging.getLogger(__name__)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def checkDbConnection() -> None:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        logger.exception("Database connection failed.")
        raise

    logger.info("Database connection established.")
