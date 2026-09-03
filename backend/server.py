import logging
import os
import sys

from dotenv import load_dotenv


load_dotenv()

from App import createApp
from database.Connection import checkDbConnection


logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


def main() -> None:
    try:
        checkDbConnection()
    except Exception as error:
        logging.error("Database connection failed: %s", error)
        sys.exit(1)

    app = createApp()
    logging.info("Server started.")
    app.run(
        host=os.environ["SERVER_HOST"],
        port=int(os.environ["SERVER_PORT"]),
    )


if __name__ == "__main__":
    main()
