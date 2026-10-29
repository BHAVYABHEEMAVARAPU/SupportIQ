
import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "supportiq")

client = None
db = None

if MONGO_URI:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
    )
    db = client[DATABASE_NAME]


def get_tickets_collection():
    if db is None:
        raise RuntimeError(
            "MONGO_URI is missing. Check backend/.env"
        )

    return db["tickets"]
