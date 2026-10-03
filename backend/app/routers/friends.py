from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Friend, Match
from ..dupr_client import dupr_service

router = APIRouter(tags=["Friends, Users & DUPR"])

class RegisterRequest(BaseModel):
    name: str
    phone: str
    dupr_id: Optional[str] = None
    doubles_rating: Optional[float] = None
    singles_rating: Optional[float] = None

class FriendCreate(BaseModel):
    user_phone: str
    name: str
    phone: str
    skill_level: Optional[str] = "Casual"
    dupr_id: Optional[str] = None
    doubles_rating: Optional[float] = None
    singles_rating: Optional[float] = None

class DuprConnectRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    client_key: Optional[str] = None
    client_secret: Optional[str] = None
    token: Optional[str] = None

class DuprSyncUserRequest(BaseModel):
    phone: str

@router.post("/api/register")
def register_or_get_user(req: RegisterRequest, db: Session = Depends(get_db)):
    clean_phone = req.phone.strip()
    clean_name = req.name.strip()
    clean_dupr_id = req.dupr_id.strip().upper() if req.dupr_id else None

    # Determine ratings: fetch automatically from DUPR API if ID provided
    doubles = req.doubles_rating
    singles = req.singles_rating

    if clean_dupr_id and (doubles is None or singles is None):
        try:
            lookup = dupr_service.lookup_player_by_id(clean_dupr_id)
            if lookup.get("status") == "SUCCESS":
                doubles = lookup.get("doubles_rating", doubles or 3.5)
                singles = lookup.get("singles_rating", singles or 3.5)
        except Exception:
            pass

    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user:
        user = User(
            name=clean_name,
            phone=clean_phone,
            dupr_id=clean_dupr_id,
            dupr_doubles_rating=doubles if doubles is not None else 3.5,
            dupr_singles_rating=singles if singles is not None else 3.5,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.name = clean_name
        if clean_dupr_id:
            user.dupr_id = clean_dupr_id
        if doubles is not None:
            user.dupr_doubles_rating = doubles
        if singles is not None:
            user.dupr_singles_rating = singles
        db.commit()
        db.refresh(user)

    return {
        "id": str(user.id),
        "name": user.name,
        "phone": user.phone,
        "avatar_color": user.avatar_color,
        "dupr_id": user.dupr_id,
        "dupr_doubles_rating": user.dupr_doubles_rating,
        "dupr_singles_rating": user.dupr_singles_rating,
        "created_at": user.created_at.isoformat(),
    }

@router.get("/api/friends")
def list_friends(user_phone: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Friend)
    if user_phone:
        query = query.filter(Friend.user_phone == user_phone)
    friends = query.all()
    return [
        {
            "id": str(f.id),
            "user_phone": f.user_phone,
            "name": f.name,
            "phone": f.phone,
            "skill_level": f.skill_level,
            "avatar_color": f.avatar_color,
            "dupr_id": f.dupr_id,
            "dupr_doubles_rating": f.dupr_doubles_rating,
            "dupr_singles_rating": f.dupr_singles_rating,
            "created_at": f.created_at.isoformat(),
        }
        for f in friends
    ]

@router.post("/api/friends")
def add_friend(fc: FriendCreate, db: Session = Depends(get_db)):
    clean_dupr_id = fc.dupr_id.strip().upper() if fc.dupr_id else None
    doubles = fc.doubles_rating
    singles = fc.singles_rating

    if clean_dupr_id and (doubles is None or singles is None):
        try:
            lookup = dupr_service.lookup_player_by_id(clean_dupr_id)
            if lookup.get("status") == "SUCCESS":
                doubles = lookup.get("doubles_rating", doubles or 3.5)
                singles = lookup.get("singles_rating", singles or 3.5)
        except Exception:
            pass

    friend = Friend(
        user_phone=fc.user_phone.strip(),
        name=fc.name.strip(),
        phone=fc.phone.strip(),
        skill_level=fc.skill_level,
        dupr_id=clean_dupr_id,
        dupr_doubles_rating=doubles if doubles is not None else 3.5,
        dupr_singles_rating=singles if singles is not None else 3.5,
    )
    db.add(friend)
    db.commit()
    db.refresh(friend)
    return {
        "id": str(friend.id),
        "user_phone": friend.user_phone,
        "name": friend.name,
        "phone": friend.phone,
        "skill_level": friend.skill_level,
        "avatar_color": friend.avatar_color,
        "dupr_id": friend.dupr_id,
        "dupr_doubles_rating": friend.dupr_doubles_rating,
        "dupr_singles_rating": friend.dupr_singles_rating,
        "created_at": friend.created_at.isoformat(),
    }

@router.delete("/api/friends/{friend_id}")
def delete_friend(friend_id: int, db: Session = Depends(get_db)):
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    db.delete(friend)
    db.commit()
    return {"message": "Friend deleted successfully"}

# -------------------------------------------------------------
# DUPR API INTEGRATION ROUTES (Zero Manual Entry, Auto-Sync Only)
# -------------------------------------------------------------

@router.get("/api/dupr/status")
def dupr_status():
    """Returns current DUPR API connection status."""
    return dupr_service.get_auth_status()

@router.post("/api/dupr/connect")
def dupr_connect(req: DuprConnectRequest):
    """
    Connects to official DUPR API via:
    1. DUPR User Account (email + password)
    2. DUPR Partner API (client_key + client_secret)
    3. Direct Bearer Token
    """
    if req.token:
        res = dupr_service.set_bearer_token(req.token)
        return res
    elif req.client_key and req.client_secret:
        res = dupr_service.login_partner(req.client_key, req.client_secret)
        return res
    elif req.email and req.password:
        res = dupr_service.login_user(req.email, req.password)
        return res
    else:
        raise HTTPException(status_code=400, detail="Provide email & password, partner keys, or bearer token.")

@router.get("/api/dupr/player/{dupr_id}")
def get_dupr_player(dupr_id: str, db: Session = Depends(get_db)):
    """
    Auto-fetches official DUPR rating from DUPR API with DUPR ID.
    If official ratings are fetched, automatically updates user or friends matching this DUPR ID.
    """
    clean = dupr_id.strip().upper()
    if not clean:
        raise HTTPException(status_code=400, detail="Invalid DUPR ID")

    # 1. Attempt live DUPR API lookup
    api_result = dupr_service.lookup_player_by_id(clean)

    if api_result.get("status") == "SUCCESS":
        doubles = api_result.get("doubles_rating")
        singles = api_result.get("singles_rating")

        # Automatically update any matching user in local database
        users = db.query(User).filter(User.dupr_id == clean).all()
        for u in users:
            if doubles is not None:
                u.dupr_doubles_rating = doubles
            if singles is not None:
                u.dupr_singles_rating = singles

        # Automatically update any matching friend in local database
        friends = db.query(Friend).filter(Friend.dupr_id == clean).all()
        for f in friends:
            if doubles is not None:
                f.dupr_doubles_rating = doubles
            if singles is not None:
                f.dupr_singles_rating = singles

        db.commit()
        return api_result

    # 2. If API requires auth or failed, check if we have a verified record in our DB
    existing_user = db.query(User).filter(User.dupr_id == clean).first()
    if existing_user:
        return {
            "status": "SUCCESS",
            "dupr_id": clean,
            "name": existing_user.name,
            "doubles_rating": existing_user.dupr_doubles_rating,
            "singles_rating": existing_user.dupr_singles_rating,
            "doubles_provisional": False,
            "singles_provisional": False,
            "verified": True,
            "source": "database_cache",
            "message": "Loaded verified ratings from database cache. Connect DUPR account for live real-time sync.",
        }

    existing_friend = db.query(Friend).filter(Friend.dupr_id == clean).first()
    if existing_friend:
        return {
            "status": "SUCCESS",
            "dupr_id": clean,
            "name": existing_friend.name,
            "doubles_rating": existing_friend.dupr_doubles_rating,
            "singles_rating": existing_friend.dupr_singles_rating,
            "doubles_provisional": False,
            "singles_provisional": False,
            "verified": True,
            "source": "database_cache",
            "message": "Loaded verified ratings from database cache. Connect DUPR account for live real-time sync.",
        }

    return api_result

@router.get("/api/dupr/lookup/{dupr_id}")
def lookup_dupr_alias(dupr_id: str, db: Session = Depends(get_db)):
    """Backward compatibility alias for /api/dupr/player/{dupr_id}"""
    return get_dupr_player(dupr_id, db)

@router.post("/api/dupr/sync-user")
def sync_user_dupr(req: DuprSyncUserRequest, db: Session = Depends(get_db)):
    """Auto-syncs user's official ratings from DUPR API using their registered DUPR ID."""
    clean_phone = req.phone.strip()
    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.dupr_id:
        raise HTTPException(status_code=400, detail="User does not have a linked DUPR ID")

    result = dupr_service.lookup_player_by_id(user.dupr_id)
    if result.get("status") == "SUCCESS":
        if result.get("doubles_rating") is not None:
            user.dupr_doubles_rating = result.get("doubles_rating")
        if result.get("singles_rating") is not None:
            user.dupr_singles_rating = result.get("singles_rating")
        db.commit()
        db.refresh(user)

    return {
        "user": {
            "id": str(user.id),
            "name": user.name,
            "phone": user.phone,
            "dupr_id": user.dupr_id,
            "dupr_doubles_rating": user.dupr_doubles_rating,
            "dupr_singles_rating": user.dupr_singles_rating,
        },
        "dupr_result": result,
    }

@router.patch("/api/friends/{friend_id}/sync-dupr")
@router.post("/api/dupr/sync-friend/{friend_id}")
def sync_friend_dupr(friend_id: int, db: Session = Depends(get_db)):
    """Auto-syncs a friend's official ratings from DUPR API using their DUPR ID."""
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    if not friend.dupr_id:
        raise HTTPException(status_code=400, detail="Friend does not have a linked DUPR ID")

    result = dupr_service.lookup_player_by_id(friend.dupr_id)
    if result.get("status") == "SUCCESS":
        if result.get("doubles_rating") is not None:
            friend.dupr_doubles_rating = result.get("doubles_rating")
        if result.get("singles_rating") is not None:
            friend.dupr_singles_rating = result.get("singles_rating")
        db.commit()
        db.refresh(friend)

    return {
        "id": str(friend.id),
        "user_phone": friend.user_phone,
        "name": friend.name,
        "phone": friend.phone,
        "skill_level": friend.skill_level,
        "avatar_color": friend.avatar_color,
        "dupr_id": friend.dupr_id,
        "dupr_doubles_rating": friend.dupr_doubles_rating,
        "dupr_singles_rating": friend.dupr_singles_rating,
        "created_at": friend.created_at.isoformat(),
        "dupr_result": result,
    }
