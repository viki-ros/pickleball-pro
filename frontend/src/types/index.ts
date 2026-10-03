export interface Player {
  id: number;
  name: string;
  email?: string;
  rating: number; // DUPR rating (e.g. 3.5, 4.5)
  avatar_color: string;
  preferred_side: string;
  matches_played: number;
  matches_won: number;
  created_at: string;
}

export interface CourtBooking {
  id: number;
  court_id: number;
  player_name: string;
  start_time: string;
  end_time: string;
  match_id?: number;
  notes?: string;
  created_at: string;
}

export interface Court {
  id: number;
  name: string;
  surface_type: string;
  status: "available" | "occupied" | "maintenance";
  has_lights: boolean;
  location: string;
  bookings: CourtBooking[];
}

export interface Match {
  id: number;
  title: string;
  match_type: "singles" | "doubles";
  scoring_mode: "sideout" | "rally";
  target_points: number;
  win_by: number;
  court_id?: number;
  tournament_id?: number;
  team1_player1_id?: number;
  team1_player2_id?: number;
  team2_player1_id?: number;
  team2_player2_id?: number;
  score_team1: number;
  score_team2: number;
  serving_team: 1 | 2;
  server_number: 1 | 2;
  team1_player1_side: "right" | "left";
  team1_player2_side: "right" | "left";
  team2_player1_side: "right" | "left";
  team2_player2_side: "right" | "left";
  is_completed: boolean;
  winner_team?: 1 | 2;
  score_call?: string;
  created_at: string;
  finished_at?: string;
  team1_player1?: Player;
  team1_player2?: Player;
  team2_player1?: Player;
  team2_player2?: Player;
}

export interface Tournament {
  id: number;
  name: string;
  format: "single_elimination" | "round_robin";
  status: "upcoming" | "active" | "completed";
  max_teams: number;
  prize_pool?: string;
  start_date?: string;
  matches: Match[];
  created_at: string;
}
