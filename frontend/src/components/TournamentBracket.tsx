import React, { useState } from "react";
import { Trophy, Plus, Play, CheckCircle } from "lucide-react";
import { Tournament, Match } from "../types";
import { createTournament } from "../services/api";

interface TournamentBracketProps {
  tournaments: Tournament[];
  onSelectMatch: (match: Match) => void;
  onRefresh: () => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournaments,
  onSelectMatch,
  onRefresh,
}) => {
  const [selectedTournamentId, setSelectedTournamentId] = useState<number>(
    tournaments[0]?.id || 1
  );
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTournName, setNewTournName] = useState<string>("");
  const [newTournPrize, setNewTournPrize] = useState<string>("$1,000");

  const currentTournament = tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0];

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTournName.trim()) return;
    try {
      await createTournament({
        name: newTournName,
        format: "single_elimination",
        max_teams: 8,
        prize_pool: newTournPrize,
        status: "active",
      });
      setShowCreateModal(false);
      setNewTournName("");
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Tournament Selector Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {currentTournament ? currentTournament.name : "Pickleball Tournaments"}
            </h2>
            <p className="text-xs text-slate-400">
              {currentTournament?.format === "single_elimination" ? "Single Elimination Bracket" : "Round Robin Play"} • Prize: {currentTournament?.prize_pool || "Honor"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {tournaments.length > 1 && (
            <select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Tournament</span>
          </button>
        </div>
      </div>

      {/* Visual Bracket Display */}
      {currentTournament && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Official Championship Bracket
              </h3>
              <p className="text-xs text-slate-500">
                Click any match to launch Live Court-Side Scoring
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Round 1 • Quarter-Finals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentTournament.matches && currentTournament.matches.length > 0 ? (
              currentTournament.matches.map((m, idx) => (
                <div
                  key={m.id || idx}
                  onClick={() => onSelectMatch(m)}
                  className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="font-bold">Match #{idx + 1}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.is_completed ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {m.is_completed ? "FINAL" : "IN PLAY"}
                    </span>
                  </div>

                  {/* Team 1 Entry */}
                  <div className={`p-2.5 rounded-lg mb-1.5 flex items-center justify-between transition-colors ${
                    m.winner_team === 1 ? "bg-emerald-950/40 border border-emerald-500/40" : "bg-slate-900"
                  }`}>
                    <div className="truncate pr-2">
                      <span className="text-xs font-bold text-slate-200">
                        {m.team1_player1?.name || "Seed 1"}
                      </span>
                      {m.match_type === "doubles" && m.team1_player2 && (
                        <span className="text-xs text-slate-400"> & {m.team1_player2.name}</span>
                      )}
                    </div>
                    <span className="font-mono text-base font-black text-white">{m.score_team1}</span>
                  </div>

                  {/* Team 2 Entry */}
                  <div className={`p-2.5 rounded-lg flex items-center justify-between transition-colors ${
                    m.winner_team === 2 ? "bg-emerald-950/40 border border-emerald-500/40" : "bg-slate-900"
                  }`}>
                    <div className="truncate pr-2">
                      <span className="text-xs font-bold text-slate-200">
                        {m.team2_player1?.name || "Seed 2"}
                      </span>
                      {m.match_type === "doubles" && m.team2_player2 && (
                        <span className="text-xs text-slate-400"> & {m.team2_player2.name}</span>
                      )}
                    </div>
                    <span className="font-mono text-base font-black text-white">{m.score_team2}</span>
                  </div>

                  {/* Card Action */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Call: {m.score_call || "0-0-2"}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current" /> Open
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500">
                No active matches in this tournament bracket yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create New Tournament</h3>
            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Tournament Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Open Doubles Championship"
                  value={newTournName}
                  onChange={(e) => setNewTournName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Prize Pool
                </label>
                <input
                  type="text"
                  placeholder="$1,000"
                  value={newTournPrize}
                  onChange={(e) => setNewTournPrize(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold rounded-lg shadow-md"
                >
                  Generate Bracket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
