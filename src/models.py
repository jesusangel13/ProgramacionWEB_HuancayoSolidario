from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, TIMESTAMP, text
from sqlalchemy.orm import relationship
from .database import Base 

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum('volunteer','organization'), default='volunteer')
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), nullable=False)

    campaigns = relationship("Campaign", back_populates="owner")
    activities = relationship("Activity", back_populates="user")

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text)
    location = Column(String(150))
    date_created = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="campaigns")

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(50))
    activity = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="activities")
