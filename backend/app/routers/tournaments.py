from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Tournament, Match, Player
from ..schemas import TournamentCreate, TournamentResponse

router = APIRouter(prefix="/api/tournaments", tags=["Tournaments"])

@router.get("", response_model=List[TournamentResponse])
def list_tournaments(db: Session = Depends(get_db)):
    return db.query(Tournament).order_by(Tournament.created_at.desc()).all()

@router.post("", response_model=TournamentResponse)
def create_tournament(tourn_in: TournamentCreate, db: Session = Depends(get_db)):
    tournament = Tournament(**tourn_in.model_dump())
    db.add(tournament)
    db.commit()
    db.refresh(tournament)

    # Seed initial bracket matches (Quarter-finals for 8-team bracket)
    players = db.query(Player).limit(16).all()
    num_matches = 4 if tournament.max_teams >= 8 else 2

    for i in range(num_matches):
        p1 = players[i*2] if len(players) > i*2 else None
        p2 = players[i*2+1] if len(players) > i*2+1 else None

        match = Match(
            title=f"{tournament.name} - Round 1 Match {i+1}",
            match_type="doubles",
            scoring_mode="sideout",
            target_points=11,
            win_by=2,
            tournament_id=tournament.id,
            round_number=1,
            match_number=i+1,
            team1_player1_id=p1.id if p1 else None,
            team2_player1_id=p2.id if p2 else None,
            score_team1=0,
            score_team2=0,
            serving_team=1,
            server_number=2
        )
        db.add(match)

    db.commit()
    db.refresh(tournament)
    return tournament

@router.get("/{tournament_id}", response_model=TournamentResponse)
def get_tournament(tournament_id: int, db: Session = Depends(get_db)):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament
