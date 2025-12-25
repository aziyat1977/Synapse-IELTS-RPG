from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Clan(Base):
    __tablename__ = "clans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    sanity_meter = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # "Sync Level" stored as JSON: {"vocabulary": 50, "syntax": 50, "fluency": 50}
    sync_level = Column(JSON, default={"vocabulary": 0, "syntax": 0, "fluency": 0})
    
    region = Column(String, default="Tashkent") # e.g., Tashkent, Samarkand, Namangan
    
    members = relationship("User", back_populates="clan")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    telegram_id = Column(String, unique=True, nullable=True)
    
    clan_id = Column(Integer, ForeignKey("clans.id"), nullable=True)
    clan = relationship("Clan", back_populates="members")
    
    xp = Column(Integer, default=0)
    digital_credits = Column(Float, default=0.0) # For government integration
    daily_battle_completed = Column(Boolean, default=False)
    
    region = Column(String, default="Tashkent")
    
    # Store individual user stats to aggregate for Clan Sync
    stats = Column(JSON, default={"vocabulary": 0, "syntax": 0, "fluency": 0})
    
    def __repr__(self):
        return f"<User {self.username}>"
