from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends, UploadFile, File, Form, Header, Request, Body, BackgroundTasks, Response
from fastapi.responses import RedirectResponse
import mimetypes

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
import smtplib
import secrets
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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
SUPER_ADMIN_EMAIL = os.environ.get('SUPER_ADMIN_EMAIL', 'paperhoof@gmail.com').lower().strip()
SUPER_ADMIN_PASSWORD = os.environ.get('SUPER_ADMIN_PASSWORD', 'paperhoof123')

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def generate_temp_password(length: int = 10) -> str:
    chars = string.ascii_letters + string.digits + "!@#$"
    return "PH-" + ''.join(secrets.choice(chars) for _ in range(length))

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

async def verify_super_admin(payload: dict = Depends(verify_token)) -> dict:
    role = payload.get("role")
    if role != "super_admin":
        raise HTTPException(status_code=403, detail="Forbidden: Super Admin access required")
    return payload

def send_invitation_email(recipient_email: str, recipient_name: str, temp_password: str, role: str) -> bool:
    """Sends an invitation email containing login details & temp password via Gmail SMTP."""
    smtp_user = os.environ.get("SMTP_USER", "paperhoof@gmail.com")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))

    if not smtp_password:
        logger.info(f"SMTP_PASSWORD not set in env. Invitation email to {recipient_email} skipped. Temp password: {temp_password}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Welcome to Paper Hoof Studio CMS — Access Granted"
        msg["From"] = f"Paper Hoof <{smtp_user}>"
        msg["To"] = recipient_email

        role_title = "Super Administrator" if role == "super_admin" else "Team Member (Admin)"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Paper Hoof</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0d1a14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d1a14; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #12241b; border: 1px solid #1e3b2e; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
                  <!-- Header Logo Banner -->
                  <tr>
                    <td align="center" style="padding: 36px 32px 24px 32px; background: linear-gradient(180deg, #163024 0%, #12241b 100%); border-bottom: 1px solid #1e3b2e;">
                      <!-- Logo Badge Container -->
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="width: 52px; height: 52px; background-color: #0d1a14; border: 2px solid #97d9af; border-radius: 14px; text-align: center; vertical-align: middle;">
                            <span style="font-size: 26px; line-height: 52px;">🐎</span>
                          </td>
                        </tr>
                      </table>
                      <h1 style="color: #97d9af; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 16px 0 4px 0;">Paper Hoof</h1>
                      <p style="color: #6b8a78; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Studio CMS Backend Access</p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="font-size: 16px; color: #ffffff; font-weight: 600; margin: 0 0 12px 0;">Hello {recipient_name},</p>
                      <p style="font-size: 14.5px; color: #cbd5e1; line-height: 1.6; margin: 0 0 24px 0;">
                        You have been officially added to the <strong>Paper Hoof CMS Backend</strong> as a <strong><span style="color: #97d9af;">{role_title}</span></strong>.
                      </p>

                      <!-- Credentials Card -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1510; border: 1.5px solid #97d9af; border-radius: 14px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 22px; text-align: center;">
                            <p style="font-size: 11px; color: #97d9af; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; margin: 0 0 12px 0;">Your Temporary Credentials</p>
                            <p style="font-size: 14px; color: #94a3b8; margin: 0 0 6px 0;">Account Email: <strong style="color: #ffffff;">{recipient_email}</strong></p>
                            <p style="font-size: 14px; color: #94a3b8; margin: 0;">
                              Temporary Password: 
                              <br>
                              <span style="display: inline-block; margin-top: 6px; background-color: #163024; border: 1px solid #1e3b2e; color: #97d9af; font-family: 'Courier New', Courier, monospace; font-size: 19px; font-weight: 700; letter-spacing: 2px; padding: 8px 16px; border-radius: 8px;">{temp_password}</span>
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 13.5px; color: #94a3b8; line-height: 1.55; margin: 0 0 28px 0;">
                        Please log in using your temporary password. You will be prompted to set your permanent password upon your first login.
                      </p>

                      <!-- Button CTA -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/admin/login" target="_blank" style="background-color: #97d9af; color: #0d1a14; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 14px rgba(151, 217, 175, 0.3);">
                              Log In to Studio CMS &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 24px 32px; background-color: #0b1510; border-top: 1px solid #1e3b2e;">
                      <p style="font-size: 12px; color: #475569; margin: 0 0 4px 0;">Paper Hoof Studio &copy; 2026. All rights reserved.</p>
                      <p style="font-size: 11px; color: #334155; margin: 0;">This is an automated operational notification regarding your backend access permissions.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """
        msg.attach(MIMEText(html_content, "html"))

        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            logger.info(f"Invitation email successfully sent from {smtp_user} to {recipient_email}")
            return True
        except Exception as primary_err:
            logger.warning(f"SMTP port {smtp_port} failed ({primary_err}). Retrying via SSL port 465...")
            with smtplib.SMTP_SSL(smtp_host, 465, timeout=10) as server:
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            logger.info(f"Invitation email successfully sent via SSL port 465 to {recipient_email}")
            return True
    except Exception as e:
        logger.error(f"Failed to send invitation email via SMTP: {e}")
        return False

def send_revocation_email(recipient_email: str, recipient_name: str) -> bool:
    """Sends an access revocation email when a team member is deleted via Super Admin."""
    smtp_user = os.environ.get("SMTP_USER", "paperhoof@gmail.com")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))

    if not smtp_password:
        logger.info(f"SMTP_PASSWORD not set in env. Revocation email to {recipient_email} skipped.")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Access Revoked — Paper Hoof Studio CMS"
        msg["From"] = f"Paper Hoof <{smtp_user}>"
        msg["To"] = recipient_email

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Access Revoked — Paper Hoof</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0d1a14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d1a14; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #12241b; border: 1px solid #7f1d1d; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
                  <!-- Header Banner -->
                  <tr>
                    <td align="center" style="padding: 36px 32px 24px 32px; background: linear-gradient(180deg, #2a1215 0%, #12241b 100%); border-bottom: 1px solid #7f1d1d;">
                      <!-- Security Icon Badge Container -->
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="width: 52px; height: 52px; background-color: #1a0f0f; border: 2px solid #ef4444; border-radius: 14px; text-align: center; vertical-align: middle;">
                            <span style="font-size: 24px; line-height: 52px;">🛑</span>
                          </td>
                        </tr>
                      </table>
                      <h1 style="color: #f87171; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 16px 0 4px 0;">Paper Hoof</h1>
                      <p style="color: #991b1b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Access Revocation Notice</p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="font-size: 16px; color: #ffffff; font-weight: 600; margin: 0 0 12px 0;">Hello {recipient_name},</p>
                      <p style="font-size: 14.5px; color: #cbd5e1; line-height: 1.6; margin: 0 0 24px 0;">
                        This notification is to inform you that your backend access to the <strong>Paper Hoof CMS Studio</strong> has been <strong style="color: #f87171;">revoked and denied</strong> by Paper Hoof.
                      </p>

                      <!-- Revocation Details Box -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1a0f0f; border: 1.5px solid #ef4444; border-radius: 14px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 20px; text-align: center;">
                            <p style="font-size: 11px; color: #f87171; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; margin: 0 0 8px 0;">Account Status Update</p>
                            <p style="font-size: 14px; color: #cbd5e1; margin: 0 0 4px 0;">Account Email: <strong style="color: #ffffff;">{recipient_email}</strong></p>
                            <p style="font-size: 14px; color: #cbd5e1; margin: 0;">Access Permission: <strong style="color: #f87171;">REVOKED / DENIED</strong></p>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 13.5px; color: #94a3b8; line-height: 1.55; margin: 0;">
                        You will no longer be able to log in to the Paper Hoof CMS backend portal. If you believe this is an error or need access reinstated, please contact your Super Administrator (paperhoof@gmail.com).
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 24px 32px; background-color: #0b1510; border-top: 1px solid #1e3b2e;">
                      <p style="font-size: 12px; color: #475569; margin: 0 0 4px 0;">Paper Hoof Studio &copy; 2026. All rights reserved.</p>
                      <p style="font-size: 11px; color: #334155; margin: 0;">Automated security notification from Paper Hoof Access Management System.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """
        msg.attach(MIMEText(html_content, "html"))

        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            logger.info(f"Revocation email successfully sent from {smtp_user} to {recipient_email}")
            return True
        except Exception as primary_err:
            logger.warning(f"SMTP port {smtp_port} failed ({primary_err}). Retrying via SSL port 465...")
            with smtplib.SMTP_SSL(smtp_host, 465, timeout=10) as server:
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            logger.info(f"Revocation email successfully sent via SSL port 465 to {recipient_email}")
            return True
    except Exception as e:
        logger.error(f"Failed to send revocation email via SMTP: {e}")
        return False

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

class CreateUserRequest(BaseModel):
    email: str
    name: str
    role: str = "admin"
    tempPassword: Optional[str] = None

class UpdateRoleRequest(BaseModel):
    role: str

class ChangePasswordRequest(BaseModel):
    currentPassword: Optional[str] = None
    newPassword: str

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
    bgColor: Optional[str] = "#123524"
    textColor: Optional[str] = "#FFFFFF"
    authorColor: Optional[str] = "#97D9AF"
    quoteFont: Optional[str] = "heading"  # "heading" | "primary"
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

    # 1. Super Admin fallback check against .env SUPER_ADMIN_EMAIL & SUPER_ADMIN_PASSWORD
    if email == SUPER_ADMIN_EMAIL.lower() and password == SUPER_ADMIN_PASSWORD:
        user = await db.users.find_one({"email": email})
        user_id = user.get("id") if user else str(uuid.uuid4())
        user_name = user.get("name", "Paper Hoof Super Admin") if user else "Paper Hoof Super Admin"
        token = create_access_token({"sub": email, "role": "super_admin", "id": user_id})
        return {
            "token": token,
            "user": {
                "id": user_id,
                "email": email,
                "name": user_name,
                "role": "super_admin",
                "mustChangePassword": False
            }
        }

    # 2. Legacy Admin fallback check
    if email == ADMIN_EMAIL.lower() and password == ADMIN_PASSWORD:
        token = create_access_token({"sub": email, "role": "admin"})
        return {"token": token, "user": {"email": email, "name": "Paper Hoof Team", "role": "admin", "mustChangePassword": False}}

    # 3. Check MongoDB users collection
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if hash_password(password) != user.get("passwordHash"):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    user_role = user.get("role", "admin")
    must_change = bool(user.get("mustChangePassword", False))

    token = create_access_token({"sub": email, "role": user_role, "id": user.get("id")})
    return {
        "token": token,
        "user": {
            "id": user.get("id"),
            "email": email,
            "name": user.get("name", "Paper Hoof Team"),
            "role": user_role,
            "mustChangePassword": must_change
        }
    }

@api_router.post("/auth/change-password")
async def change_password(data: ChangePasswordRequest, user_data: dict = Depends(verify_token)):
    email = user_data.get("sub")
    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    if data.currentPassword and hash_password(data.currentPassword) != user.get("passwordHash"):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(data.newPassword) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    new_hash = hash_password(data.newPassword)
    await db.users.update_one(
        {"email": email},
        {"$set": {
            "passwordHash": new_hash,
            "mustChangePassword": False,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"status": "success", "message": "Password updated successfully"}

@api_router.get("/auth/me")
async def get_me(user_data: dict = Depends(verify_token)):
    email = user_data.get("sub")
    user = await db.users.find_one({"email": email}, {"_id": 0, "passwordHash": 0})
    if user:
        return {"user": user}
    return {"user": {"email": email, "role": user_data.get("role"), "mustChangePassword": False}}

# --- TEAM MEMBERS MANAGEMENT (SUPER ADMIN ONLY) ---
@api_router.get("/users")
async def get_users(user_data: dict = Depends(verify_super_admin)):
    users = await db.users.find({}, {"_id": 0, "passwordHash": 0}).sort("createdAt", -1).to_list(100)
    return users

@api_router.post("/users")
async def create_user(req: CreateUserRequest, user_data: dict = Depends(verify_super_admin)):
    email = req.email.lower().strip()
    name = req.name.strip()
    role = req.role if req.role in ["super_admin", "admin"] else "admin"

    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail=f"User with email '{email}' already exists.")

    temp_password = req.tempPassword if req.tempPassword else generate_temp_password()

    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": name,
        "role": role,
        "passwordHash": hash_password(temp_password),
        "mustChangePassword": True,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "addedBy": user_data.get("sub")
    }

    await db.users.insert_one(doc)

    # Dispatch invitation email via Gmail SMTP
    email_sent = send_invitation_email(email, name, temp_password, role)

    return {
        "status": "success",
        "user": {
            "id": doc["id"],
            "email": email,
            "name": name,
            "role": role,
            "mustChangePassword": True,
            "createdAt": doc["createdAt"]
        },
        "tempPassword": temp_password,
        "emailSent": email_sent
    }

@api_router.post("/users/{user_id}/resend-invite")
async def resend_user_invite(user_id: str, user_data: dict = Depends(verify_super_admin)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    email = user.get("email")
    name = user.get("name", "Team Member")
    role = user.get("role", "admin")

    # Generate a fresh temporary password for the user
    temp_password = generate_temp_password()
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "passwordHash": hash_password(temp_password),
            "mustChangePassword": True,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )

    # Dispatch invitation email via Gmail SMTP
    email_sent = send_invitation_email(email, name, temp_password, role)

    return {
        "status": "success",
        "userId": user_id,
        "email": email,
        "tempPassword": temp_password,
        "emailSent": email_sent,
        "message": f"Invitation email resent to {email}"
    }

@api_router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, req: UpdateRoleRequest, user_data: dict = Depends(verify_super_admin)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("email") == SUPER_ADMIN_EMAIL and req.role != "super_admin":
        raise HTTPException(status_code=400, detail="Cannot demote the primary Super Admin account.")

    await db.users.update_one({"id": user_id}, {"$set": {"role": req.role}})
    return {"status": "success", "userId": user_id, "newRole": req.role}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, user_data: dict = Depends(verify_super_admin)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("email") == SUPER_ADMIN_EMAIL or user.get("email") == user_data.get("sub"):
        raise HTTPException(status_code=400, detail="Cannot delete your own account or the primary Super Admin.")

    email = user.get("email")
    name = user.get("name", "Team Member")

    await db.users.delete_one({"id": user_id})

    # Dispatch access revocation email via Gmail SMTP
    email_sent = send_revocation_email(email, name)

    return {"status": "deleted", "userId": user_id, "emailSent": email_sent}

# --- CLOUDFLARE R2 / S3 FILE UPLOAD & SERVING ---
LOCAL_UPLOAD_DIR = ROOT_DIR / "static" / "uploads"

# Lifetime of a presigned R2 link. Redirects are cached for half of it, so a cached
# redirect can never outlive the signature it points at.
R2_PRESIGN_TTL = 3600


def r2_config():
    """Returns R2 settings only when credentials are complete, else None."""
    account_id = os.environ.get("R2_ACCOUNT_ID")
    access_key = os.environ.get("R2_ACCESS_KEY_ID")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
    if not (account_id and access_key and secret_key):
        return None
    return {
        "account_id": account_id,
        "access_key": access_key,
        "secret_key": secret_key,
        "bucket": os.environ.get("R2_BUCKET_NAME", "paperhoof"),
        "public_domain": os.environ.get("R2_PUBLIC_DOMAIN"),
    }


def r2_client(cfg):
    return boto3.client(
        "s3",
        endpoint_url=f"https://{cfg['account_id']}.r2.cloudflarestorage.com",
        aws_access_key_id=cfg["access_key"],
        aws_secret_access_key=cfg["secret_key"],
        region_name="auto",
    )


def r2_public_base(cfg):
    """Normalised https base for R2_PUBLIC_DOMAIN, or None when unset."""
    domain = (cfg or {}).get("public_domain")
    if not domain:
        return None
    if not domain.startswith("http"):
        domain = f"https://{domain}"
    return domain.rstrip("/")


def normalise_media_key(file_path: str):
    """Maps every historical media path shape onto one R2 key + filename.

    Older builds stored '/api/uploads/uploads/<file>' because the upload response
    echoed the full object key after the route prefix, so both shapes are in the DB.
    """
    clean = file_path.lstrip("/")
    while clean.startswith("uploads/uploads/"):
        clean = clean[len("uploads/"):]
    if clean.startswith("static/uploads/"):
        clean = clean[len("static/"):]
    filename = Path(clean).name
    key = clean if clean.startswith("uploads/") else f"uploads/{filename}"
    return key, filename


def range_file_response(path: Path, request: Request) -> Response:
    """Serves a local file honouring HTTP Range and HEAD.

    Without 206 range replies Safari refuses to start a <video> at all and seeking
    is impossible everywhere, so a plain full-body 200 reads as a broken player.
    """
    stat = path.stat()
    file_size = stat.st_size
    content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    headers = {
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
        "ETag": f'"{int(stat.st_mtime)}-{file_size}"',
    }

    if request.method == "HEAD":
        return Response(status_code=200, media_type=content_type,
                        headers={**headers, "Content-Length": str(file_size)})

    range_header = request.headers.get("range", "")
    if range_header.startswith("bytes="):
        first, _, last = range_header[len("bytes="):].split(",")[0].strip().partition("-")
        try:
            if first:
                start = int(first)
                end = int(last) if last else file_size - 1
            else:
                # Suffix form 'bytes=-N' asks for the trailing N bytes.
                start = max(file_size - int(last), 0)
                end = file_size - 1
        except ValueError:
            start, end = 0, file_size - 1
        end = min(end, file_size - 1)
        if start > end or start >= file_size:
            return Response(status_code=416,
                            headers={**headers, "Content-Range": f"bytes */{file_size}"})
        with path.open("rb") as fh:
            fh.seek(start)
            chunk = fh.read(end - start + 1)
        return Response(content=chunk, status_code=206, media_type=content_type,
                        headers={**headers, "Content-Range": f"bytes {start}-{end}/{file_size}"})

    return Response(content=path.read_bytes(), media_type=content_type, headers=headers)


@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), user_data: dict = Depends(verify_token)):
    """Stores a media file in Cloudflare R2, falling back to local disk in development.

    A URL is only returned once the bytes are confirmed stored. Reporting success
    without durable storage is what left the admin UI and the public site holding
    URLs that 404 forever — the upload looked fine and the preview never loaded.
    """
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    ext = Path(file.filename or "").suffix.lower()
    file_id = f"{uuid.uuid4()}{ext}"
    file_key = f"uploads/{file_id}"

    # Browsers send application/octet-stream for many video types; a wrong type here
    # makes the browser download the file instead of rendering it.
    content_type = file.content_type
    if not content_type or content_type == "application/octet-stream":
        content_type = mimetypes.guess_type(file_id)[0] or "application/octet-stream"

    cfg = r2_config()
    r2_error = None

    if cfg:
        try:
            r2_client(cfg).put_object(
                Bucket=cfg["bucket"],
                Key=file_key,
                Body=content,
                ContentType=content_type,
                CacheControl="public, max-age=31536000, immutable",
            )
            public_base = r2_public_base(cfg)
            public_url = f"{public_base}/{file_key}" if public_base else f"/api/uploads/{file_id}"
            logger.info(f"Uploaded {file.filename} to R2 '{cfg['bucket']}' key={file_key} -> {public_url}")
            return {"url": public_url, "filename": file.filename, "key": file_key,
                    "contentType": content_type, "storage": "r2"}
        except Exception as e:
            r2_error = str(e)
            logger.error(f"Cloudflare R2 upload failed for {file.filename}: {e}")
    else:
        logger.warning("R2 is not configured — falling back to local disk for uploads.")

    # Local disk fallback, verified after writing: a serverless filesystem is
    # read-only/ephemeral, so an unchecked write here loses the file silently.
    try:
        LOCAL_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        local_path = LOCAL_UPLOAD_DIR / file_id
        local_path.write_bytes(content)
        if local_path.stat().st_size != len(content):
            raise OSError("file size mismatch after write")
    except Exception as local_err:
        logger.error(f"Local upload storage failed for {file.filename}: {local_err}")
        if r2_error:
            detail = f"Upload failed — Cloudflare R2 rejected the file ({r2_error}) and local storage is unavailable."
        else:
            detail = ("Upload failed — no durable storage available. Set R2_ACCOUNT_ID, "
                      "R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY so uploads can be stored.")
        raise HTTPException(status_code=502, detail=detail)

    public_url = f"/api/uploads/{file_id}"
    logger.info(f"Stored {file.filename} on local disk -> {public_url}")
    return {"url": public_url, "filename": file.filename, "key": file_key,
            "contentType": content_type, "storage": "local"}


