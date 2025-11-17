from sqlalchemy import Column, Integer, String
from app.core.db import Base

class SiteConfig(Base):
    __tablename__ = "site_config"

    id = Column(Integer, primary_key=True)
    notification_text = Column(String, nullable=True)
    notification_link = Column(String, nullable=True)
    handbook_text = Column(String, nullable=True)
    handbook_url = Column(String, nullable=True)
    logo_filename = Column(String, nullable=True)
    site_name = Column(String, nullable=True)
    site_abbr = Column(String, nullable=True)
