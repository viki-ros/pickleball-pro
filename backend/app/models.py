from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=True)
    rating = Column(Float, default=3.5)  # DUPR rating (e.g. 3.0, 3.5, 4.0, 4.5, 5.0)
    avatar_color = Column(String(20), default="#10b981")
    preferred_side = Column(String(20), default="Any")  # "Right", "Left", "Any"
    matches_played = Column(Integer, default=0)
    matches_won = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Court(Base):
    __tablename__ = "courts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    surface_type = Column(String(50), default="Hardcourt Acrylic")  # "Hardcourt", "Cushioned", "Wood"
    status = Column(String(30), default="available")  # "available", "occupied", "maintenance"
    has_lights = Column(Boolean, default=True)
    location = Column(String(100), default="Center Arena")
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("CourtBooking", back_populates="court", cascade="all, delete-orphan")

class CourtBooking(Base):
    __tablename__ = "court_bookings"

    id = Column(Integer, primary_key=True, index=True)
    court_id = Column(Integer, ForeignKey("courts.id"), nullable=False)
    player_name = Column(String(100), nullable=False)
    start_time = Column(String(50), nullable=False)  # ISO string or "10:00 AM"
    end_time = Column(String(50), nullable=False)    # ISO string or "11:00 AM"
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)
    notes = Column(String(200), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    court = relationship("Court", back_populates="bookings")

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    format = Column(String(50), default="single_elimination")  # "single_elimination", "round_robin"
    status = Column(String(30), default="active")  # "upcoming", "active", "completed"
    max_teams = Column(Integer, default=8)
    prize_pool = Column(String(50), default="")
    start_date = Column(String(50), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    matches = relationship("Match", back_populates="tournament")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), default="Pickleball Match")
    match_type = Column(String(20), default="doubles")  # "singles" or "doubles"
    scoring_mode = Column(String(20), default="sideout")  # "sideout" or "rally"
    target_points = Column(Integer, default=11)  # 11, 15, or 21
    win_by = Column(Integer, default=2)

    # Participants
    team1_player1_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    team1_player2_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    team2_player1_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    team2_player2_id = Column(Integer, ForeignKey("players.id"), nullable=True)

    # Live State
    score_team1 = Column(Integer, default=0)
    score_team2 = Column(Integer, default=0)
    serving_team = Column(Integer, default=1)  # 1 or 2
    server_number = Column(Integer, default=2)  # In doubles side-out, game starts at Server 2 ("0-0-2")
    
    # Player court sides ("right" or "left")
    team1_player1_side = Column(String(10), default="right")
    team1_player2_side = Column(String(10), default="left")
    team2_player1_side = Column(String(10), default="right")
    team2_player2_side = Column(String(10), default="left")

    # Match Status & Outcome
    is_completed = Column(Boolean, default=False)
    winner_team = Column(Integer, nullable=True)  # 1 or 2
    court_id = Column(Integer, ForeignKey("courts.id"), nullable=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=True)
    round_number = Column(Integer, default=1)
    match_number = Column(Integer, default=1)

    # Undo stack & rally history
    history = Column(Text, default="[]")  # JSON encoded list of states

    created_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    tournament = relationship("Tournament", back_populates="matches")
    team1_player1 = relationship("Player", foreign_keys=[team1_player1_id])
    team1_player2 = relationship("Player", foreign_keys=[team1_player2_id])
    team2_player1 = relationship("Player", foreign_keys=[team2_player1_id])
    team2_player2 = relationship("Player", foreign_keys=[team2_player2_id])