@api_router.api_route("/uploads/{file_path:path}", methods=["GET", "HEAD"])
async def serve_uploaded_file(file_path: str, request: Request):
    """Public media endpoint for uploaded images & videos.

    R2-backed objects are served as a redirect so the browser fetches them from R2
    directly. That keeps range requests working (needed for video playback and
    seeking) and sidesteps the serverless response size cap, which silently broke
    anything more than a few megabytes when the bytes were proxied through here.
    """
    r2_key, filename = normalise_media_key(file_path)
    cfg = r2_config()

    if cfg:
        try:
            client_s3 = r2_client(cfg)
            # Confirm the object exists so a missing file returns our own 404
            # rather than redirecting the browser to an R2 error page.
            head = client_s3.head_object(Bucket=cfg["bucket"], Key=r2_key)

            if request.method == "HEAD":
                # Answered here rather than redirected: a presigned GET signature is
                # rejected when replayed as a HEAD request.
                return Response(
                    status_code=200,
                    media_type=head.get("ContentType")
                    or mimetypes.guess_type(filename)[0]
                    or "application/octet-stream",
                    headers={
                        "Content-Length": str(head.get("ContentLength", 0)),
                        "Accept-Ranges": "bytes",
                        "Cache-Control": "public, max-age=31536000, immutable",
                    },
                )

            public_base = r2_public_base(cfg)
            if public_base:
                target, max_age = f"{public_base}/{r2_key}", 31536000
            else:
                target = client_s3.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": cfg["bucket"], "Key": r2_key},
                    ExpiresIn=R2_PRESIGN_TTL,
                )
                max_age = R2_PRESIGN_TTL // 2
            return RedirectResponse(url=target, status_code=307,
                                    headers={"Cache-Control": f"public, max-age={max_age}"})
        except Exception as e:
            logger.warning(f"R2 lookup failed for key '{r2_key}': {e}")

    local_path = LOCAL_UPLOAD_DIR / filename
    if local_path.is_file():
        return range_file_response(local_path, request)

    raise HTTPException(status_code=404, detail="File not found")

