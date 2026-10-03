export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  avatar_color: string;
  created_at: string;
}

export interface Friend {
  id: string;
  user_phone: string;
  name: string;
  phone: string;
  avatar_color: string;
  skill_level?: "Casual" | "Intermediate" | "Advanced";
  created_at: string;
}

export interface Match {
  id: number;
  title: string;
  match_type: "singles" | "doubles";
  scoring_mode: "sideout" | "rally";
  target_points: number;
  win_by: number;
  user_phone?: string;
  team1_player_names: string[]; // e.g. ["You", "Dave"] or ["Alex"]
  team2_player_names: string[]; // e.g. ["Sarah", "Mike"] or ["John"]
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
}

export interface HeadToHeadStat {
  friend_name: string;
  friend_phone: string;
  matches_played: number;
  wins: number;
  losses: number;
  win_rate: number;
}

export interface UserOverallStats {
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
  streak: number;
  points_scored: number;
  points_conceded: number;
  head_to_head: HeadToHeadStat[];
  history: Match[];
}
