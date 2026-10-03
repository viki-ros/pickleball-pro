import React from "react";
import { UserProfile, UserOverallStats, Match } from "../types";
import { Trophy, TrendingUp, Flame, Swords, Calendar } from "lucide-react";

interface StatsViewProps {
  currentUser: UserProfile;
  stats: UserOverallStats;
  onSelectMatch?: (match: Match) => void;
  onStartNewMatch: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  currentUser,
  stats,
  onSelectMatch,
  onStartNewMatch,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in pb-16">
      
      {/* Top Banner: User Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-xs"
              style={{ backgroundColor: currentUser.avatar_color || "#059669" }}
            >
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currentUser.name}'s Match Record
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Mobile: {currentUser.phone}
              </p>
            </div>
          </div>

          <button
            onClick={onStartNewMatch}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 self-start sm:self-auto"
          >
            + Create Match
          </button>
        </div>

        {/* 4 Summary Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1">
              <Swords className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Matches</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {stats.total_matches}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.wins}W - {stats.losses}L
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Win Rate</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {stats.win_rate}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Career percentage
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Streak</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-center gap-1">
              {stats.streak > 0 && <span className="text-amber-500">🔥</span>}
              <span>{stats.streak} {stats.streak === 1 ? "Win" : "Wins"}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Current active streak
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1">
              <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Points</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {stats.points_scored}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Conceded: {stats.points_conceded}
            </div>
          </div>

        </div>
      </div>

      {/* Head-to-Head vs Friends */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1 flex items-center gap-2">
          <span>Head-to-Head Records</span>
          <span className="text-xs text-slate-500 font-normal">
            ({stats.head_to_head.length} opponents played)
          </span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Compare your record against individual partners and opponents.
        </p>

        {stats.head_to_head.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <p className="text-xs text-slate-500">
              No head-to-head match history recorded yet. Finish a match to view stats!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.head_to_head.map((h, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{h.friend_name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {h.matches_played} {h.matches_played === 1 ? "match" : "matches"} played
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    {h.wins}W - {h.losses}L
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {h.win_rate}% Win Rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Match History Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">
          Recent Match History
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Complete log of completed games and scores.
        </p>

        {stats.history.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <p className="text-xs text-slate-500">
              No matches completed yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {stats.history.map((m) => {
              const isTeam1 = m.team1_player_names?.some(
                (n) => n.toLowerCase() === currentUser.name.toLowerCase() || n.toLowerCase() === "you"
              );
              const won = (isTeam1 && m.winner_team === 1) || (!isTeam1 && m.winner_team === 2);
              const dateStr = new Date(m.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMatch && onSelectMatch(m)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded-xl tracking-wider ${
                        won
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                          : "bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                      }`}
                    >
                      {won ? "WIN" : "LOSS"}
                    </span>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {m.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span className="capitalize">{m.match_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                      {m.score_team1} - {m.score_team2}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                      Final Score
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