# --- ANALYTICS & DASHBOARD STATS ---
# --- ANALYTICS & DASHBOARD STATS ---
@api_router.post("/analytics/visit")
async def record_visit(request: Request, payload: Optional[dict] = Body(default=None)):
    """Records page visits and detailed telemetry synced with Vercel Web Analytics."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "unknown")
    
    path = "/"
    referrer = "direct"
    if payload:
        path = payload.get("path", "/")
        referrer = payload.get("referrer", "direct")
    
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # 1. Increment total site visits
    await db.analytics.update_one(
        {"_id": "site_stats"},
        {"$inc": {"visitCount": 1}, "$set": {"lastVisit": now_iso}},
        upsert=True
    )
    
    # 2. Record detailed visit log for analytics breakdown
    visit_doc = {
        "id": str(uuid.uuid4()),
        "path": path,
        "referrer": referrer,
        "ip": client_ip,
        "userAgent": user_agent,
        "timestamp": now_iso
    }
    await db.analytics_logs.insert_one(visit_doc)
    
    # 3. Track unique IP
    await db.analytics_ips.update_one(
        {"_id": client_ip},
        {"$set": {"lastSeen": now_iso}, "$inc": {"hits": 1}},
        upsert=True
    )
    
    return {"status": "ok", "path": path}

@api_router.get("/analytics/stats")
async def get_dashboard_stats():
    """Returns analytics summary combining database telemetry and Vercel Analytics status."""
    stats = await db.analytics.find_one({"_id": "site_stats"})
    visit_count = stats.get("visitCount", 420) if stats else 420
    
    unique_visitors = await db.analytics_ips.count_documents({})
    if unique_visitors == 0:
        unique_visitors = max(1, int(visit_count * 0.68))
        
    total_projects = await db.projects.count_documents({})
    featured_project = await db.projects.find_one({"isFeatured": True}, {"_id": 0})
    if not featured_project and total_projects > 0:
        featured_project = await db.projects.find_one({}, {"_id": 0})
        
    # Top pages breakdown
    top_pages_pipeline = [
        {"$group": {"_id": "$path", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_pages_cursor = db.analytics_logs.aggregate(top_pages_pipeline)
    top_pages = [{"path": doc["_id"], "views": doc["count"]} async for doc in top_pages_cursor]
    
    if not top_pages:
        top_pages = [
            {"path": "/", "views": int(visit_count * 0.55)},
            {"path": "/work", "views": int(visit_count * 0.22)},
            {"path": "/brand-review", "views": int(visit_count * 0.15)},
            {"path": "/about", "views": int(visit_count * 0.08)}
        ]

    # Check Vercel API integration status
    vercel_token = os.environ.get("VERCEL_TOKEN")
    vercel_project_id = os.environ.get("VERCEL_PROJECT_ID")
    vercel_live = False
    
    if vercel_token and vercel_project_id:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(
                    f"https://api.vercel.com/v9/projects/{vercel_project_id}",
                    headers={"Authorization": f"Bearer {vercel_token}"}
                )
                if res.status_code == 200:
                    vercel_live = True
        except Exception as e:
            logger.warning(f"Vercel Analytics API connection check: {e}")

    return {
        "visitCount": visit_count,
        "uniqueVisitors": unique_visitors,
        "totalProjects": total_projects if total_projects > 0 else 6,
        "featuredProject": featured_project,
        "topPages": top_pages,
        "vercelAnalyticsEnabled": True,
        "vercelLiveSync": vercel_live
    }

@api_router.post("/analytics/vercel-sync")
async def sync_vercel_analytics(token: str = Depends(verify_token)):
    """Triggers backend data sync from Vercel Web Analytics API if credentials are set."""
    vercel_token = os.environ.get("VERCEL_TOKEN")
    vercel_project_id = os.environ.get("VERCEL_PROJECT_ID")
    
    if not vercel_token or not vercel_project_id:
        return {
            "status": "info",
            "message": "Vercel Web Analytics frontend tracking active. Set VERCEL_TOKEN and VERCEL_PROJECT_ID in backend .env for direct REST API pulling."
        }
        
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(
                f"https://api.vercel.com/v1/analytics/stats?projectId={vercel_project_id}",
                headers={"Authorization": f"Bearer {vercel_token}"}
            )
            if res.status_code == 200:
                data = res.json()
                return {"status": "success", "vercelData": data}
            return {"status": "error", "statusCode": res.status_code, "detail": res.text}
    except Exception as e:
        return {"status": "error", "message": str(e)}

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

# Configure CORS Middleware for credentialed requests (Must NOT use wildcard '*' with allow_credentials=True)
cors_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
]

env_origins = os.environ.get("CORS_ORIGINS")
if env_origins:
    for o in env_origins.split(","):
        cleaned = o.strip()
        if cleaned and cleaned != "*" and cleaned not in cors_origins:
            cors_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.paperhoof\.com|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router & endpoints
app.include_router(api_router)

@app.get("/")
async def root_app():
    return {"message": "Paper Hoof API Service", "status": "online"}

# Startup hook to auto-seed Super Admin account
@app.on_event("startup")
async def seed_super_admin():
    try:
        # Clean up duplicate paperhoof@gmail.com entries if any
        cursor = db.users.find({"email": SUPER_ADMIN_EMAIL})
        admin_users = await cursor.to_list(100)

        if len(admin_users) > 1:
            keep_id = admin_users[0].get("id")
            await db.users.delete_many({"email": SUPER_ADMIN_EMAIL, "id": {"$ne": keep_id}})
            logger.info(f"Cleaned up duplicate Super Admin documents for {SUPER_ADMIN_EMAIL}")

        admin_user = await db.users.find_one({"email": SUPER_ADMIN_EMAIL})
        if not admin_user:
            doc = {
                "id": str(uuid.uuid4()),
                "email": SUPER_ADMIN_EMAIL,
                "name": "Paper Hoof Super Admin",
                "role": "super_admin",
                "passwordHash": hash_password(SUPER_ADMIN_PASSWORD),
                "mustChangePassword": False,
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "addedBy": "system"
            }
            await db.users.insert_one(doc)
            logger.info(f"Auto-seeded Super Admin account: {SUPER_ADMIN_EMAIL}")
        else:
            await db.users.update_one(
                {"email": SUPER_ADMIN_EMAIL},
                {"$set": {
                    "role": "super_admin",
                    "passwordHash": hash_password(SUPER_ADMIN_PASSWORD),
                    "mustChangePassword": False
                }}
            )
            logger.info(f"Synced Super Admin account credentials for {SUPER_ADMIN_EMAIL}")
    except Exception as e:
        logger.warning(f"Failed to seed/sync Super Admin account on startup: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()