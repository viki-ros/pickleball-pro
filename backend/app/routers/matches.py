from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Match, Player
from ..schemas import MatchCreate, MatchResponse, RallyEvent
from ..scoring_engine import process_rally, undo_last_rally, get_score_call

router = APIRouter(prefix="/api/matches", tags=["Matches"])

def format_match_response(match: Match) -> dict:
    data = {
        "id": match.id,
        "title": match.title,
        "match_type": match.match_type,
        "scoring_mode": match.scoring_mode,
        "target_points": match.target_points,
        "win_by": match.win_by,
        "court_id": match.court_id,
        "tournament_id": match.tournament_id,
        "score_team1": match.score_team1,
        "score_team2": match.score_team2,
        "serving_team": match.serving_team,
        "server_number": match.server_number,
        "team1_player1_side": match.team1_player1_side,
        "team1_player2_side": match.team1_player2_side,
        "team2_player1_side": match.team2_player1_side,
        "team2_player2_side": match.team2_player2_side,
        "is_completed": match.is_completed,
        "winner_team": match.winner_team,
        "score_call": get_score_call(match),
        "created_at": match.created_at,
        "finished_at": match.finished_at,
        "team1_player1": match.team1_player1,
        "team1_player2": match.team1_player2,
        "team2_player1": match.team2_player1,
        "team2_player2": match.team2_player2,
    }
    return data

@router.get("", response_model=List[MatchResponse])
def list_matches(db: Session = Depends(get_db)):
    matches = db.query(Match).order_by(Match.created_at.desc()).limit(25).all()
    return [format_match_response(m) for m in matches]

@router.post("", response_model=MatchResponse)
def create_match(match_in: MatchCreate, db: Session = Depends(get_db)):
    # Initial pickleball setup:
    # In Doubles sideout, the first server is "Server 2" so initial score call is "0-0-2".
    server_num = 2 if (match_in.match_type.lower() == "doubles" and match_in.scoring_mode.lower() == "sideout") else 1

    match = Match(
        title=match_in.title,
        match_type=match_in.match_type,
        scoring_mode=match_in.scoring_mode,
        target_points=match_in.target_points,
        win_by=match_in.win_by,
        court_id=match_in.court_id,
        tournament_id=match_in.tournament_id,
        team1_player1_id=match_in.team1_player1_id,
        team1_player2_id=match_in.team1_player2_id,
        team2_player1_id=match_in.team2_player1_id,
        team2_player2_id=match_in.team2_player2_id,
        score_team1=0,
        score_team2=0,
        serving_team=1,
        server_number=server_num,
        team1_player1_side="right",
        team1_player2_side="left",
        team2_player1_side="right",
        team2_player2_side="left",
        is_completed=False,
        history="[]"
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return format_match_response(match)

@router.get("/{match_id}", response_model=MatchResponse)
def get_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return format_match_response(match)

@router.post("/{match_id}/rally", response_model=MatchResponse)
def record_rally(match_id: int, rally: RallyEvent, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match.is_completed:
        raise HTTPException(status_code=400, detail="Match is already completed")

    process_rally(match, rally.winning_team)

    # If completed, update player win/loss records
    if match.is_completed and match.winner_team:
        t1_players = [match.team1_player1, match.team1_player2]
        t2_players = [match.team2_player1, match.team2_player2]

        for p in t1_players:
            if p:
                p.matches_played += 1
                if match.winner_team == 1:
                    p.matches_won += 1
        for p in t2_players:
            if p:
                p.matches_played += 1
                if match.winner_team == 2:
                    p.matches_won += 1

    db.commit()
    db.refresh(match)
    return format_match_response(match)

@router.post("/{match_id}/undo", response_model=MatchResponse)
def undo_rally(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    success = undo_last_rally(match)
    if not success:
        raise HTTPException(status_code=400, detail="No previous rally to undo")

    db.commit()
    db.refresh(match)
    return format_match_response(match)

@router.post("/{match_id}/reset", response_model=MatchResponse)
def reset_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match.score_team1 = 0
    match.score_team2 = 0
    match.serving_team = 1
    match.server_number = 2 if (match.match_type.lower() == "doubles" and match.scoring_mode.lower() == "sideout") else 1
    match.team1_player1_side = "right"
    match.team1_player2_side = "left"
    match.team2_player1_side = "right"
    match.team2_player2_side = "left"
    match.is_completed = False
    match.winner_team = None
    match.finished_at = None
    match.history = "[]"

    db.commit()
    db.refresh(match)
    return format_match_response(match)

@router.delete("/{match_id}")
def delete_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    db.delete(match)
    db.commit()
    return {"message": "Match deleted successfully"}
