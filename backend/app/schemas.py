from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

# Player Schemas
class PlayerBase(BaseModel):
    name: str
    email: Optional[str] = None
    rating: float = 3.5
    avatar_color: str = "#10b981"
    preferred_side: str = "Any"

class PlayerCreate(PlayerBase):
    pass

class PlayerResponse(PlayerBase):
    id: int
    matches_played: int
    matches_won: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Court Schemas
class CourtBase(BaseModel):
    name: str
    surface_type: str = "Hardcourt Acrylic"
    status: str = "available"
    has_lights: bool = True
    location: str = "Center Arena"

class CourtCreate(CourtBase):
    pass

class CourtBookingBase(BaseModel):
    court_id: int
    player_name: str
    start_time: str
    end_time: str
    match_id: Optional[int] = None
    notes: Optional[str] = ""

class CourtBookingCreate(CourtBookingBase):
    pass

class CourtBookingResponse(CourtBookingBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CourtResponse(CourtBase):
    id: int
    bookings: List[CourtBookingResponse] = []
    model_config = ConfigDict(from_attributes=True)

# Match Schemas
class MatchBase(BaseModel):
    title: str = "Pickleball Match"
    match_type: str = "doubles"  # "singles" or "doubles"
    scoring_mode: str = "sideout"  # "sideout" or "rally"
    target_points: int = 11
    win_by: int = 2
    court_id: Optional[int] = None
    tournament_id: Optional[int] = None

class MatchCreate(MatchBase):
    team1_player1_id: Optional[int] = None
    team1_player2_id: Optional[int] = None
    team2_player1_id: Optional[int] = None
    team2_player2_id: Optional[int] = None

class RallyEvent(BaseModel):
    winning_team: int  # 1 or 2

class MatchResponse(MatchBase):
    id: int
    score_team1: int
    score_team2: int
    serving_team: int
    server_number: int
    team1_player1_side: str
    team1_player2_side: str
    team2_player1_side: str
    team2_player2_side: str
    is_completed: bool
    winner_team: Optional[int] = None
    score_call: Optional[str] = None
    created_at: datetime
    finished_at: Optional[datetime] = None

    team1_player1: Optional[PlayerResponse] = None
    team1_player2: Optional[PlayerResponse] = None
    team2_player1: Optional[PlayerResponse] = None
    team2_player2: Optional[PlayerResponse] = None

    model_config = ConfigDict(from_attributes=True)

# Tournament Schemas
class TournamentBase(BaseModel):
    name: str
    format: str = "single_elimination"
    status: str = "active"
    max_teams: int = 8
    prize_pool: Optional[str] = "$500"
    start_date: Optional[str] = ""

class TournamentCreate(TournamentBase):
    pass

class TournamentResponse(TournamentBase):
    id: int
    matches: List[MatchResponse] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
