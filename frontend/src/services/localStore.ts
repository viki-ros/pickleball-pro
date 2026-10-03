import { Match, Player, Court, CourtBooking, Tournament } from "../types";

const STORAGE_KEY_PLAYERS = "pickleball_players_v1";
const STORAGE_KEY_COURTS = "pickleball_courts_v1";
const STORAGE_KEY_MATCHES = "pickleball_matches_v1";
const STORAGE_KEY_TOURNAMENTS = "pickleball_tournaments_v1";

const DEFAULT_PLAYERS: Player[] = [
  { id: 1, name: "Ben Johns", rating: 5.9, avatar_color: "#3b82f6", preferred_side: "Left", matches_played: 120, matches_won: 108, created_at: new Date().toISOString() },
  { id: 2, name: "Anna Leigh Waters", rating: 5.95, avatar_color: "#ec4899", preferred_side: "Right", matches_played: 115, matches_won: 110, created_at: new Date().toISOString() },
  { id: 3, name: "Tyson McGuffin", rating: 5.4, avatar_color: "#f59e0b", preferred_side: "Right", matches_played: 98, matches_won: 78, created_at: new Date().toISOString() },
  { id: 4, name: "Catherine Parenteau", rating: 5.5, avatar_color: "#10b981", preferred_side: "Left", matches_played: 102, matches_won: 84, created_at: new Date().toISOString() },
  { id: 5, name: "Collin Johns", rating: 5.6, avatar_color: "#8b5cf6", preferred_side: "Right", matches_played: 90, matches_won: 76, created_at: new Date().toISOString() },
  { id: 6, name: "Lea Jansen", rating: 5.2, avatar_color: "#ef4444", preferred_side: "Left", matches_played: 85, matches_won: 62, created_at: new Date().toISOString() },
];

const DEFAULT_COURTS: Court[] = [
  { id: 1, name: "Center Championship Court", surface_type: "Hardcourt Acrylic", status: "available", has_lights: true, location: "Stadium Center", bookings: [] },
  { id: 2, name: "Court 2 (North Pavilion)", surface_type: "Cushioned Hardcourt", status: "available", has_lights: true, location: "North Pavilion", bookings: [] },
  { id: 3, name: "Court 3 (South Pavilion)", surface_type: "Outdoor Acrylic", status: "available", has_lights: true, location: "South Pavilion", bookings: [] },
  { id: 4, name: "Court 4 (Practice Zone)", surface_type: "Hardcourt", status: "available", has_lights: false, location: "West Wing", bookings: [] },
];

const DEFAULT_MATCH: Match = {
  id: 1,
  title: "PPA Tour Finals: Gold Medal Match",
  match_type: "doubles",
  scoring_mode: "sideout",
  target_points: 11,
  win_by: 2,
  court_id: 1,
  team1_player1_id: 1,
  team1_player2_id: 5,
  team2_player1_id: 2,
  team2_player2_id: 4,
  score_team1: 4,
  score_team2: 3,
  serving_team: 1,
  server_number: 1,
  team1_player1_side: "left",
  team1_player2_side: "right",
  team2_player1_side: "right",
  team2_player2_side: "left",
  is_completed: false,
  score_call: "4 - 3 - 1",
  created_at: new Date().toISOString(),
  team1_player1: DEFAULT_PLAYERS[0],
  team1_player2: DEFAULT_PLAYERS[4],
  team2_player1: DEFAULT_PLAYERS[1],
  team2_player2: DEFAULT_PLAYERS[3],
};

const DEFAULT_TOURNAMENTS: Tournament[] = [
  {
    id: 1,
    name: "2026 National Pickleball Open",
    format: "single_elimination",
    status: "active",
    max_teams: 8,
    prize_pool: "$10,000",
    start_date: "Oct 10, 2026",
    matches: [DEFAULT_MATCH],
    created_at: new Date().toISOString(),
  },
];

// Snapshot history stored in session/local for undo
const matchHistoryStore: Record<number, any[]> = {};

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function computeScoreCall(m: Match): string {
  const s1 = m.serving_team === 1 ? m.score_team1 : m.score_team2;
  const s2 = m.serving_team === 1 ? m.score_team2 : m.score_team1;
  if (m.match_type === "doubles" && m.scoring_mode === "sideout") {
    return `${s1} - ${s2} - ${m.server_number}`;
  }
  return `${s1} - ${s2}`;
}

