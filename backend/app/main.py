from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import Player, Court, Match, Tournament
from .routers import players, courts, matches, tournaments, friends

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pickleball Match Tracker & Tournament Manager",
    description="Full-stack API supporting authentic side-out and rally scoring, player stats, court booking, and tournament brackets.",
    version="1.0.0"
)

# Enable CORS for local development and mobile web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(friends.router)
app.include_router(players.router)
app.include_router(courts.router)
app.include_router(matches.router)
app.include_router(tournaments.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Pickleball Pro", "version": "1.0.0"}

@app.on_event("startup")
def seed_initial_data():
    """Seeds initial courts, demo players, and an active match if the database is empty."""
    db = SessionLocal()
    try:
        # 1. Seed Courts
        if db.query(Court).count() == 0:
            demo_courts = [
                Court(name="Center Championship Court", surface_type="Hardcourt Acrylic", status="available", has_lights=True, location="Stadium Center"),
                Court(name="Court 2 (North Pavilion)", surface_type="Cushioned Hardcourt", status="available", has_lights=True, location="North Pavilion"),
                Court(name="Court 3 (South Pavilion)", surface_type="Outdoor Acrylic", status="available", has_lights=True, location="South Pavilion"),
                Court(name="Court 4 (Practice Zone)", surface_type="Hardcourt", status="available", has_lights=False, location="West Wing"),
            ]
            db.add_all(demo_courts)
            db.commit()

        # 2. Seed Players
        if db.query(Player).count() == 0:
            demo_players = [
                Player(name="Ben Johns", rating=5.9, avatar_color="#3b82f6", preferred_side="Left", matches_played=120, matches_won=108),
                Player(name="Anna Leigh Waters", rating=5.95, avatar_color="#ec4899", preferred_side="Right", matches_played=115, matches_won=110),
                Player(name="Tyson McGuffin", rating=5.4, avatar_color="#f59e0b", preferred_side="Right", matches_played=98, matches_won=78),
                Player(name="Catherine Parenteau", rating=5.5, avatar_color="#10b981", preferred_side="Left", matches_played=102, matches_won=84),
                Player(name="Collin Johns", rating=5.6, avatar_color="#8b5cf6", preferred_side="Right", matches_played=90, matches_won=76),
                Player(name="Lea Jansen", rating=5.2, avatar_color="#ef4444", preferred_side="Left", matches_played=85, matches_won=62),
            ]
            db.add_all(demo_players)
            db.commit()

        # 3. Seed an active Championship Match
        if db.query(Match).count() == 0:
            p_list = db.query(Player).all()
            c_center = db.query(Court).filter(Court.name.like("%Center%")).first()

            sample_match = Match(
                title="PPA Tour Finals: Gold Medal Match",
                match_type="doubles",
                scoring_mode="sideout",
                target_points=11,
                win_by=2,
                court_id=c_center.id if c_center else 1,
                team1_player1_id=p_list[0].id,
                team1_player2_id=p_list[4].id,
                team2_player1_id=p_list[1].id,
                team2_player2_id=p_list[3].id,
                score_team1=4,
                score_team2=3,
                serving_team=1,
                server_number=1,
                team1_player1_side="left",
                team1_player2_side="right",
                team2_player1_side="right",
                team2_player2_side="left",
                is_completed=False,
                history="[]"
            )
            db.add(sample_match)

            # Seed a sample tournament
            sample_tourn = Tournament(
                name="2026 National Pickleball Open",
                format="single_elimination",
                status="active",
                max_teams=8,
                prize_pool="$10,000",
                start_date="Oct 10, 2026"
            )
            db.add(sample_tourn)
            db.commit()

    finally:
        db.close()

from pathlib import Path
from fastapi.staticfiles import StaticFiles

dist_path = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if dist_path.exists():
    app.mount("/", StaticFiles(directory=str(dist_path), html=True), name="static")

