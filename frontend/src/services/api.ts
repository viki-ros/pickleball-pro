import { Match, Player, Court, CourtBooking, Tournament } from "../types";

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "";

export async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(`${API_BASE}/api/matches`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

export async function fetchMatch(id: number): Promise<Match> {
  const res = await fetch(`${API_BASE}/api/matches/${id}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  return res.json();
}

export async function createMatch(data: Partial<Match>): Promise<Match> {
  const res = await fetch(`${API_BASE}/api/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create match");
  return res.json();
}

export async function recordRally(matchId: number, winningTeam: 1 | 2): Promise<Match> {
  const res = await fetch(`${API_BASE}/api/matches/${matchId}/rally`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ winning_team: winningTeam }),
  });
  if (!res.ok) throw new Error("Failed to record rally");
  return res.json();
}

export async function undoRally(matchId: number): Promise<Match> {
  const res = await fetch(`${API_BASE}/api/matches/${matchId}/undo`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to undo rally");
  return res.json();
}

export async function resetMatch(matchId: number): Promise<Match> {
  const res = await fetch(`${API_BASE}/api/matches/${matchId}/reset`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reset match");
  return res.json();
}

export async function fetchPlayers(): Promise<Player[]> {
  const res = await fetch(`${API_BASE}/api/players`);
  if (!res.ok) throw new Error("Failed to fetch players");
  return res.json();
}

export async function createPlayer(data: { name: string; rating: number; preferred_side: string }): Promise<Player> {
  const res = await fetch(`${API_BASE}/api/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create player");
  return res.json();
}

export async function fetchCourts(): Promise<Court[]> {
  const res = await fetch(`${API_BASE}/api/courts`);
  if (!res.ok) throw new Error("Failed to fetch courts");
  return res.json();
}

export async function bookCourt(courtId: number, data: { player_name: string; start_time: string; end_time: string; notes?: string }): Promise<CourtBooking> {
  const res = await fetch(`${API_BASE}/api/courts/${courtId}/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to book court");
  return res.json();
}

export async function cancelBooking(bookingId: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/courts/bookings/${bookingId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to cancel booking");
  return res.json();
}

export async function fetchTournaments(): Promise<Tournament[]> {
  const res = await fetch(`${API_BASE}/api/tournaments`);
  if (!res.ok) throw new Error("Failed to fetch tournaments");
  return res.json();
}

export async function createTournament(data: Partial<Tournament>): Promise<Tournament> {
  const res = await fetch(`${API_BASE}/api/tournaments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create tournament");
  return res.json();
}
