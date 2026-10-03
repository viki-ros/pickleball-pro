import React, { useState } from "react";
import { Users, Plus, Award, TrendingUp, Shield } from "lucide-react";
import { Player } from "../types";
import { createPlayer } from "../services/api";

interface PlayerStatsCardProps {
  players: Player[];
  onRefresh: () => void;
}

export const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({ players, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [rating, setRating] = useState<number>(3.5);
  const [preferredSide, setPreferredSide] = useState<string>("Any");
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setLoading(true);
      await createPlayer({
        name,
        rating: Number(rating),
        preferred_side: preferredSide,
      });
      setName("");
      setShowAddModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Player Roster & DUPR Ratings</h2>
            <p className="text-xs text-slate-400">
              Verified player skill levels, match history & win rates
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-sm rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Player</span>
        </button>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((p) => {
          const winRate = p.matches_played > 0
            ? Math.round((p.matches_won / p.matches_played) * 100)
            : 0;

          return (
            <div
              key={p.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-purple-500/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md"
                      style={{ backgroundColor: p.avatar_color || "#3b82f6" }}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{p.name}</h3>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-purple-400" />
                        Prefers {p.preferred_side} Side
                      </span>
                    </div>
                  </div>

                  {/* DUPR Badge */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-right">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      DUPR
                    </span>
                    <span className="text-base font-black text-amber-300 font-mono">
                      {p.rating.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="mt-5 grid grid-cols-3 gap-2 bg-slate-950/60 rounded-xl p-3 text-center border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Played</span>
                    <span className="text-sm font-bold text-slate-200">{p.matches_played}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Won</span>
                    <span className="text-sm font-bold text-emerald-400">{p.matches_won}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Win %</span>
                    <span className="text-sm font-bold text-purple-300">{winRate}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-slate-400">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Active Competitor
                </span>
                <span>ID: #{p.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Player Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Register New Player</h3>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zane Navratil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  DUPR Rating (Skill Level)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="2.0"
                  max="7.0"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Preferred Court Side
                </label>
                <select
                  value={preferredSide}
                  onChange={(e) => setPreferredSide(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="Right">Right (Forehand dominate for righties)</option>
                  <option value="Left">Left (Stacking / Backhand)</option>
                  <option value="Any">Any Side</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 text-sm font-bold rounded-lg shadow-md"
                >
                  Save Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
