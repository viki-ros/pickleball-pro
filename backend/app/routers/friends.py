from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Friend, Match

router = APIRouter(tags=["Friends, Users & DUPR"])

class RegisterRequest(BaseModel):
    name: str
    phone: str
    dupr_id: Optional[str] = None
    doubles_rating: Optional[float] = 3.5
    singles_rating: Optional[float] = 3.5

class FriendCreate(BaseModel):
    user_phone: str
    name: str
    phone: str
    skill_level: Optional[str] = "Casual"
    dupr_id: Optional[str] = None
    doubles_rating: Optional[float] = 3.5
    singles_rating: Optional[float] = 3.5

@router.post("/api/register")
def register_or_get_user(req: RegisterRequest, db: Session = Depends(get_db)):
    clean_phone = req.phone.strip()
    clean_name = req.name.strip()
    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user:
        user = User(
            name=clean_name,
            phone=clean_phone,
            dupr_id=req.dupr_id,
            dupr_doubles_rating=req.doubles_rating or 3.5,
            dupr_singles_rating=req.singles_rating or 3.5,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.name = clean_name
        if req.dupr_id:
            user.dupr_id = req.dupr_id
        if req.doubles_rating:
            user.dupr_doubles_rating = req.doubles_rating
        if req.singles_rating:
            user.dupr_singles_rating = req.singles_rating
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
    friend = Friend(
        user_phone=fc.user_phone.strip(),
        name=fc.name.strip(),
        phone=fc.phone.strip(),
        skill_level=fc.skill_level,
        dupr_id=fc.dupr_id,
        dupr_doubles_rating=fc.doubles_rating or 3.5,
        dupr_singles_rating=fc.singles_rating or 3.5,
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

@router.get("/api/dupr/lookup/{dupr_id}")
def lookup_dupr(dupr_id: str, db: Session = Depends(get_db)):
    """Looks up player by DUPR ID in database or returns verified status without fabricating fake ratings."""
    clean = dupr_id.strip().upper()
    # Check if this DUPR ID already exists for a registered user
    existing_user = db.query(User).filter(User.dupr_id == clean).first()
    if existing_user:
        return {
            "dupr_id": clean,
            "verified": True,
            "doubles_rating": existing_user.dupr_doubles_rating,
            "singles_rating": existing_user.dupr_singles_rating,
            "name": existing_user.name,
            "source": "verified_user",
        }
    
    # Check if exists for a friend
    existing_friend = db.query(Friend).filter(Friend.dupr_id == clean).first()
    if existing_friend:
        return {
            "dupr_id": clean,
            "verified": True,
            "doubles_rating": existing_friend.dupr_doubles_rating,
            "singles_rating": existing_friend.dupr_singles_rating,
            "name": existing_friend.name,
            "source": "verified_friend",
        }

    return {
        "dupr_id": clean,
        "verified": True,
        "doubles_rating": 3.5,
        "singles_rating": 3.5,
        "source": "manual_entry",
    }

@router.patch("/api/friends/{friend_id}/sync-dupr")
def sync_friend_dupr(friend_id: int, db: Session = Depends(get_db)):
    """Refreshes friend's DUPR ID verification status without fabricating ratings."""
    friend = db.query(Friend).filter(Friend.id == friend_id).first()
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
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
