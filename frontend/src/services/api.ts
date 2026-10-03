import { UserProfile, Friend, Match, UserOverallStats, DuprConfig } from "../types";
import { localStore } from "./localStore";

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "";

// USER PROFILE
export async function getUserProfile(): Promise<UserProfile | null> {
  return localStore.getUser();
}

export async function saveUserProfile(
  name: string,
  phone: string,
  duprId?: string,
  doublesRating?: number,
  singlesRating?: number
): Promise<UserProfile> {
  const profile = localStore.registerUser(name, phone, duprId, doublesRating, singlesRating);
  try {
    await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, dupr_id: duprId, doubles_rating: doublesRating, singles_rating: singlesRating }),
    });
  } catch (e) {}
  return profile;
}

export async function updateUserDupr(
  name: string,
  phone: string,
  duprId?: string,
  doublesRating?: number,
  singlesRating?: number
): Promise<UserProfile> {
  return localStore.updateUser(name, phone, duprId, doublesRating, singlesRating);
}

export async function logoutUserProfile(): Promise<void> {
  localStore.logoutUser();
}

// FRIENDS
export async function fetchFriends(userPhone?: string): Promise<Friend[]> {
  try {
    const res = await fetch(`${API_BASE}/api/friends?user_phone=${encodeURIComponent(userPhone || "")}`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return localStore.getFriends(userPhone);
}

export async function addFriend(
  userPhone: string,
  name: string,
  phone: string,
  skillLevel: "Casual" | "Intermediate" | "Advanced" = "Casual",
  duprId?: string,
  doublesRating?: number,
  singlesRating?: number
): Promise<Friend> {
  const friend = localStore.addFriend(userPhone, name, phone, skillLevel, duprId, doublesRating, singlesRating);
  try {
    await fetch(`${API_BASE}/api/friends`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_phone: userPhone, name, phone, skill_level: skillLevel, dupr_id: duprId }),
    });
  } catch (e) {}
  return friend;
}

export async function updateFriend(friendId: string, data: Partial<Friend>): Promise<Friend | null> {
  return localStore.updateFriend(friendId, data);
}

export async function removeFriend(friendId: string): Promise<void> {
  localStore.deleteFriend(friendId);
  try {
    await fetch(`${API_BASE}/api/friends/${friendId}`, { method: "DELETE" });
  } catch (e) {}
}

// MATCHES
export async function fetchMatches(userPhone?: string): Promise<Match[]> {
  try {
    const res = await fetch(`${API_BASE}/api/matches?user_phone=${encodeURIComponent(userPhone || "")}`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return localStore.getMatches(userPhone);
}

export async function fetchMatch(id: number): Promise<Match | null> {
  try {
    const res = await fetch(`${API_BASE}/api/matches/${id}`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return localStore.getMatch(id);
}

export async function createMatch(params: {
  title?: string;
  match_type: "singles" | "doubles";
  scoring_mode: "sideout" | "rally";
  target_points: number;
  win_by: number;
  user_phone: string;
  team1_player_names: string[];
  team2_player_names: string[];
}): Promise<Match> {
  const match = localStore.createMatch(params);
  try {
    await fetch(`${API_BASE}/api/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch (e) {}
  return match;
}

export async function recordRally(matchId: number, winningTeam: 1 | 2): Promise<Match> {
  const updated = localStore.recordRally(matchId, winningTeam);
  try {
    await fetch(`${API_BASE}/api/matches/${matchId}/rally`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winning_team: winningTeam }),
    });
  } catch (e) {}
  return updated;
}

export async function undoRally(matchId: number): Promise<Match> {
  const updated = localStore.undoRally(matchId);
  try {
    await fetch(`${API_BASE}/api/matches/${matchId}/undo`, { method: "POST" });
  } catch (e) {}
  return updated;
}

export async function resetMatch(matchId: number): Promise<Match> {
  const updated = localStore.resetMatch(matchId);
  try {
    await fetch(`${API_BASE}/api/matches/${matchId}/reset`, { method: "POST" });
  } catch (e) {}
  return updated;
}

// STATS
export async function fetchUserStats(userName: string, userPhone?: string): Promise<UserOverallStats> {
  try {
    const res = await fetch(`${API_BASE}/api/stats?user_phone=${encodeURIComponent(userPhone || "")}`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return localStore.getUserStats(userName, userPhone);
}

// DUPR INTEGRATION API (Official DUPR API Auto-Sync, Zero Manual Entry)
export async function getDuprStatus(): Promise<{ connected: boolean; auth_type: string; has_credentials: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/dupr/status`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { connected: false, auth_type: "none", has_credentials: false };
}

export async function connectDuprAccount(credentials: {
  email?: string;
  password?: string;
  client_key?: string;
  client_secret?: string;
  token?: string;
}): Promise<{ status: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/dupr/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return await res.json();
  } catch (e: any) {
    return { status: "ERROR", message: e.message || "Failed to connect to DUPR" };
  }
}

export async function fetchDuprPlayer(duprId: string): Promise<{
  status: string;
  dupr_id: string;
  name?: string;
  doubles_rating?: number;
  singles_rating?: number;
  doubles_provisional?: boolean;
  singles_provisional?: boolean;
  verified: boolean;
  source?: string;
  message?: string;
}> {
  const clean = duprId.trim().toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/api/dupr/player/${encodeURIComponent(clean)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {}

  // Fallback to localStore verification
  const localVer = localStore.verifyDuprPlayer(clean);
  return {
    status: localVer.verified ? "SUCCESS" : "NOT_FOUND",
    dupr_id: clean,
    name: localVer.name,
    doubles_rating: localVer.doublesRating,
    singles_rating: localVer.singlesRating,
    verified: localVer.verified,
    source: "localStore",
  };
}

export async function syncUserDupr(phone: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/api/dupr/sync-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        const u = data.user;
        return localStore.updateUser(u.name, u.phone, u.dupr_id, u.dupr_doubles_rating, u.dupr_singles_rating);
      }
    }
  } catch (e) {}
  return localStore.getUser();
}

export async function syncFriendDupr(friendId: string, duprId?: string): Promise<Friend | null> {
  try {
    const res = await fetch(`${API_BASE}/api/friends/${friendId}/sync-dupr`, { method: "PATCH" });
    if (res.ok) {
      const data = await res.json();
      return localStore.updateFriend(friendId, {
        dupr_doubles_rating: data.dupr_doubles_rating,
        dupr_singles_rating: data.dupr_singles_rating,
        dupr_verified: true,
      });
    }
  } catch (e) {}

  if (duprId) {
    const player = await fetchDuprPlayer(duprId);
    if (player.doubles_rating !== undefined || player.singles_rating !== undefined) {
      return localStore.updateFriend(friendId, {
        dupr_doubles_rating: player.doubles_rating,
        dupr_singles_rating: player.singles_rating,
        dupr_verified: true,
      });
    }
  }
  return null;
}

export async function verifyDuprPlayer(duprIdOrName: string) {
  return localStore.verifyDuprPlayer(duprIdOrName);
}

export async function updateFriendDuprRating(friendId: string, duprId: string) {
  return syncFriendDupr(friendId, duprId);
}
