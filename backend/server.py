from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from google_calendar import create_google_calendar_event


import certifi

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'paper_hoof')

client_kwargs = {"serverSelectionTimeoutMS": 5000}
if "mongodb+srv" in mongo_url or "tls=true" in mongo_url.lower() or "ssl=true" in mongo_url.lower():
    try:
        client_kwargs["tlsCAFile"] = certifi.where()
    except Exception:
        pass

client = AsyncIOMotorClient(mongo_url, **client_kwargs)
db = client[db_name]



# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


class BookingCreate(BaseModel):
    service: Optional[str] = ""
    budget: Optional[str] = ""
    hearAbout: Optional[str] = ""
    referrer: Optional[str] = ""
    firstName: str
    lastName: str
    email: str
    phone: Optional[str] = ""
    company: Optional[str] = ""
    instagram: Optional[str] = ""
    dateStr: str  # YYYY-MM-DD
    timeSlot: str  # "7:00 PM - 9:00 PM" or "9:00 PM - 11:00 PM"
    notes: Optional[str] = ""


class BookingResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service: Optional[str] = ""
    budget: Optional[str] = ""
    hearAbout: Optional[str] = ""
    referrer: Optional[str] = ""
    firstName: str
    lastName: str
    email: str
    phone: Optional[str] = ""
    company: Optional[str] = ""
    instagram: Optional[str] = ""
    dateStr: str
    timeSlot: str
    notes: Optional[str] = ""
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    gcalResult: Optional[dict] = None


# Add routes to the router
@api_router.get("/")
async def root():
    return {"message": "Paper Hoof API Service"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# Booking Endpoints
@api_router.get("/bookings/booked-slots")
async def get_booked_slots(date: str = Query(..., description="Date string YYYY-MM-DD")):
    """Returns list of already booked time slots for the specified date."""
    try:
        bookings = await db.bookings.find({"dateStr": date}, {"_id": 0, "timeSlot": 1}).to_list(100)
        booked_slots = [b["timeSlot"] for b in bookings if "timeSlot" in b and b["timeSlot"]]
    except Exception as e:
        logger.warning(f"Database query failed: {e}. Returning empty booked slots list.")
        booked_slots = []
    return {"date": date, "bookedSlots": booked_slots}


@api_router.post("/bookings", response_model=BookingResponse)
async def create_booking(input: BookingCreate):
    """Creates a new session booking and syncs with Google Calendar."""
    try:
        existing = await db.bookings.find_one({
            "dateStr": input.dateStr,
            "timeSlot": input.timeSlot
        })
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"The time slot '{input.timeSlot}' on {input.dateStr} is already booked. Please select another slot."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Database lookup error: {e}")

    booking_obj = BookingResponse(**input.model_dump())
    doc = booking_obj.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()

    # Sync to Google Calendar
    gcal_result = create_google_calendar_event(doc)
    doc['gcalResult'] = gcal_result

    try:
        await db.bookings.insert_one(doc)
    except Exception as e:
        logger.warning(f"Database insertion failed: {e}")

    return booking_obj



# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()