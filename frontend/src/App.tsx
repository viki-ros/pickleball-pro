import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LiveScoreTracker } from "./components/LiveScoreTracker";
import { FriendsView } from "./components/FriendsView";
import { StatsView } from "./components/StatsView";
import { ProfileView } from "./components/ProfileView";
import { AuthModal } from "./components/AuthModal";
import { CreateMatchModal } from "./components/CreateMatchModal";
import { UserProfile, Friend, Match, UserOverallStats } from "./types";
import {
  getUserProfile,
  saveUserProfile,
  logoutUserProfile,
  fetchFriends,
  addFriend,
  removeFriend,
  fetchMatches,
  createMatch,
  fetchUserStats,
} from "./services/api";
import { Swords, Plus, History } from "lucide-react";

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"match" | "friends" | "stats" | "profile">("match");

  const [friends, setFriends] = useState<Friend[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [userStats, setUserStats] = useState<UserOverallStats>({
    total_matches: 0,
    wins: 0,
    losses: 0,
    win_rate: 0,
    streak: 0,
    points_scored: 0,
    points_conceded: 0,
    head_to_head: [],
    history: [],
  });

  const [showCreateMatchModal, setShowCreateMatchModal] = useState<boolean>(false);
  const [preselectedFriend, setPreselectedFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load User & Core Data
  const loadData = async () => {
    try {
      setLoading(true);
      const user = await getUserProfile();
      setCurrentUser(user);

      if (!user) {
        setShowAuthModal(true);
        return;
      }

      const [friendList, matchList, stats] = await Promise.all([
        fetchFriends(user.phone),
        fetchMatches(user.phone),
        fetchUserStats(user.name, user.phone),
      ]);

      setFriends(friendList);
      setMatches(matchList);
      setUserStats(stats);

      // Set active match
      const inProgressMatch = matchList.find((m) => !m.is_completed);
      if (inProgressMatch) {
        setCurrentMatch(inProgressMatch);
      } else if (matchList.length > 0) {
        setCurrentMatch(matchList[0]);
      }
    } catch (err) {
      console.error("Error loading app data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Registration / Profile Edit
  const handleSaveProfile = async (name: string, phone: string) => {
    const user = await saveUserProfile(name, phone);
    setCurrentUser(user);
    setShowAuthModal(false);
    loadData();
  };

  // Logout
  const handleLogout = async () => {
    if (window.confirm("Switch to a different name / phone number?")) {
      await logoutUserProfile();
      setCurrentUser(null);
      setShowAuthModal(true);
    }
  };

  // Add Friend
  const handleAddFriend = async (
    name: string,
    phone: string,
    skill: "Casual" | "Intermediate" | "Advanced"
  ) => {
    if (!currentUser) return;
    const newFriend = await addFriend(currentUser.phone, name, phone, skill);
    setFriends([...friends, newFriend]);
    refreshStats();
  };

  // Delete Friend
  const handleDeleteFriend = async (id: string) => {
    if (window.confirm("Remove this friend from your list?")) {
      await removeFriend(id);
      setFriends(friends.filter((f) => f.id !== id));
      refreshStats();
    }
  };

  // Start match with a specific friend from directory
  const handleStartMatchWithFriend = (friend: Friend) => {
    setPreselectedFriend(friend);
    setShowCreateMatchModal(true);
  };

  // When a new match is created
  const handleMatchCreated = (newMatch: Match) => {
    setMatches([newMatch, ...matches]);
    setCurrentMatch(newMatch);
    setActiveTab("match");
    refreshStats();
  };

  // When match points change
  const handleMatchUpdate = (updatedMatch: Match) => {
    setCurrentMatch(updatedMatch);
    setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
    refreshStats();
  };

  // Refresh stats after match change
  const refreshStats = async () => {
    if (!currentUser) return;
    const stats = await fetchUserStats(currentUser.name, currentUser.phone);
    setUserStats(stats);
  };

  // Reset demo data
  const handleResetAllData = () => {
    if (window.confirm("Are you sure you want to clear your local matches and reset?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenNewMatch={() => {
          setPreselectedFriend(null);
          setShowCreateMatchModal(true);
        }}
        onOpenProfile={() => setActiveTab("profile")}
        hasActiveMatch={Boolean(currentMatch && !currentMatch.is_completed)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {loading && !currentUser ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-xs">Opening Pickleball Tracker...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: MATCH / LIVE SCORING */}
            {activeTab === "match" && (
              currentMatch ? (
                <div>
                  {/* Match Switcher if multiple matches exist */}
                  {matches.length > 1 && (
                    <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                        Matches:
                      </span>
                      {matches.slice(0, 5).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setCurrentMatch(m)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                            currentMatch.id === m.id
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                          }`}
                        >
                          {m.is_completed ? "✓ " : "🎾 "}
                          {m.title.length > 22 ? m.title.slice(0, 22) + "..." : m.title}
                        </button>
                      ))}
                    </div>
                  )}

                  <LiveScoreTracker
                    match={currentMatch}
                    onMatchUpdate={handleMatchUpdate}
                    onFinishMatch={() => setActiveTab("stats")}
                  />
                </div>
              ) : (
                /* No Active Match: Empty state with start button */
                <div className="text-center py-20 px-6 bg-slate-900 border border-slate-800 rounded-3xl max-w-lg mx-auto shadow-sm">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4">
                    🏓
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight mb-1.5">
                    Ready to Play?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto mb-6">
                    Start a new singles (1v1) or doubles (2v2) match with your friends. Points and stats will automatically calculate.
                  </p>
                  <button
                    onClick={() => {
                      setPreselectedFriend(null);
                      setShowCreateMatchModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Create Match Now</span>
                  </button>
                </div>
              )
            )}

            {/* TAB 2: FRIENDS DIRECTORY */}
            {activeTab === "friends" && (
              <FriendsView
                friends={friends}
                headToHeadStats={userStats.head_to_head}
                onAddFriend={handleAddFriend}
                onDeleteFriend={handleDeleteFriend}
                onStartMatchWithFriend={handleStartMatchWithFriend}
              />
            )}

            {/* TAB 3: STATS & HISTORY */}
            {activeTab === "stats" && currentUser && (
              <StatsView
                currentUser={currentUser}
                stats={userStats}
                onSelectMatch={(m) => {
                  setCurrentMatch(m);
                  setActiveTab("match");
                }}
                onStartNewMatch={() => {
                  setPreselectedFriend(null);
                  setShowCreateMatchModal(true);
                }}
              />
            )}

            {/* TAB 4: PROFILE & SETTINGS */}
            {activeTab === "profile" && currentUser && (
              <ProfileView
                currentUser={currentUser}
                onEditProfile={() => setShowAuthModal(true)}
                onLogout={handleLogout}
                onResetAllData={handleResetAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Auth / Profile Registration Modal */}
      <AuthModal
        isOpen={showAuthModal}
        currentUser={currentUser}
        onSave={handleSaveProfile}
        onClose={currentUser ? () => setShowAuthModal(false) : undefined}
      />

      {/* Create Match Modal */}
      {currentUser && (
        <CreateMatchModal
          isOpen={showCreateMatchModal}
          currentUser={currentUser}
          friends={friends}
          initialFriend={preselectedFriend}
          onClose={() => setShowCreateMatchModal(false)}
          onMatchCreated={handleMatchCreated}
          onCreateMatchApi={createMatch}
          onOpenAddFriend={() => setActiveTab("friends")}
        />
      )}

    </div>
  );
}

export default App;
