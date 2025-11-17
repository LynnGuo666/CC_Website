from pydantic import BaseModel
from typing import Optional

class SiteConfigResponse(BaseModel):
    notification_text: Optional[str] = None
    notification_link: Optional[str] = None
    handbook_text: Optional[str] = None
    handbook_url: Optional[str] = None
    logo_filename: Optional[str] = None
    site_name: Optional[str] = None
    site_abbr: Optional[str] = None

    class Config:
        from_attributes = True

class SiteConfigUpdate(BaseModel):
    notification_text: Optional[str] = None
    notification_link: Optional[str] = None
    handbook_text: Optional[str] = None
    handbook_url: Optional[str] = None
    logo_filename: Optional[str] = None
    site_name: Optional[str] = None
    site_abbr: Optional[str] = None
