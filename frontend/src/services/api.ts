import { UserProfile, Friend, Match, UserOverallStats } from "../types";
import { localStore } from "./localStore";

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "";

// USER PROFILE
export async function getUserProfile(): Promise<UserProfile | null> {
  return localStore.getUser();
}

export async function saveUserProfile(name: string, phone: string): Promise<UserProfile> {
  const profile = localStore.registerUser(name, phone);
  try {
    await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
  } catch (e) {
    // offline/static mode
  }
  return profile;
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

export async function addFriend(userPhone: string, name: string, phone: string, skillLevel: "Casual" | "Intermediate" | "Advanced" = "Casual"): Promise<Friend> {
  const friend = localStore.addFriend(userPhone, name, phone, skillLevel);
  try {
    await fetch(`${API_BASE}/api/friends`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_phone: userPhone, name, phone, skill_level: skillLevel }),
    });
  } catch (e) {}
  return friend;
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
