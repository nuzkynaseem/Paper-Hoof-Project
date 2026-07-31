from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends, UploadFile, File, Form, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt
import hashlib
import boto3
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
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

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Security & JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'paper_hoof_super_secret_key_2026')
JWT_ALGORITHM = 'HS256'
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@paperhoof.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'paperhoof123')

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def verify_token(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Missing or invalid token header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized: Token expired or invalid")

# App Setup
app = FastAPI(title="Paper Hoof CMS Backend API")
api_router = APIRouter(prefix="/api")

# --- PYDANTIC MODELS ---

class AuthLogin(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user: dict

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
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
    timeSlot: str
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
    status: Optional[str] = "pending"
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    gcalResult: Optional[dict] = None

class WorkScopePill(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    color: str  # Secondary palette hex e.g., #97D9AF, #1E293B, #EAB308, #F472B6

class ProjectComponentInsight(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""

class ProjectComponent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str = "image"  # "image" | "video" | "html" | "quote" | "grid"
    contentUrl: Optional[str] = ""
    quoteText: Optional[str] = ""
    author: Optional[str] = ""
    gridUrls: Optional[List[str]] = []
    insight: Optional[ProjectComponentInsight] = None

class ProjectModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: Optional[str] = ""
    name: str
    category: Optional[str] = ""
    tags: List[str] = []
    coverImage: str
    sliderImage: Optional[str] = ""
    title: Optional[str] = ""
    heroMedia: Optional[str] = ""
    heroMediaType: Optional[str] = "image"
    subtitle: Optional[str] = ""
    description: Optional[str] = ""
    readMoreText: Optional[str] = ""
    components: List[ProjectComponent] = []
    isFeatured: bool = False
    client: Optional[str] = ""
    year: Optional[str] = "2026"
    order: Optional[int] = 0

class HomepageContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    heroVideoUrl: Optional[str] = "https://assets.mixkit.co/videos/preview/mixkit-white-sand-under-water-4330-large.mp4"
    secondSectionTitle: Optional[str] = "We craft enduring brand identities and digital experiences for ambitious teams."
    secondSectionDescription: Optional[str] = "Paper Hoof is an independent brand design studio operating at the intersection of clarity, tactile beauty, and strategy."
    homepageProjectsLimit: Optional[int] = 4

class BrandReviewCard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cardIndex: int  # 1 to 6
    title: str
    minutes: int
    imageUrl: str

class SocialsSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: str = "hello@paperhoof.com"
    instagramUrl: str = "https://instagram.com/paperhoof"
    linkedinUrl: str = "https://linkedin.com/company/paperhoof"

# --- AUTH ROUTES ---
@api_router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: AuthLogin):
    email = credentials.email.lower().strip()
    password = credentials.password
    
    # Check against MongoDB users collection or default admin
    user = await db.users.find_one({"email": email})
    if not user:
        if email == ADMIN_EMAIL.lower() and password == ADMIN_PASSWORD:
            token = create_access_token({"sub": email, "role": "admin"})
            return {"token": token, "user": {"email": email, "name": "Paper Hoof Team", "role": "admin"}}
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if hash_password(password) != user.get("passwordHash"):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = create_access_token({"sub": email, "role": user.get("role", "admin")})
    return {"token": token, "user": {"email": email, "name": user.get("name", "Paper Hoof Team"), "role": user.get("role", "admin")}}

@api_router.get("/auth/me")
async def get_me(user_data: dict = Depends(verify_token)):
    return {"user": {"email": user_data.get("sub"), "role": user_data.get("role")}}

# --- CLOUDFLARE R2 / S3 FILE UPLOAD ---
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), user_data: dict = Depends(verify_token)):
    """Uploads media file to Cloudflare R2 / S3 bucket or fallback URL."""
    r2_account_id = os.environ.get("R2_ACCOUNT_ID")
    r2_access_key = os.environ.get("R2_ACCESS_KEY_ID")
    r2_secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
    r2_bucket = os.environ.get("R2_BUCKET_NAME", "paperhoof-media")
    r2_public_domain = os.environ.get("R2_PUBLIC_DOMAIN")

    ext = Path(file.filename).suffix
    file_key = f"uploads/{uuid.uuid4()}{ext}"
    content = await file.read()

    if r2_account_id and r2_access_key and r2_secret_key:
        try:
            s3_client = boto3.client(
                "s3",
                endpoint_url=f"https://{r2_account_id}.r2.cloudflarestorage.com",
                aws_access_key_id=r2_access_key,
                aws_secret_access_key=r2_secret_key,
                region_name="auto"
            )
            s3_client.put_object(
                Bucket=r2_bucket,
                Key=file_key,
                Body=content,
                ContentType=file.content_type
            )
            public_url = f"{r2_public_domain}/{file_key}" if r2_public_domain else f"https://{r2_bucket}.r2.cloudflarestorage.com/{file_key}"
            return {"url": public_url, "filename": file.filename, "key": file_key}
        except Exception as e:
            logger.error(f"Cloudflare R2 Upload failed: {e}")

    # Fallback storage: save locally in frontend public uploads directory if available or return base64
    import base64
    b64_str = base64.b64encode(content).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{b64_str}"
    return {"url": data_url, "filename": file.filename}

# --- ANALYTICS & DASHBOARD STATS ---
@api_router.post("/analytics/visit")
async def record_visit():
    await db.analytics.update_one(
        {"_id": "site_stats"},
        {"$inc": {"visitCount": 1}},
        upsert=True
    )
    return {"status": "ok"}

@api_router.get("/analytics/stats")
async def get_dashboard_stats():
    stats = await db.analytics.find_one({"_id": "site_stats"})
    visit_count = stats.get("visitCount", 420) if stats else 420
    
    total_projects = await db.projects.count_documents({})
    featured_project = await db.projects.find_one({"isFeatured": True}, {"_id": 0})
    if not featured_project and total_projects > 0:
        featured_project = await db.projects.find_one({}, {"_id": 0})
        
    return {
        "visitCount": visit_count,
        "totalProjects": total_projects if total_projects > 0 else 6,
        "featuredProject": featured_project
    }

# --- HOMEPAGE CONTENT ---
@api_router.get("/site/homepage", response_model=HomepageContent)
async def get_homepage_content():
    content = await db.site_content.find_one({"_id": "homepage"}, {"_id": 0})
    if not content:
        return HomepageContent()
    return HomepageContent(**content)

@api_router.put("/site/homepage", response_model=HomepageContent)
async def update_homepage_content(data: HomepageContent, user_data: dict = Depends(verify_token)):
    doc = data.model_dump()
    await db.site_content.update_one(
        {"_id": "homepage"},
        {"$set": doc},
        upsert=True
    )
    return data

# --- WORK SCOPE PILLS ---
@api_router.get("/work-scopes", response_model=List[WorkScopePill])
async def get_work_scopes():
    scopes = await db.work_scopes.find({}, {"_id": 0}).to_list(100)
    if not scopes:
        default_scopes = [
            {"id": "1", "name": "BRANDING", "color": "#97D9AF"},
            {"id": "2", "name": "IDENTITY", "color": "#123524"},
            {"id": "3", "name": "DIGITAL PRESENCE", "color": "#1E293B"},
            {"id": "4", "name": "UI/UX", "color": "#EAB308"},
            {"id": "5", "name": "SYSTEM", "color": "#F472B6"}
        ]
        return [WorkScopePill(**s) for s in default_scopes]
    return [WorkScopePill(**s) for s in scopes]

@api_router.post("/work-scopes", response_model=WorkScopePill)
async def create_work_scope(data: WorkScopePill, user_data: dict = Depends(verify_token)):
    doc = data.model_dump()
    await db.work_scopes.insert_one(doc)
    return data

@api_router.delete("/work-scopes/{scope_id}")
async def delete_work_scope(scope_id: str, user_data: dict = Depends(verify_token)):
    await db.work_scopes.delete_one({"id": scope_id})
    return {"status": "deleted"}

# --- PROJECTS ---
@api_router.get("/projects", response_model=List[ProjectModel])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return [ProjectModel(**p) for p in projects]

@api_router.get("/projects/{project_id_or_slug}", response_model=ProjectModel)
async def get_project_by_id(project_id_or_slug: str):
    project = await db.projects.find_one(
        {"$or": [{"id": project_id_or_slug}, {"slug": project_id_or_slug}]},
        {"_id": 0}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectModel(**project)

@api_router.post("/projects", response_model=ProjectModel)
async def create_project(data: ProjectModel, user_data: dict = Depends(verify_token)):
    doc = data.model_dump()
    if not doc.get("slug"):
        doc["slug"] = doc["name"].lower().replace(" ", "-")
    await db.projects.insert_one(doc)
    return data

@api_router.put("/projects/{project_id}", response_model=ProjectModel)
async def update_project(project_id: str, data: ProjectModel, user_data: dict = Depends(verify_token)):
    doc = data.model_dump()
    await db.projects.update_one({"id": project_id}, {"$set": doc})
    return data

@api_router.put("/projects/featured/{project_id}")
async def set_featured_project(project_id: str, user_data: dict = Depends(verify_token)):
    # Unset all featured flags
    await db.projects.update_many({}, {"$set": {"isFeatured": False}})
    # Set chosen project as featured
    res = await db.projects.update_one({"id": project_id}, {"$set": {"isFeatured": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "success", "featuredProjectId": project_id}

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user_data: dict = Depends(verify_token)):
    await db.projects.delete_one({"id": project_id})
    return {"status": "deleted"}

# --- BRAND REVIEW CARDS (Fixed 6 cards) ---
@api_router.get("/brand-review-cards", response_model=List[BrandReviewCard])
async def get_brand_review_cards():
    cards = await db.brand_review_cards.find({}, {"_id": 0}).sort("cardIndex", 1).to_list(10)
    if not cards:
        default_cards = [
            {"cardIndex": 1, "title": "Brand Audit & Strategy", "minutes": 45, "imageUrl": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop"},
            {"cardIndex": 2, "title": "Visual Identity Review", "minutes": 30, "imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop"},
            {"cardIndex": 3, "title": "Digital Experience Review", "minutes": 60, "imageUrl": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"},
            {"cardIndex": 4, "title": "Packaging & Collateral Audit", "minutes": 45, "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop"},
            {"cardIndex": 5, "title": "Typography & Grid Check", "minutes": 30, "imageUrl": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"},
            {"cardIndex": 6, "title": "Growth & Rebranding Roadmap", "minutes": 60, "imageUrl": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=600&fit=crop"}
        ]
        return [BrandReviewCard(**c) for c in default_cards]
    return [BrandReviewCard(**c) for c in cards]

@api_router.put("/brand-review-cards/{card_index}", response_model=BrandReviewCard)
async def update_brand_review_card(card_index: int, data: BrandReviewCard, user_data: dict = Depends(verify_token)):
    if card_index < 1 or card_index > 6:
        raise HTTPException(status_code=400, detail="Card index must be between 1 and 6")
    doc = data.model_dump()
    doc["cardIndex"] = card_index
    await db.brand_review_cards.update_one(
        {"cardIndex": card_index},
        {"$set": doc},
        upsert=True
    )
    return data

# --- SOCIALS & CONTACT SETTINGS ---
@api_router.get("/site/socials", response_model=SocialsSettings)
async def get_socials():
    socials = await db.site_content.find_one({"_id": "socials"}, {"_id": 0})
    if not socials:
        return SocialsSettings()
    return SocialsSettings(**socials)

@api_router.put("/site/socials", response_model=SocialsSettings)
async def update_socials(data: SocialsSettings, user_data: dict = Depends(verify_token)):
    doc = data.model_dump()
    await db.site_content.update_one(
        {"_id": "socials"},
        {"$set": doc},
        upsert=True
    )
    return data

# --- SESSION BOOKINGS & STATUS MANAGEMENT ---
@api_router.get("/bookings", response_model=List[BookingResponse])
async def get_all_bookings(user_data: dict = Depends(verify_token)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    for check in bookings:
        if isinstance(check.get('createdAt'), str):
            try:
                check['createdAt'] = datetime.fromisoformat(check['createdAt'])
            except Exception:
                pass
    return [BookingResponse(**b) for b in bookings]

@api_router.patch("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, status: str = Query(...), user_data: dict = Depends(verify_token)):
    res = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"status": "updated", "id": booking_id, "newStatus": status}

# --- MIGRATION ROUTE: Run once to fix existing data ---
@api_router.post("/migrate")
async def migrate_database(token: str = Depends(verify_token)):
    """Adds missing projects & updates existing homepage doc with new fields."""
    results = []

    # Add missing projects (Woodland Publishing, Burrowed, DHCH) if not present
    missing_projects = [
        {
            "id": "4", "slug": "woodland-publishing", "name": "Woodland Publishing",
            "category": "Publishing", "tags": ["BRANDING", "IDENTITY"],
            "coverImage": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=900&fit=crop",
            "sliderImage": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=900&fit=crop",
            "title": "Woodland Publishing — Editorial Identity",
            "heroMedia": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&h=900&fit=crop",
            "heroMediaType": "image",
            "subtitle": "An editorial identity and book-design language for an independent publisher.",
            "description": "Woodland Publishing required a visual system that could span across print and digital formats with equal grace.",
            "readMoreText": "We developed a typographic system grounded in classical proportions, updated with a contemporary warmth that speaks to modern readers.",
            "components": [], "isFeatured": False, "client": "Woodland Publishing House", "year": "2024", "order": 4
        },
        {
            "id": "5", "slug": "burrowed", "name": "Burrowed",
            "category": "Magazine", "tags": ["BRANDING", "IDENTITY", "DIGITAL PRESENCE"],
            "coverImage": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&h=750&fit=crop",
            "sliderImage": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&h=750&fit=crop",
            "title": "Burrowed Literary Magazine",
            "heroMedia": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&h=900&fit=crop",
            "heroMediaType": "image",
            "subtitle": "Art direction and digital experience for an independent literary magazine.",
            "description": "Burrowed is a magazine that celebrates the art of slow reading in a fast world.",
            "readMoreText": "A fully redesigned digital edition with custom illustration-forward layout system and an intimate reading experience.",
            "components": [], "isFeatured": False, "client": "Burrowed Publications", "year": "2025", "order": 5
        },
        {
            "id": "6", "slug": "dhch", "name": "DHCH",
            "category": "Institution", "tags": ["BRANDING", "SYSTEM"],
            "coverImage": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=750&fit=crop",
            "sliderImage": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=750&fit=crop",
            "title": "DHCH — Cultural Institution Identity",
            "heroMedia": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&h=900&fit=crop",
            "heroMediaType": "image",
            "subtitle": "A considered identity system for a cultural heritage institution.",
            "description": "DHCH needed a visual system that honours tradition while remaining inviting to new audiences.",
            "readMoreText": "The resulting identity is rooted in archival research, translated into a modular system that works across signage, print and digital.",
            "components": [], "isFeatured": False, "client": "DHCH Foundation", "year": "2023", "order": 6
        }
    ]

    added = 0
    for proj in missing_projects:
        exists = await db.projects.find_one({"slug": proj["slug"]})
        if not exists:
            await db.projects.insert_one(proj)
            added += 1
    results.append(f"Added {added} missing projects")

    # Update homepage doc to include homepageProjectsLimit if missing
    hp_doc = await db.site_content.find_one({"_id": "homepage"})
    if hp_doc and "homepageProjectsLimit" not in hp_doc:
        await db.site_content.update_one(
            {"_id": "homepage"},
            {"$set": {"homepageProjectsLimit": 4}}
        )
        results.append("Added homepageProjectsLimit to homepage config")
    else:
        results.append("Homepage config already up to date")

    return {"status": "success", "results": results}

# --- SEED INITIAL DATA ROUTE ---
@api_router.post("/seed")

async def seed_database():
    """Seeds the database with initial Paper Hoof content if collections are empty."""
    # Seed Work Scopes
    if await db.work_scopes.count_documents({}) == 0:
        scopes = [
            {"id": "1", "name": "BRANDING", "color": "#97D9AF"},
            {"id": "2", "name": "IDENTITY", "color": "#123524"},
            {"id": "3", "name": "DIGITAL PRESENCE", "color": "#1E293B"},
            {"id": "4", "name": "UI/UX", "color": "#EAB308"},
            {"id": "5", "name": "SYSTEM", "color": "#F472B6"}
        ]
        await db.work_scopes.insert_many(scopes)

    # Seed Projects
    if await db.projects.count_documents({}) == 0:
        projects = [
            {
                "id": "1",
                "slug": "burger-hot",
                "name": "Burger Hot",
                "category": "Food Chain",
                "tags": ["BRANDING", "IDENTITY", "UI/UX"],
                "coverImage": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=900&fit=crop",
                "sliderImage": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=900&fit=crop",
                "title": "Burger Hot — Identity & Ordering System",
                "heroMedia": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&h=900&fit=crop",
                "heroMediaType": "image",
                "subtitle": "A bold rebrand for a fast-casual chain — an appetite-forward identity spanning packaging and digital ordering.",
                "description": "Burger Hot required a distinct visual language built for rapid expansion across urban centers.",
                "readMoreText": "We crafted a high-impact color system paired with custom typography and tactile packaging solutions. The digital ordering experience reduced checkout time by 34%.",
                "components": [
                    {
                        "id": "c1",
                        "type": "image",
                        "contentUrl": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=900&fit=crop",
                        "insight": {"title": "Tactile Packaging", "description": "Eco-conscious kraft paper boxes with vibrant food-grade ink print."}
                    },
                    {
                        "id": "c2",
                        "type": "image",
                        "contentUrl": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200&h=900&fit=crop",
                        "insight": {"title": "Menu Kiosk UI", "description": "Intuitive touchscreen interface optimized for high foot-traffic locations."}
                    }
                ],
                "isFeatured": True,
                "client": "Burger Hot Global",
                "year": "2025",
                "order": 1
            },
            {
                "id": "2",
                "slug": "odera",
                "name": "Odera",
                "category": "Supermarket",
                "tags": ["BRANDING", "IDENTITY"],
                "coverImage": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1000&h=1000&fit=crop",
                "sliderImage": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1000&h=1000&fit=crop",
                "title": "Odera Supermarkets",
                "heroMedia": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1600&h=900&fit=crop",
                "heroMediaType": "image",
                "subtitle": "A retail identity system built for clarity across thousands of everyday touchpoints.",
                "description": "Odera is an essential everyday supermarket brand designed for modern neighborhood communities.",
                "readMoreText": "From wayfinding signage to private label packaging, the new Odera system elevates the everyday grocery shopping experience.",
                "components": [],
                "isFeatured": False,
                "client": "Odera Retail",
                "year": "2024",
                "order": 2
            },
            {
                "id": "3",
                "slug": "yaloo",
                "name": "Yaloo",
                "category": "Tourism",
                "tags": ["BRANDING", "DIGITAL PRESENCE"],
                "coverImage": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&h=1000&fit=crop",
                "sliderImage": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&h=1000&fit=crop",
                "title": "Yaloo Travel & Exploration",
                "heroMedia": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=900&fit=crop",
                "heroMediaType": "image",
                "subtitle": "Destination branding and digital presence for an emerging travel brand.",
                "description": "Connecting curious travelers with authentic regional experiences.",
                "readMoreText": "Yaloo's digital platform inspires wanderlust through editorial storytelling and immersive photography.",
                "components": [],
                "isFeatured": False,
                "client": "Yaloo Travel",
                "year": "2025",
                "order": 3
            },
            {
                "id": "4",
                "slug": "woodland-publishing",
                "name": "Woodland Publishing",
                "category": "Publishing",
                "tags": ["BRANDING", "IDENTITY"],
                "coverImage": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=900&fit=crop",
                "sliderImage": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=900&fit=crop",
                "title": "Woodland Publishing — Editorial Identity",
                "heroMedia": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&h=900&fit=crop",
                "heroMediaType": "image",
                "subtitle": "An editorial identity and book-design language for an independent publisher.",
                "description": "Woodland Publishing required a visual system that could span across print and digital formats with equal grace.",
                "readMoreText": "We developed a typographic system grounded in classical proportions, updated with a contemporary warmth that speaks to modern readers.",
                "components": [],
                "isFeatured": False,
                "client": "Woodland Publishing House",
                "year": "2024",
                "order": 4
            },
            {
                "id": "5",
                "slug": "burrowed",
                "name": "Burrowed",
                "category": "Magazine",
                "tags": ["BRANDING", "IDENTITY", "DIGITAL PRESENCE"],
                "coverImage": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&h=750&fit=crop",
                "sliderImage": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&h=750&fit=crop",
                "title": "Burrowed Literary Magazine",
                "heroMedia": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&h=900&fit=crop",
                "heroMediaType": "image",
                "subtitle": "Art direction and digital experience for an independent literary magazine.",
                "description": "Burrowed is a magazine that celebrates the art of slow reading in a fast world.",
                "readMoreText": "A fully redesigned digital edition with custom illustration-forward layout system and an intimate reading experience.",
                "components": [],
                "isFeatured": False,
                "client": "Burrowed Publications",
                "year": "2025",
                "order": 5
            },
            {
                "id": "6",
                "slug": "dhch",
                "name": "DHCH",
                "category": "Institution",
                "tags": ["BRANDING", "SYSTEM"],
                "coverImage": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=750&fit=crop",
                "sliderImage": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=750&fit=crop",
                "title": "DHCH — Cultural Institution Identity",
                "heroMedia": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&h=900&fit=crop",
                "heroMediaType": "image",
                "subtitle": "A considered identity system for a cultural heritage institution.",
                "description": "DHCH needed a visual system that honours tradition while remaining inviting to new audiences.",
                "readMoreText": "The resulting identity is rooted in archival research, translated into a modular system that works across signage, print and digital.",
                "components": [],
                "isFeatured": False,
                "client": "DHCH Foundation",
                "year": "2023",
                "order": 6
            }
        ]
        await db.projects.insert_many(projects)

    # Seed Homepage Content
    if await db.site_content.count_documents({"_id": "homepage"}) == 0:
        await db.site_content.insert_one({
            "_id": "homepage",
            "heroVideoUrl": "https://assets.mixkit.co/videos/preview/mixkit-white-sand-under-water-4330-large.mp4",
            "secondSectionTitle": "We craft enduring brand identities and digital experiences for ambitious teams.",
            "secondSectionDescription": "Paper Hoof is an independent brand design studio operating at the intersection of clarity, tactile beauty, and strategy.",
            "homepageProjectsLimit": 4
        })

    # Seed Brand Review Cards
    if await db.brand_review_cards.count_documents({}) == 0:
        cards = [
            {"cardIndex": 1, "title": "Brand Audit & Strategy", "minutes": 45, "imageUrl": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop"},
            {"cardIndex": 2, "title": "Visual Identity Review", "minutes": 30, "imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop"},
            {"cardIndex": 3, "title": "Digital Experience Review", "minutes": 60, "imageUrl": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"},
            {"cardIndex": 4, "title": "Packaging & Collateral Audit", "minutes": 45, "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop"},
            {"cardIndex": 5, "title": "Typography & Grid Check", "minutes": 30, "imageUrl": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"},
            {"cardIndex": 6, "title": "Growth & Rebranding Roadmap", "minutes": 60, "imageUrl": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=600&fit=crop"}
        ]
        await db.brand_review_cards.insert_many(cards)

    # Seed Socials
    if await db.site_content.count_documents({"_id": "socials"}) == 0:
        await db.site_content.insert_one({
            "_id": "socials",
            "email": "hello@paperhoof.com",
            "instagramUrl": "https://instagram.com/paperhoof",
            "linkedinUrl": "https://linkedin.com/company/paperhoof"
        })

    return {"status": "success", "message": "Initial database content seeded successfully"}

# Base & Booking endpoints
@api_router.get("/")
async def root():
    return {"message": "Paper Hoof API Service"}

@api_router.get("/bookings/booked-slots")
async def get_booked_slots(date: str = Query(..., description="Date string YYYY-MM-DD")):
    try:
        bookings = await db.bookings.find({"dateStr": date}, {"_id": 0, "timeSlot": 1}).to_list(100)
        booked_slots = [b["timeSlot"] for b in bookings if "timeSlot" in b and b["timeSlot"]]
    except Exception as e:
        logger.warning(f"Database query failed: {e}")
        booked_slots = []
    return {"date": date, "bookedSlots": booked_slots}

@api_router.post("/bookings", response_model=BookingResponse)
async def create_booking(input: BookingCreate):
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

    gcal_result = create_google_calendar_event(doc)
    doc['gcalResult'] = gcal_result

    try:
        await db.bookings.insert_one(doc)
    except Exception as e:
        logger.warning(f"Database insertion failed: {e}")

    return booking_obj

# Include router & middlewares
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()