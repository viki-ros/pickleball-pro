import React, { useState } from "react";
import { UserProfile, Friend, Match } from "../types";
import { Swords, Users, User, Settings2, Play } from "lucide-react";

interface CreateMatchModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  friends: Friend[];
  initialFriend?: Friend | null;
  onClose: () => void;
  onMatchCreated: (match: Match) => void;
  onCreateMatchApi: (params: any) => Promise<Match>;
  onOpenAddFriend: () => void;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  currentUser,
  friends,
  initialFriend,
  onClose,
  onMatchCreated,
  onCreateMatchApi,
  onOpenAddFriend,
}) => {
  const [matchType, setMatchType] = useState<"singles" | "doubles">("singles");
  const [partner, setPartner] = useState<string>("");
  const [opponent1, setOpponent1] = useState<string>(initialFriend ? initialFriend.name : friends[0]?.name || "");
  const [opponent2, setOpponent2] = useState<string>(friends[1]?.name || "");
  const [targetPoints, setTargetPoints] = useState<number>(11);
  const [scoringMode, setScoringMode] = useState<"sideout" | "rally">("sideout");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (matchType === "singles") {
      if (!opponent1.trim()) {
        setError("Please choose your opponent");
        return;
      }
    } else {
      if (!partner.trim()) {
        setError("Please choose your doubles partner");
        return;
      }
      if (!opponent1.trim() || !opponent2.trim()) {
        setError("Please select both opposing players");
        return;
      }
      if (partner === opponent1 || partner === opponent2 || opponent1 === opponent2) {
        setError("Each player in doubles must be unique");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");
      const team1 = matchType === "singles" ? [currentUser.name] : [currentUser.name, partner];
      const team2 = matchType === "singles" ? [opponent1] : [opponent1, opponent2];

      const match = await onCreateMatchApi({
        title: matchType === "singles" ? `${currentUser.name} vs ${opponent1}` : `${currentUser.name} & ${partner} vs ${opponent1} & ${opponent2}`,
        match_type: matchType,
        scoring_mode: scoringMode,
        target_points: targetPoints,
        win_by: 2,
        user_phone: currentUser.phone,
        team1_player_names: team1,
        team2_player_names: team2,
      });

      onMatchCreated(match);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl my-8 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">New Match</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Set up players and scoring rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg font-bold p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {friends.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 mb-4">
            <Users className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">Add Friends First</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              You need at least 1 friend in your directory to start a singles or doubles match.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenAddFriend();
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              + Add Friend Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Singles vs Doubles Segmented Control */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Match Format
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMatchType("singles")}
                  className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    matchType === "singles"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/60"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>1 vs 1 (Singles)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMatchType("doubles")}
                  className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    matchType === "doubles"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/60"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>2 vs 2 (Doubles)</span>
                </button>
              </div>
            </div>

            {/* 2. Player Selection */}
            <div className="space-y-3.5">
              
              {/* Team 1 */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-2">
                  Team 1 (Your Team)
                </span>
                
                <div className="flex items-center justify-between mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>You ({currentUser.name})</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/40">
                    DUPR {currentUser.dupr_doubles_rating ? currentUser.dupr_doubles_rating.toFixed(2) : "3.50"}
                  </span>
                </div>

                {matchType === "doubles" && (
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      Pick Your Partner:
                    </label>
                    <select
                      value={partner}
                      onChange={(e) => setPartner(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    >
                      <option value="">-- Choose Partner from Friends --</option>
                      {friends.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name} (DUPR {f.dupr_doubles_rating ? f.dupr_doubles_rating.toFixed(2) : "3.50"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Team 2 */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-sky-400 block mb-2">
                  Team 2 (Opponents)
                </span>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      {matchType === "singles" ? "Pick Opponent:" : "Opponent 1:"}
                    </label>
                    <select
                      value={opponent1}
                      onChange={(e) => setOpponent1(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    >
                      <option value="">-- Choose Opponent --</option>
                      {friends.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name} (DUPR {f.dupr_doubles_rating ? f.dupr_doubles_rating.toFixed(2) : "3.50"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {matchType === "doubles" && (
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        Opponent 2:
                      </label>
                      <select
                        value={opponent2}
                        onChange={(e) => setOpponent2(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      >
                        <option value="">-- Choose Opponent 2 --</option>
                        {friends.map((f) => (
                          <option key={f.id} value={f.name}>
                            {f.name} (DUPR {f.dupr_doubles_rating ? f.dupr_doubles_rating.toFixed(2) : "3.50"})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* 3. Scoring Rules */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Play To
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  {[11, 15, 21].map((pts) => (
                    <button
                      type="button"
                      key={pts}
                      onClick={() => setTargetPoints(pts)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        targetPoints === pts
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/60"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {pts}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Scoring Style
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setScoringMode("sideout")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      scoringMode === "sideout"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/60"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Side-Out
                  </button>
                  <button
                    type="button"
                    onClick={() => setScoringMode("rally")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      scoringMode === "rally"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/60"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Rally
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                <span>{loading ? "Starting..." : "Start Match & Go Courtside"}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
