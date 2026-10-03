from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Friend, Match

router = APIRouter(tags=["Friends & Users"])

class RegisterRequest(BaseModel):
    name: str
    phone: str

class FriendCreate(BaseModel):
    user_phone: str
    name: str
    phone: str
    skill_level: Optional[str] = "Casual"

@router.post("/api/register")
def register_or_get_user(req: RegisterRequest, db: Session = Depends(get_db)):
    clean_phone = req.phone.strip()
    clean_name = req.name.strip()
    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user:
        user = User(name=clean_name, phone=clean_phone)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.name = clean_name
        db.commit()
        db.refresh(user)
    return {
        "id": str(user.id),
        "name": user.name,
        "phone": user.phone,
        "avatar_color": user.avatar_color,
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
