import { Match, Player, Court, CourtBooking, Tournament } from "../types";
import { localStore } from "./localStore";

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "";

export async function fetchMatches(): Promise<Match[]> {
  try {
    const res = await fetch(`${API_BASE}/api/matches`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, using local storage fallback for matches", err);
  }
  return localStore.getMatches();
}

export async function fetchMatch(id: number): Promise<Match> {
  try {
    const res = await fetch(`${API_BASE}/api/matches/${id}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, using local storage fallback for match", err);
  }
  return localStore.getMatch(id);
}

export async function createMatch(data: Partial<Match>): Promise<Match> {
  try {
    const res = await fetch(`${API_BASE}/api/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, creating match locally", err);
  }
  return localStore.createMatch(data);
}

export async function recordRally(matchId: number, winningTeam: 1 | 2): Promise<Match> {
  try {
    const res = await fetch(`${API_BASE}/api/matches/${matchId}/rally`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winning_team: winningTeam }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, recording rally locally", err);
  }
  return localStore.recordRally(matchId, winningTeam);
}

export async function undoRally(matchId: number): Promise<Match> {
  try {
    const res = await fetch(`${API_BASE}/api/matches/${matchId}/undo`, {
      method: "POST",
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, undoing rally locally", err);
  }
  return localStore.undoRally(matchId);
}

export async function resetMatch(matchId: number): Promise<Match> {
  try {
    const res = await fetch(`${API_BASE}/api/matches/${matchId}/reset`, {
      method: "POST",
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, resetting match locally", err);
  }
  return localStore.resetMatch(matchId);
}

export async function fetchPlayers(): Promise<Player[]> {
  try {
    const res = await fetch(`${API_BASE}/api/players`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, fetching players locally", err);
  }
  return localStore.getPlayers();
}

export async function createPlayer(data: { name: string; rating: number; preferred_side: string }): Promise<Player> {
  try {
    const res = await fetch(`${API_BASE}/api/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, creating player locally", err);
  }
  return localStore.createPlayer(data);
}

export async function fetchCourts(): Promise<Court[]> {
  try {
    const res = await fetch(`${API_BASE}/api/courts`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, fetching courts locally", err);
  }
  return localStore.getCourts();
}

export async function bookCourt(courtId: number, data: { player_name: string; start_time: string; end_time: string; notes?: string }): Promise<CourtBooking> {
  try {
    const res = await fetch(`${API_BASE}/api/courts/${courtId}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, booking court locally", err);
  }
  return localStore.bookCourt(courtId, data);
}

export async function cancelBooking(bookingId: number): Promise<{ message: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/courts/bookings/${bookingId}`, {
      method: "DELETE",
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, cancelling booking locally", err);
  }
  return localStore.cancelBooking(bookingId);
}

export async function fetchTournaments(): Promise<Tournament[]> {
  try {
    const res = await fetch(`${API_BASE}/api/tournaments`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, fetching tournaments locally", err);
  }
  return localStore.getTournaments();
}

export async function createTournament(data: Partial<Tournament>): Promise<Tournament> {
  try {
    const res = await fetch(`${API_BASE}/api/tournaments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.debug("Backend unreachable, creating tournament locally", err);
  }
  return localStore.createTournament(data);
}
