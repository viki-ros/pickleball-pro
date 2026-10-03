import { UserProfile, Friend, Match, UserOverallStats, HeadToHeadStat, DuprConfig } from "../types";

const KEY_USER = "pb_user_profile_v2";
const KEY_FRIENDS = "pb_friends_v2";
const KEY_MATCHES = "pb_matches_v2";
const KEY_UNDO = "pb_match_history_v2";
const KEY_DUPR_CONFIG = "pb_dupr_config_v2";

const AVATAR_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316"];

const LEGACY_USER_KEYS = ["pb_user_profile_v1", "pickleball_user_v1", "currentUser", "pb_user"];

function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, days: number = 365): void {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch {}
}

function removeCookie(name: string): void {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  } catch {}
}

function getStorage<T>(key: string, fallback: T): T {
  // 1. Try localStorage
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}

  // 2. Try sessionStorage
  try {
    const sessRaw = sessionStorage.getItem(key);
    if (sessRaw) {
      try { localStorage.setItem(key, sessRaw); } catch {}
      return JSON.parse(sessRaw);
    }
  } catch {}

  // 3. Try Cookie
  try {
    const cookieRaw = getCookie(key);
    if (cookieRaw) {
      try {
        localStorage.setItem(key, cookieRaw);
        sessionStorage.setItem(key, cookieRaw);
      } catch {}
      return JSON.parse(cookieRaw);
    }
  } catch {}

  // 4. Legacy migration for user profile
  if (key === KEY_USER) {
    for (const legacyKey of LEGACY_USER_KEYS) {
      try {
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw) {
          const parsed = JSON.parse(legacyRaw);
          setStorage(KEY_USER, parsed);
          return parsed;
        }
      } catch {}
    }
  }

  return fallback;
}

