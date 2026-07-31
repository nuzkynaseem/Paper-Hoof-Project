import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

CALENDAR_ID = os.environ.get("GOOGLE_CALENDAR_ID", "paperhoof@gmail.com")

def create_google_calendar_event(booking_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Creates a Google Calendar Event for a session booking.
    - Target Calendar: paperhoof@gmail.com
    - No automatic Google Meet link (sent manually as requested).
    - Handles missing Google credentials gracefully.
    """
    credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    service_account_info = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    
    first_name = booking_data.get("firstName", "")
    last_name = booking_data.get("lastName", "")
    full_name = f"{first_name} {last_name}".strip() or "Client"
    company = booking_data.get("company", "N/A")
    email = booking_data.get("email", "")
    phone = booking_data.get("phone", "N/A")
    instagram = booking_data.get("instagram", "N/A")
    service = booking_data.get("service", "Brand Review")
    budget = booking_data.get("budget", "N/A")
    hear_about = booking_data.get("hearAbout", "N/A")
    referrer = booking_data.get("referrer", "N/A")
    notes = booking_data.get("notes", "N/A")
    date_str = booking_data.get("dateStr", "")  # YYYY-MM-DD
    time_slot = booking_data.get("timeSlot", "")  # "7:00 PM - 9:00 PM" or "9:00 PM - 11:00 PM"

    summary = f"Brand Review Session - {full_name} ({company})"
    description = f"""Brand Review Session Booking Details:

Client Name: {full_name}
Email: {email}
Phone: {phone}
Company: {company}
Instagram: {instagram}

Service Requested: {service}
Budget: {budget}
How Heard: {hear_about}
Referred By: {referrer}

Additional Notes:
{notes}
"""

    logger.info(f"[Google Calendar] Booking received for {full_name} on {date_str} ({time_slot}) to calendar: {CALENDAR_ID}")

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        scopes = ['https://www.googleapis.com/auth/calendar']
        creds = None

        if credentials_path and os.path.exists(credentials_path):
            creds = service_account.Credentials.from_service_account_file(credentials_path, scopes=scopes)
        elif service_account_info:
            import json
            info = json.loads(service_account_info)
            creds = service_account.Credentials.from_service_account_info(info, scopes=scopes)

        if creds:
            service_client = build('calendar', 'v3', credentials=creds)
            
            start_hour = 19 if "7:00 PM" in time_slot or "7-9" in time_slot else 21
            end_hour = 21 if "7:00 PM" in time_slot or "7-9" in time_slot else 23
            
            start_iso = f"{date_str}T{start_hour:02d}:00:00+05:30"
            end_iso = f"{date_str}T{end_hour:02d}:00:00+05:30"

            event_body = {
                'summary': summary,
                'description': description,
                'start': {
                    'dateTime': start_iso,
                    'timeZone': 'Asia/Kolkata',
                },
                'end': {
                    'dateTime': end_iso,
                    'timeZone': 'Asia/Kolkata',
                },
                'reminders': {
                    'useDefault': True,
                },
            }

            event = service_client.events().insert(
                calendarId=CALENDAR_ID,
                body=event_body
            ).execute()

            logger.info(f"[Google Calendar] Event successfully created: {event.get('htmlLink')}")
            return {"eventId": event.get("id"), "eventLink": event.get("htmlLink")}

        else:
            logger.info("[Google Calendar] API credentials not provided in environment. Booking saved locally.")
            return {"status": "saved_without_gcal_creds"}

    except ImportError:
        logger.info("[Google Calendar] google-api-python-client package not installed. Booking saved locally.")
        return {"status": "gcal_library_not_installed"}
    except Exception as e:
        logger.error(f"[Google Calendar] Error creating event: {str(e)}")
        return {"status": "error", "message": str(e)}
