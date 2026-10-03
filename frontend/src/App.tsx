import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LiveScoreTracker } from "./components/LiveScoreTracker";
import { TournamentBracket } from "./components/TournamentBracket";
import { CourtBookingGrid } from "./components/CourtBookingGrid";
import { PlayerStatsCard } from "./components/PlayerStatsCard";
import { NewMatchModal } from "./components/NewMatchModal";
import { Match, Player, Court, Tournament } from "./types";
import { fetchMatches, fetchPlayers, fetchCourts, fetchTournaments } from "./services/api";
import { Activity, Plus, RefreshCw } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<"match" | "tournaments" | "courts" | "players">("match");
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showNewMatchModal, setShowNewMatchModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [mList, pList, cList, tList] = await Promise.all([
        fetchMatches(),
        fetchPlayers(),
        fetchCourts(),
        fetchTournaments(),
      ]);
      setMatches(mList);
      setPlayers(pList);
      setCourts(cList);
      setTournaments(tList);

      if (mList.length > 0) {
        // Keep current selected match or default to first
        setCurrentMatch((prev) => (prev ? mList.find((m) => m.id === prev.id) || mList[0] : mList[0]));
      }
    } catch (err) {
      console.error("Error loading pickleball data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleMatchCreated = (newMatch: Match) => {
    setMatches([newMatch, ...matches]);
    setCurrentMatch(newMatch);
    setActiveTab("match");
  };

  const handleMatchUpdate = (updatedMatch: Match) => {
    setCurrentMatch(updatedMatch);
    setMatches(matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewMatch={() => setShowNewMatchModal(true)}
        liveMatchTitle={currentMatch?.title}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Match Switcher Toolbar when on Match tab */}
        {activeTab === "match" && matches.length > 1 && (
          <div className="mb-6 flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 overflow-x-auto">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Select Active Match:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto">
                {matches.slice(0, 6).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setCurrentMatch(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      currentMatch?.id === m.id
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-800/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    #{m.id}: {m.title.length > 20 ? m.title.slice(0, 20) + "..." : m.title}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={loadAllData}
              title="Refresh Data"
              className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors ml-2"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Views */}
        {loading && matches.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Connecting to court server...</p>
          </div>
        ) : (
          <>
            {activeTab === "match" && (
              currentMatch ? (
                <LiveScoreTracker
                  match={currentMatch}
                  onMatchUpdate={handleMatchUpdate}
                />
              ) : (
                <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-2">No Active Matches Found</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Start a new singles or doubles match with official side-out scoring.
                  </p>
                  <button
                    onClick={() => setShowNewMatchModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Match Now</span>
                  </button>
                </div>
              )
            )}

            {activeTab === "tournaments" && (
              <TournamentBracket
                tournaments={tournaments}
                onSelectMatch={(m) => {
                  setCurrentMatch(m);
                  setActiveTab("match");
                }}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === "courts" && (
              <CourtBookingGrid
                courts={courts}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === "players" && (
              <PlayerStatsCard
                players={players}
                onRefresh={loadAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <p>Pickleball Pro • Official Side-Out & Rally Scoring Engine • Regulation 20' × 44' Court Staging</p>
      </footer>

      {/* New Match Modal */}
      <NewMatchModal
        isOpen={showNewMatchModal}
        onClose={() => setShowNewMatchModal(false)}
        players={players}
        courts={courts}
        onMatchCreated={handleMatchCreated}
      />

    </div>
  );
}

export default App;
