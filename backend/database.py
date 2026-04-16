import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "auravos")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

users_collection = db.get_collection("users")
telemetry_collection = db.get_collection("telemetry")
contestants_collection = db.get_collection("contestants")
