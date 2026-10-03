import { UserProfile, Friend, Match, UserOverallStats, HeadToHeadStat } from "../types";

const KEY_USER = "pb_user_profile_v2";
const KEY_FRIENDS = "pb_friends_v2";
const KEY_MATCHES = "pb_matches_v2";
const KEY_UNDO = "pb_match_history_v2";

const AVATAR_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316"];

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

const matchUndoStack: Record<number, any[]> = {};

export function computeScoreCall(m: Match): string {
  const isTeam1Serving = m.serving_team === 1;
  const serverScore = isTeam1Serving ? m.score_team1 : m.score_team2;
  const receiverScore = isTeam1Serving ? m.score_team2 : m.score_team1;
  
  if (m.match_type === "doubles" && m.scoring_mode === "sideout") {
    return `${serverScore} - ${receiverScore} - ${m.server_number}`;
  }
  return `${serverScore} - ${receiverScore}`;
}

export const localStore = {
  // USER PROFILE
  getUser(): UserProfile | null {
    return getStorage<UserProfile | null>(KEY_USER, null);
  },

  registerUser(name: string, phone: string): UserProfile {
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const profile: UserProfile = {
      id: "usr_" + Date.now(),
      name: cleanName,
      phone: cleanPhone,
      avatar_color: color,
      created_at: new Date().toISOString(),
    };
    setStorage(KEY_USER, profile);

    // If user has no friends, seed a couple friendly defaults to play with
    const friends = this.getFriends(cleanPhone);
    if (friends.length === 0) {
      this.addFriend(cleanPhone, "Marcus", "+1 555-0144", "Intermediate");
      this.addFriend(cleanPhone, "Chloe", "+1 555-0182", "Advanced");
    }

    return profile;
  },

  updateUser(name: string, phone: string): UserProfile {
    const current = this.getUser();
    const updated: UserProfile = {
      id: current?.id || "usr_" + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      avatar_color: current?.avatar_color || "#10b981",
      created_at: current?.created_at || new Date().toISOString(),
    };
    setStorage(KEY_USER, updated);
    return updated;
  },

  logoutUser(): void {
    localStorage.removeItem(KEY_USER);
  },

  // FRIENDS
  getFriends(userPhone?: string): Friend[] {
    const all = getStorage<Friend[]>(KEY_FRIENDS, []);
    if (!userPhone) return all;
    return all.filter(f => f.user_phone === userPhone);
  },

  addFriend(userPhone: string, name: string, phone: string, skill_level: "Casual" | "Intermediate" | "Advanced" = "Casual"): Friend {
    const all = getStorage<Friend[]>(KEY_FRIENDS, []);
    const color = AVATAR_COLORS[all.length % AVATAR_COLORS.length];
    const newFriend: Friend = {
      id: "frd_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      user_phone: userPhone,
      name: name.trim(),
      phone: phone.trim(),
      avatar_color: color,
      skill_level: skill_level,
      created_at: new Date().toISOString(),
    };
    all.push(newFriend);
    setStorage(KEY_FRIENDS, all);
    return newFriend;
  },

  deleteFriend(friendId: string): void {
    const all = getStorage<Friend[]>(KEY_FRIENDS, []);
    const filtered = all.filter(f => f.id !== friendId);
    setStorage(KEY_FRIENDS, filtered);
  },

  // MATCHES
  getMatches(userPhone?: string): Match[] {
    const all = getStorage<Match[]>(KEY_MATCHES, []);
    if (!userPhone) return all;
    return all.filter(m => !m.user_phone || m.user_phone === userPhone);
  },

  getMatch(id: number): Match | null {
    const all = getStorage<Match[]>(KEY_MATCHES, []);
    const found = all.find(m => m.id === id);
    if (found) {
      found.score_call = computeScoreCall(found);
      return found;
    }
    return null;
  },

  createMatch(params: {
    title?: string;
    match_type: "singles" | "doubles";
    scoring_mode: "sideout" | "rally";
    target_points: number;
    win_by: number;
    user_phone: string;
    team1_player_names: string[];
    team2_player_names: string[];
  }): Match {
    const all = getStorage<Match[]>(KEY_MATCHES, []);
    
    // In doubles side-out scoring, match starts on Server 2 ("0-0-2")
    const initialServerNumber = (params.match_type === "doubles" && params.scoring_mode === "sideout") ? 2 : 1;
    
    const newMatch: Match = {
      id: Date.now(),
      title: params.title || (params.match_type === "singles" 
        ? `${params.team1_player_names[0]} vs ${params.team2_player_names[0]}`
        : `${params.team1_player_names.join(" & ")} vs ${params.team2_player_names.join(" & ")}`),
      match_type: params.match_type,
      scoring_mode: params.scoring_mode,
      target_points: params.target_points || 11,
      win_by: params.win_by || 2,
      user_phone: params.user_phone,
      team1_player_names: params.team1_player_names,
      team2_player_names: params.team2_player_names,
      score_team1: 0,
      score_team2: 0,
      serving_team: 1,
      server_number: initialServerNumber,
      team1_player1_side: "right",
      team1_player2_side: "left",
      team2_player1_side: "right",
      team2_player2_side: "left",
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    newMatch.score_call = computeScoreCall(newMatch);

    all.unshift(newMatch);
    setStorage(KEY_MATCHES, all);
    return newMatch;
  },

  recordRally(matchId: number, winningTeam: 1 | 2): Match {
    const all = getStorage<Match[]>(KEY_MATCHES, []);
    const match = all.find(m => m.id === matchId);
    if (!match || match.is_completed) return match || ({} as Match);

    // Snapshot state for undo
    if (!matchUndoStack[match.id]) matchUndoStack[match.id] = [];
    matchUndoStack[match.id].push(JSON.parse(JSON.stringify(match)));

    const isServingTeam = winningTeam === match.serving_team;
    const mode = match.scoring_mode;
    const isDoubles = match.match_type === "doubles";

    if (mode === "sideout") {
      if (isServingTeam) {
        // Point awarded to serving team!
        if (match.serving_team === 1) {
          match.score_team1 += 1;
        } else {
          match.score_team2 += 1;
        }

        // Side switch for serving team
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
        // Fault on serving team: Sideout or second server
        if (isDoubles) {
          if (match.server_number === 1) {
            match.server_number = 2;
          } else {
            // Side out to other team
            match.serving_team = match.serving_team === 1 ? 2 : 1;
            match.server_number = 1;
          }
        } else {
          // Singles side-out
          match.serving_team = match.serving_team === 1 ? 2 : 1;
          match.server_number = 1;
        }
      }
    } else {
      // Modern rally scoring: Point on every rally
      if (winningTeam === 1) {
        match.score_team1 += 1;
      } else {
        match.score_team2 += 1;
      }

      if (!isServingTeam) {
        match.serving_team = winningTeam;
        match.server_number = 1;
      }
    }

    // Win-by-2 condition
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
    setStorage(KEY_MATCHES, all);
    return match;
  },

  undoRally(matchId: number): Match {
    const history = matchUndoStack[matchId];
    if (!history || history.length === 0) return this.getMatch(matchId) || ({} as Match);
    
    const prev = history.pop();
    const all = getStorage<Match[]>(KEY_MATCHES, []);
    const idx = all.findIndex(m => m.id === matchId);
    if (idx !== -1 && prev) {
      all[idx] = prev;
      all[idx].score_call = computeScoreCall(all[idx]);
      setStorage(KEY_MATCHES, all);
      return all[idx];
    }
    return this.getMatch(matchId) || ({} as Match);
  },

  resetMatch(matchId: number): Match {
    const all = getStorage<Match[]>(KEY_MATCHES, []);
    const match = all.find(m => m.id === matchId);
    if (match) {
      match.score_team1 = 0;
      match.score_team2 = 0;
      match.serving_team = 1;
      match.server_number = (match.match_type === "doubles" && match.scoring_mode === "sideout") ? 2 : 1;
      match.is_completed = false;
      match.winner_team = undefined;
      match.finished_at = undefined;
      match.score_call = computeScoreCall(match);
      matchUndoStack[matchId] = [];
      setStorage(KEY_MATCHES, all);
      return match;
    }
    return ({} as Match);
  },

  // STATS ENGINE
  getUserStats(userName: string, userPhone?: string): UserOverallStats {
    const matches = this.getMatches(userPhone).filter(m => m.is_completed);
    const friends = this.getFriends(userPhone);

    let totalMatches = 0;
    let wins = 0;
    let losses = 0;
    let pointsScored = 0;
    let pointsConceded = 0;
    let currentStreak = 0;
    let streakCounted = false;

    // Track head-to-head records against each opponent friend
    const h2hMap: Record<string, { played: number; wins: number; losses: number; phone: string }> = {};
    friends.forEach(f => {
      h2hMap[f.name] = { played: 0, wins: 0, losses: 0, phone: f.phone };
    });

    // Process from most recent match backwards for streak
    matches.forEach(m => {
      const isTeam1 = m.team1_player_names.some(n => n.toLowerCase() === userName.toLowerCase() || n.toLowerCase() === "you");
      const isTeam2 = m.team2_player_names.some(n => n.toLowerCase() === userName.toLowerCase() || n.toLowerCase() === "you");

      if (!isTeam1 && !isTeam2) return;

      totalMatches += 1;
      const userWon = (isTeam1 && m.winner_team === 1) || (isTeam2 && m.winner_team === 2);
      
      if (userWon) {
        wins += 1;
        if (!streakCounted) currentStreak += 1;
      } else {
        losses += 1;
        streakCounted = true; // streak breaks on first loss encountered from top
      }

      const myScore = isTeam1 ? m.score_team1 : m.score_team2;
      const oppScore = isTeam1 ? m.score_team2 : m.score_team1;
      pointsScored += myScore;
      pointsConceded += oppScore;

      // Opponents list
      const opponents = isTeam1 ? m.team2_player_names : m.team1_player_names;
      opponents.forEach(opp => {
        if (!h2hMap[opp]) {
          h2hMap[opp] = { played: 0, wins: 0, losses: 0, phone: "" };
        }
        h2hMap[opp].played += 1;
        if (userWon) {
          h2hMap[opp].wins += 1;
        } else {
          h2hMap[opp].losses += 1;
        }
      });
    });

    const headToHead: HeadToHeadStat[] = Object.entries(h2hMap)
      .filter(([_, data]) => data.played > 0)
      .map(([oppName, data]) => ({
        friend_name: oppName,
        friend_phone: data.phone,
        matches_played: data.played,
        wins: data.wins,
        losses: data.losses,
        win_rate: data.played > 0 ? Math.round((data.wins / data.played) * 100) : 0,
      }));

    return {
      total_matches: totalMatches,
      wins: wins,
      losses: losses,
      win_rate: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0,
      streak: currentStreak,
      points_scored: pointsScored,
      points_conceded: pointsConceded,
      head_to_head: headToHead,
      history: matches,
    };
  },
};