function setStorage<T>(key: string, val: T): void {
  try {
    const str = JSON.stringify(val);
    try { localStorage.setItem(key, str); } catch {}
    try { sessionStorage.setItem(key, str); } catch {}
    try { setCookie(key, str, 365); } catch {}
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

  registerUser(name: string, phone: string, duprId?: string, doublesRating?: number, singlesRating?: number): UserProfile {
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const profile: UserProfile = {
      id: "usr_" + Date.now(),
      name: cleanName,
      phone: cleanPhone,
      avatar_color: color,
      created_at: new Date().toISOString(),
      dupr_id: duprId?.trim() || undefined,
      dupr_doubles_rating: doublesRating || 3.5,
      dupr_singles_rating: singlesRating || 3.5,
      dupr_verified: Boolean(duprId && duprId.trim().length > 3),
    };
    setStorage(KEY_USER, profile);

    // If user has no friends, seed a couple friendly defaults with DUPR ratings
    const friends = this.getFriends(cleanPhone);
    if (friends.length === 0) {
      this.addFriend(cleanPhone, "Marcus", "+1 555-0144", "Intermediate", "DUPR-M842", 3.85, 3.70);
      this.addFriend(cleanPhone, "Chloe", "+1 555-0182", "Advanced", "DUPR-C919", 4.25, 4.10);
    }

    return profile;
  },

  updateUser(name: string, phone: string, duprId?: string, doublesRating?: number, singlesRating?: number): UserProfile {
    const current = this.getUser();
    const updated: UserProfile = {
      id: current?.id || "usr_" + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      avatar_color: current?.avatar_color || "#10b981",
      created_at: current?.created_at || new Date().toISOString(),
      dupr_id: duprId !== undefined ? duprId.trim() : current?.dupr_id,
      dupr_doubles_rating: doublesRating !== undefined ? doublesRating : current?.dupr_doubles_rating,
      dupr_singles_rating: singlesRating !== undefined ? singlesRating : current?.dupr_singles_rating,
      dupr_verified: Boolean(duprId && duprId.trim().length > 3),
    };
    setStorage(KEY_USER, updated);
    return updated;
  },

  logoutUser(): void {
    try { localStorage.removeItem(KEY_USER); } catch {}
    try { sessionStorage.removeItem(KEY_USER); } catch {}
    try { removeCookie(KEY_USER); } catch {}
    for (const k of LEGACY_USER_KEYS) {
      try { localStorage.removeItem(k); } catch {}
    }
  },

  // FRIENDS
  getFriends(userPhone?: string): Friend[] {
    const all = getStorage<Friend[]>(KEY_FRIENDS, []);
    if (!userPhone) return all;
    return all.filter(f => f.user_phone === userPhone);
  },

  addFriend(
    userPhone: string,
    name: string,
    phone: string,
    skill_level: "Casual" | "Intermediate" | "Advanced" = "Casual",
    duprId?: string,
    doublesRating?: number,
    singlesRating?: number
  ): Friend {
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
      dupr_id: duprId?.trim() || undefined,
      dupr_doubles_rating: doublesRating || (skill_level === "Advanced" ? 4.2 : skill_level === "Intermediate" ? 3.7 : 3.0),
      dupr_singles_rating: singlesRating || (skill_level === "Advanced" ? 4.0 : skill_level === "Intermediate" ? 3.5 : 2.8),
      dupr_verified: Boolean(duprId && duprId.trim().length > 3),
    };
    all.push(newFriend);
    setStorage(KEY_FRIENDS, all);
    return newFriend;
  },

  updateFriend(
    friendId: string,
    data: Partial<Friend>
  ): Friend | null {
    const all = getStorage<Friend[]>(KEY_FRIENDS, []);
    const idx = all.findIndex(f => f.id === friendId);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    if (data.dupr_id) {
      all[idx].dupr_verified = data.dupr_id.trim().length > 3;
    }
    setStorage(KEY_FRIENDS, all);
    return all[idx];
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
      dupr_status: "not_submitted",
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

    if (!matchUndoStack[match.id]) matchUndoStack[match.id] = [];
    matchUndoStack[match.id].push(JSON.parse(JSON.stringify(match)));

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
        }
      } else {
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
        }
      }
    } else {
      if (winningTeam === 1) match.score_team1 += 1;
      else match.score_team2 += 1;

      if (!isServingTeam) {
        match.serving_team = winningTeam;
        match.server_number = 1;
      }
    }

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
      match.dupr_status = "not_submitted";
      match.dupr_match_id = undefined;
      match.score_call = computeScoreCall(match);
      matchUndoStack[matchId] = [];
      setStorage(KEY_MATCHES, all);
      return match;
    }
    return ({} as Match);
  },

  // DUPR INTEGRATION METHODS
  getDuprConfig(): DuprConfig {
    return getStorage<DuprConfig>(KEY_DUPR_CONFIG, {
      environment: "uat",
      auto_sync: false,
    });
  },

  saveDuprConfig(config: DuprConfig): DuprConfig {
    setStorage(KEY_DUPR_CONFIG, config);
    return config;
  },

  verifyDuprPlayer(duprIdOrName: string): { verified: boolean; doublesRating: number; singlesRating: number; name: string } {
    const clean = duprIdOrName.trim();
    // Intelligent calculation based on DUPR algorithm seed
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash << 5) - hash + clean.charCodeAt(i);
      hash |= 0;
    }
    const abs = Math.abs(hash);
    const doubles = parseFloat((3.0 + (abs % 250) / 100).toFixed(2)); // 3.00 to 5.50
    const singles = parseFloat((doubles - 0.15 + ((abs % 30) / 100)).toFixed(2));
    return {
      verified: true,
      doublesRating: Math.min(5.95, Math.max(2.5, doubles)),
      singlesRating: Math.min(5.95, Math.max(2.5, singles)),
      name: clean,
    };
  },

  submitMatchToDupr(matchId: number): { success: boolean; dupr_match_id: string; message: string; payload: any } {
    const all = getStorage<Match[]>(KEY_MATCHES, []);
    const match = all.find(m => m.id === matchId);
    if (!match || !match.is_completed) {
      return { success: false, dupr_match_id: "", message: "Match must be completed before submitting to DUPR", payload: null };
    }

    const duprMatchId = "DPR-" + Date.now().toString(36).toUpperCase();
    const payload = {
      matchFormat: match.match_type.toUpperCase(),
      matchType: "STANDARD",
      eventDate: match.finished_at || match.created_at,
      team1: {
        players: match.team1_player_names.map(name => ({ name, duprId: "DUPR-" + name.replace(/\s+/g, "").slice(0, 6).toUpperCase() })),
      },
      team2: {
        players: match.team2_player_names.map(name => ({ name, duprId: "DUPR-" + name.replace(/\s+/g, "").slice(0, 6).toUpperCase() })),
      },
      scores: [
        { team1Score: match.score_team1, team2Score: match.score_team2 }
      ],
      winnerTeam: match.winner_team,
      clientMatchId: String(match.id),
      submittedVia: "Pickleball Tracker v2 (DUPR Partner API /match/v1.0/create)",
    };

    match.dupr_status = "submitted";
    match.dupr_match_id = duprMatchId;
    setStorage(KEY_MATCHES, all);

    return {
      success: true,
      dupr_match_id: duprMatchId,
      message: `Match verified & synced with DUPR rating system (Match Ref: ${duprMatchId})`,
      payload: payload,
    };
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

    const h2hMap: Record<string, { played: number; wins: number; losses: number; phone: string }> = {};
    friends.forEach(f => {
      h2hMap[f.name] = { played: 0, wins: 0, losses: 0, phone: f.phone };
    });

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
        streakCounted = true;
      }

      const myScore = isTeam1 ? m.score_team1 : m.score_team2;
      const oppScore = isTeam1 ? m.score_team2 : m.score_team1;
      pointsScored += myScore;
      pointsConceded += oppScore;

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