export const localStore = {
  getPlayers(): Player[] {
    const p = getLocal(STORAGE_KEY_PLAYERS, DEFAULT_PLAYERS);
    if (!p || p.length === 0) {
      setLocal(STORAGE_KEY_PLAYERS, DEFAULT_PLAYERS);
      return DEFAULT_PLAYERS;
    }
    return p;
  },

  createPlayer(data: { name: string; rating: number; preferred_side: string }): Player {
    const players = this.getPlayers();
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];
    const newPlayer: Player = {
      id: Date.now(),
      name: data.name,
      rating: data.rating,
      preferred_side: data.preferred_side,
      avatar_color: colors[players.length % colors.length],
      matches_played: 0,
      matches_won: 0,
      created_at: new Date().toISOString(),
    };
    players.push(newPlayer);
    setLocal(STORAGE_KEY_PLAYERS, players);
    return newPlayer;
  },

  getCourts(): Court[] {
    const c = getLocal(STORAGE_KEY_COURTS, DEFAULT_COURTS);
    if (!c || c.length === 0) {
      setLocal(STORAGE_KEY_COURTS, DEFAULT_COURTS);
      return DEFAULT_COURTS;
    }
    return c;
  },

  bookCourt(courtId: number, data: { player_name: string; start_time: string; end_time: string; notes?: string }): CourtBooking {
    const courts = this.getCourts();
    const court = courts.find(c => c.id === courtId);
    const newBooking: CourtBooking = {
      id: Date.now(),
      court_id: courtId,
      player_name: data.player_name,
      start_time: data.start_time,
      end_time: data.end_time,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };
    if (court) {
      court.bookings.push(newBooking);
      court.status = "occupied";
      setLocal(STORAGE_KEY_COURTS, courts);
    }
    return newBooking;
  },

  cancelBooking(bookingId: number): { message: string } {
    const courts = this.getCourts();
    for (const c of courts) {
      c.bookings = c.bookings.filter(b => b.id !== bookingId);
      if (c.bookings.length === 0) c.status = "available";
    }
    setLocal(STORAGE_KEY_COURTS, courts);
    return { message: "Booking cancelled successfully" };
  },

  getMatches(): Match[] {
    const m = getLocal(STORAGE_KEY_MATCHES, [DEFAULT_MATCH]);
    if (!m || m.length === 0) {
      setLocal(STORAGE_KEY_MATCHES, [DEFAULT_MATCH]);
      return [DEFAULT_MATCH];
    }
    return m;
  },

  getMatch(id: number): Match {
    const matches = this.getMatches();
    const found = matches.find(m => m.id === id);
    if (!found) return DEFAULT_MATCH;
    found.score_call = computeScoreCall(found);
    return found;
  },

  createMatch(data: Partial<Match>): Match {
    const matches = this.getMatches();
    const players = this.getPlayers();
    const newMatch: Match = {
      id: Date.now(),
      title: data.title || "Pickleball Match",
      match_type: data.match_type || "doubles",
      scoring_mode: data.scoring_mode || "sideout",
      target_points: data.target_points || 11,
      win_by: data.win_by || 2,
      court_id: data.court_id,
      tournament_id: data.tournament_id,
      team1_player1_id: data.team1_player1_id,
      team1_player2_id: data.team1_player2_id,
      team2_player1_id: data.team2_player1_id,
      team2_player2_id: data.team2_player2_id,
      score_team1: 0,
      score_team2: 0,
      serving_team: 1,
      server_number: data.match_type === "singles" ? 1 : 2,
      team1_player1_side: "right",
      team1_player2_side: "left",
      team2_player1_side: "right",
      team2_player2_side: "left",
      is_completed: false,
      created_at: new Date().toISOString(),
      team1_player1: players.find(p => p.id === data.team1_player1_id),
      team1_player2: players.find(p => p.id === data.team1_player2_id),
      team2_player1: players.find(p => p.id === data.team2_player1_id),
      team2_player2: players.find(p => p.id === data.team2_player2_id),
    };
    newMatch.score_call = computeScoreCall(newMatch);
    matches.unshift(newMatch);
    setLocal(STORAGE_KEY_MATCHES, matches);
    return newMatch;
  },

  recordRally(matchId: number, winningTeam: 1 | 2): Match {
    const matches = this.getMatches();
    const match = matches.find(m => m.id === matchId) || matches[0];
    if (!match || match.is_completed) return match;

    // Snapshot for undo
    if (!matchHistoryStore[match.id]) matchHistoryStore[match.id] = [];
    matchHistoryStore[match.id].push(JSON.parse(JSON.stringify(match)));

    const isServingTeam = winningTeam === match.serving_team;
    const mode = match.scoring_mode;
    const isDoubles = match.match_type === "doubles";

    if (mode === "sideout") {
      if (isServingTeam) {
        if (match.serving_team === 1) match.score_team1 += 1;
        else match.score_team2 += 1;

        if (isDoubles) {
          if (match.serving_team === 1) {
            match.team1_player1_side = match.team1_player1_side === "right" ? "left" : "right";
            match.team1_player2_side = match.team1_player2_side === "right" ? "left" : "right";
          } else {
            match.team2_player1_side = match.team2_player1_side === "right" ? "left" : "right";
            match.team2_player2_side = match.team2_player2_side === "right" ? "left" : "right";
          }
        } else {
          const score = match.serving_team === 1 ? match.score_team1 : match.score_team2;
          const side = score % 2 === 0 ? "right" : "left";
          if (match.serving_team === 1) match.team1_player1_side = side;
          else match.team2_player1_side = side;
        }
      } else {
        // Fault
        if (isDoubles) {
          if (match.server_number === 1) {
            match.server_number = 2;
          } else {
            match.serving_team = match.serving_team === 1 ? 2 : 1;
            match.server_number = 1;
          }
        } else {
          match.serving_team = match.serving_team === 1 ? 2 : 1;
          match.server_number = 1;
          const oppScore = match.serving_team === 1 ? match.score_team1 : match.score_team2;
          const side = oppScore % 2 === 0 ? "right" : "left";
          if (match.serving_team === 1) match.team1_player1_side = side;
          else match.team2_player1_side = side;
        }
      }
    } else {
      // Rally scoring
      if (winningTeam === 1) match.score_team1 += 1;
      else match.score_team2 += 1;

      if (isServingTeam) {
        if (isDoubles) {
          if (match.serving_team === 1) {
            match.team1_player1_side = match.team1_player1_side === "right" ? "left" : "right";
            match.team1_player2_side = match.team1_player2_side === "right" ? "left" : "right";
          } else {
            match.team2_player1_side = match.team2_player1_side === "right" ? "left" : "right";
            match.team2_player2_side = match.team2_player2_side === "right" ? "left" : "right";
          }
        }
      } else {
        match.serving_team = winningTeam;
        match.server_number = 1;
      }
    }

    // Win check
    const s1 = match.score_team1;
    const s2 = match.score_team2;
    if (s1 >= match.target_points && s1 - s2 >= match.win_by) {
      match.is_completed = true;
      match.winner_team = 1;
      match.finished_at = new Date().toISOString();
    } else if (s2 >= match.target_points && s2 - s1 >= match.win_by) {
      match.is_completed = true;
      match.winner_team = 2;
      match.finished_at = new Date().toISOString();
    }

    match.score_call = computeScoreCall(match);
    setLocal(STORAGE_KEY_MATCHES, matches);
    return match;
  },

  undoRally(matchId: number): Match {
    const history = matchHistoryStore[matchId];
    if (!history || history.length === 0) return this.getMatch(matchId);
    const prev = history.pop();
    const matches = this.getMatches();
    const idx = matches.findIndex(m => m.id === matchId);
    if (idx !== -1 && prev) {
      matches[idx] = prev;
      matches[idx].score_call = computeScoreCall(matches[idx]);
      setLocal(STORAGE_KEY_MATCHES, matches);
      return matches[idx];
    }
    return this.getMatch(matchId);
  },

  resetMatch(matchId: number): Match {
    const matches = this.getMatches();
    const match = matches.find(m => m.id === matchId);
    if (match) {
      match.score_team1 = 0;
      match.score_team2 = 0;
      match.serving_team = 1;
      match.server_number = match.match_type === "singles" ? 1 : 2;
      match.is_completed = false;
      match.winner_team = undefined;
      match.finished_at = undefined;
      match.score_call = computeScoreCall(match);
      setLocal(STORAGE_KEY_MATCHES, matches);
      matchHistoryStore[matchId] = [];
      return match;
    }
    return this.getMatch(matchId);
  },

  getTournaments(): Tournament[] {
    const t = getLocal(STORAGE_KEY_TOURNAMENTS, DEFAULT_TOURNAMENTS);
    if (!t || t.length === 0) {
      setLocal(STORAGE_KEY_TOURNAMENTS, DEFAULT_TOURNAMENTS);
      return DEFAULT_TOURNAMENTS;
    }
    return t;
  },

  createTournament(data: Partial<Tournament>): Tournament {
    const tournaments = this.getTournaments();
    const newTourn: Tournament = {
      id: Date.now(),
      name: data.name || "Pickleball Championship",
      format: data.format || "single_elimination",
      status: "active",
      max_teams: data.max_teams || 8,
      prize_pool: data.prize_pool || "$2,500",
      start_date: data.start_date || new Date().toLocaleDateString(),
      matches: [],
      created_at: new Date().toISOString(),
    };
    tournaments.unshift(newTourn);
    setLocal(STORAGE_KEY_TOURNAMENTS, tournaments);
    return newTourn;
  },
};
