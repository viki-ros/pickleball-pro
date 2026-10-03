import React, { useState } from "react";
import { Calendar, Clock, MapPin, Zap, CheckCircle, XCircle } from "lucide-react";
import { Court } from "../types";
import { bookCourt, cancelBooking } from "../services/api";

interface CourtBookingGridProps {
  courts: Court[];
  onRefresh: () => void;
}

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
];

export const CourtBookingGrid: React.FC<CourtBookingGridProps> = ({ courts, onRefresh }) => {
  const [selectedCourtId, setSelectedCourtId] = useState<number>(courts[0]?.id || 1);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const activeCourt = courts.find((c) => c.id === selectedCourtId) || courts[0];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingSlot || !playerName.trim()) return;
    try {
      setLoading(true);
      const slotIndex = TIME_SLOTS.indexOf(bookingSlot);
      const endTime = slotIndex < TIME_SLOTS.length - 1 ? TIME_SLOTS[slotIndex + 1] : "10:00 PM";
      await bookCourt(selectedCourtId, {
        player_name: playerName,
        start_time: bookingSlot,
        end_time: endTime,
        notes: bookingNotes || "Match Booking",
      });
      setBookingSlot(null);
      setPlayerName("");
      setBookingNotes("");
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm("Cancel this court reservation?")) return;
    try {
      await cancelBooking(bookingId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Court Schedule & Booking</h2>
            <p className="text-xs text-slate-400">
              Real-time court availability, surface conditions & lights
            </p>
          </div>
        </div>

        {/* Court Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {courts.map((court) => (
            <button
              key={court.id}
              onClick={() => setSelectedCourtId(court.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCourtId === court.id
                  ? "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              {court.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Court Details */}
      {activeCourt && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{activeCourt.name}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {activeCourt.location}
                </span>
                <span>• {activeCourt.surface_type}</span>
                {activeCourt.has_lights && (
                  <span className="flex items-center gap-1 text-amber-300">
                    <Zap className="w-3.5 h-3.5" /> Night Lights Equipped
                  </span>
                )}
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Schedule
            </span>
          </div>

          {/* Time Slot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {TIME_SLOTS.map((slot) => {
              const booking = activeCourt.bookings?.find((b) => b.start_time === slot);
              const isBooked = !!booking;

              return (
                <div
                  key={slot}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isBooked
                      ? "bg-rose-950/20 border-rose-900/40 text-slate-300"
                      : "bg-slate-950/60 border-slate-800 hover:border-teal-500/50 cursor-pointer"
                  }`}
                  onClick={() => !isBooked && setBookingSlot(slot)}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold flex items-center gap-1 text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {slot}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isBooked ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {isBooked ? "RESERVED" : "AVAILABLE"}
                    </span>
                  </div>

                  {isBooked ? (
                    <div className="mt-1 flex items-center justify-between">
                      <div className="truncate pr-1">
                        <span className="text-xs font-bold text-white block truncate">
                          {booking.player_name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {booking.notes || "Match booked"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelBooking(booking.id);
                        }}
                        title="Cancel reservation"
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 text-right">
                      <span className="text-[11px] font-bold text-teal-400 hover:underline">
                        + Reserve Court
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              Reserve {activeCourt?.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Time Slot: {bookingSlot} (1 Hour Match Block)
            </p>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Player / Team Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ben Johns"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Match Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Doubles practice, DUPR rated"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setBookingSlot(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold rounded-lg shadow-md"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
