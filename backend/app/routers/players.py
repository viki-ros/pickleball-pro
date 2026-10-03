from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Player
from ..schemas import PlayerCreate, PlayerResponse

router = APIRouter(prefix="/api/players", tags=["Players"])

@router.get("", response_model=List[PlayerResponse])
def list_players(db: Session = Depends(get_db)):
    return db.query(Player).order_by(Player.rating.desc()).all()

@router.post("", response_model=PlayerResponse)
def create_player(player_in: PlayerCreate, db: Session = Depends(get_db)):
    existing = db.query(Player).filter(Player.name == player_in.name).first()
    if existing:
        return existing
    player = Player(**player_in.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player

@router.get("/{player_id}", response_model=PlayerResponse)
def get_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player
