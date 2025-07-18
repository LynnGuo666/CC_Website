from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String, index=True)
    source = Column(String)

    team_memberships = relationship("TeamMembership", back_populates="user")