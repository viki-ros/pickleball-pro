import React, { useState } from "react";
import { X, Play, Settings2 } from "lucide-react";
import { Player, Court, Match } from "../types";
import { createMatch } from "../services/api";

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  courts: Court[];
  onMatchCreated: (match: Match) => void;
}

export const NewMatchModal: React.FC<NewMatchModalProps> = ({
  isOpen,
  onClose,
  players,
  courts,
  onMatchCreated,
}) => {
  const [title, setTitle] = useState<string>("Exhibition Match");
  const [matchType, setMatchType] = useState<"doubles" | "singles">("doubles");
  const [scoringMode, setScoringMode] = useState<"sideout" | "rally">("sideout");
  const [targetPoints, setTargetPoints] = useState<number>(11);
  const [courtId, setCourtId] = useState<number>(courts[0]?.id || 1);

  // Player Selections
  const [t1p1, setT1p1] = useState<number>(players[0]?.id || 1);
  const [t1p2, setT1p2] = useState<number>(players[1]?.id || 2);
  const [t2p1, setT2p1] = useState<number>(players[2]?.id || 3);
  const [t2p2, setT2p2] = useState<number>(players[3]?.id || 4);

  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const match = await createMatch({
        title,
        match_type: matchType,
        scoring_mode: scoringMode,
        target_points: targetPoints,
        win_by: 2,
        court_id: courtId,
        team1_player1_id: t1p1,
        team1_player2_id: matchType === "doubles" ? t1p2 : undefined,
        team2_player1_id: t2p1,
        team2_player2_id: matchType === "doubles" ? t2p2 : undefined,
      });
      onMatchCreated(match);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl my-8">
        <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Configure New Match</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Match Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>

          {/* Match Type & Scoring Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Format
              </label>
              <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setMatchType("doubles")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                    matchType === "doubles"
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Doubles (2v2)
                </button>
                <button
                  type="button"
                  onClick={() => setMatchType("singles")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                    matchType === "singles"
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Singles (1v1)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Scoring Rule
              </label>
              <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setScoringMode("sideout")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                    scoringMode === "sideout"
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Side-Out
                </button>
                <button
                  type="button"
                  onClick={() => setScoringMode("rally")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                    scoringMode === "rally"
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Rally
                </button>
              </div>
            </div>
          </div>

          {/* Target Points & Court */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Game Points
              </label>
              <select
                value={targetPoints}
                onChange={(e) => setTargetPoints(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              >
                <option value={11}>11 Points (Standard, Win by 2)</option>
                <option value={15}>15 Points (Win by 2)</option>
                <option value={21}>21 Points (Championship, Win by 2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Court Assignment
              </label>
              <select
                value={courtId}
                onChange={(e) => setCourtId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              >
                {courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team 1 Players */}
          <div className="border border-emerald-500/20 bg-emerald-950/10 rounded-xl p-3 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              Team 1 (Serving First)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={t1p1}
                onChange={(e) => setT1p1(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (DUPR {p.rating.toFixed(1)})
                  </option>
                ))}
              </select>

              {matchType === "doubles" && (
                <select
                  value={t1p2}
                  onChange={(e) => setT1p2(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (DUPR {p.rating.toFixed(1)})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Team 2 Players */}
          <div className="border border-sky-500/20 bg-sky-950/10 rounded-xl p-3 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 block">
              Team 2 (Receiving)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={t2p1}
                onChange={(e) => setT2p1(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (DUPR {p.rating.toFixed(1)})
                  </option>
                ))}
              </select>

              {matchType === "doubles" && (
                <select
                  value={t2p2}
                  onChange={(e) => setT2p2(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (DUPR {p.rating.toFixed(1)})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black rounded-lg shadow-md flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Match</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
