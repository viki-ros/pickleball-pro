from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Court, CourtBooking
from ..schemas import CourtCreate, CourtResponse, CourtBookingCreate, CourtBookingResponse

router = APIRouter(prefix="/api/courts", tags=["Courts"])

@router.get("", response_model=List[CourtResponse])
def list_courts(db: Session = Depends(get_db)):
    return db.query(Court).all()

@router.post("", response_model=CourtResponse)
def create_court(court_in: CourtCreate, db: Session = Depends(get_db)):
    court = Court(**court_in.model_dump())
    db.add(court)
    db.commit()
    db.refresh(court)
    return court

@router.post("/{court_id}/book", response_model=CourtBookingResponse)
def book_court(court_id: int, booking_in: CourtBookingCreate, db: Session = Depends(get_db)):
    court = db.query(Court).filter(Court.id == court_id).first()
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")
    
    booking = CourtBooking(
        court_id=court_id,
        player_name=booking_in.player_name,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time,
        notes=booking_in.notes or ""
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

@router.delete("/bookings/{booking_id}")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(CourtBooking).filter(CourtBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.delete(booking)
    db.commit()
    return {"message": "Booking cancelled successfully"}
