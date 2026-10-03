import React, { useState } from "react";
import { Friend, HeadToHeadStat } from "../types";
import { UserPlus, Phone, Trash2, Swords, Award, ExternalLink, UserCheck, RefreshCw, Shield } from "lucide-react";
import { verifyDuprPlayer } from "../services/api";

interface FriendsViewProps {
  friends: Friend[];
  headToHeadStats: HeadToHeadStat[];
  onAddFriend: (
    name: string,
    phone: string,
    skill: "Casual" | "Intermediate" | "Advanced",
    duprId?: string,
    doublesRating?: number,
    singlesRating?: number
  ) => void;
  onDeleteFriend: (id: string) => void;
  onStartMatchWithFriend: (friend: Friend) => void;
  onSyncFriendRating?: (friendId: string, duprId: string) => Promise<void> | void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  friends,
  headToHeadStats,
  onAddFriend,
  onDeleteFriend,
  onStartMatchWithFriend,
  onSyncFriendRating,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [syncingFriendId, setSyncingFriendId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [skill, setSkill] = useState<"Casual" | "Intermediate" | "Advanced">("Casual");
  const [duprId, setDuprId] = useState<string>("");
  const [doublesRating, setDoublesRating] = useState<number>(3.5);
  const [singlesRating, setSinglesRating] = useState<number>(3.5);
  const [error, setError] = useState<string>("");

  const handleDuprLookup = async () => {
    if (!duprId.trim()) return;
    try {
      const res = await verifyDuprPlayer(duprId);
      setDoublesRating(res.doublesRating);
      setSinglesRating(res.singlesRating);
    } catch {}
  };

  const handleSyncFriend = async (friendId: string, fDuprId: string) => {
    if (!onSyncFriendRating) return;
    try {
      setSyncingFriendId(friendId);
      await onSyncFriendRating(friendId, fDuprId);
    } finally {
      setSyncingFriendId(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a friend name");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter their mobile number");
      return;
    }
    setError("");
    onAddFriend(
      name.trim(),
      phone.trim(),
      skill,
      duprId.trim() || undefined,
      doublesRating,
      singlesRating
    );
    setName("");
    setPhone("");
    setDuprId("");
    setSkill("Casual");
    setDoublesRating(3.5);
    setSinglesRating(3.5);
    setShowAddModal(false);
  };

  const getH2H = (friendName: string) => {
    return headToHeadStats.find(
      (h) => h.friend_name.toLowerCase() === friendName.toLowerCase()
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in pb-16">
      
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Friends Directory</span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {friends.length} {friends.length === 1 ? "friend" : "friends"}
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Add partners by mobile number and track their official DUPR ratings.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Friend</span>
        </button>
      </div>

      {/* Friends Cards Grid */}
      {friends.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-3">
            👥
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Friends Added Yet</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6">
            Add friends using their name and mobile number to quickly pick them for matches and compare DUPR ratings.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Your First Friend</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {friends.map((friend) => {
            const h2h = getH2H(friend.name);
            const initials = friend.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={friend.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-xs hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-xs"
                        style={{ backgroundColor: friend.avatar_color || "#3b82f6" }}
                      >
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                          {friend.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{friend.phone}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteFriend(friend.id)}
                      title="Remove Friend"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Skill level, DUPR Badge, and H2H */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* DUPR Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono">
                      <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>DUPR {friend.dupr_doubles_rating ? friend.dupr_doubles_rating.toFixed(2) : "3.50"}</span>
                      {friend.dupr_id && onSyncFriendRating && (
                        <button
                          onClick={() => handleSyncFriend(friend.id, friend.dupr_id!)}
                          title="Sync latest DUPR rating"
                          className="ml-0.5 p-0.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncingFriendId === friend.id ? "animate-spin" : ""}`} />
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {friend.skill_level || "Casual"}
                    </span>

                    {h2h && h2h.matches_played > 0 ? (
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-400/20">
                        {h2h.wins}W - {h2h.losses}L vs you
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Quick Start Match Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onStartMatchWithFriend(friend)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-500 dark:hover:text-slate-950 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-200/80 dark:border-slate-700"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Play With {friend.name.split(" ")[0]}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl my-8 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Add Playing Partner</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Friend's Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dave Miller"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-600 dark:focus:border-emerald-500 rounded-xl py-3 px-4 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0144 or 9876543210"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-600 dark:focus:border-emerald-500 rounded-xl py-3 px-4 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* DUPR Link for Friend */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Friend's DUPR Rating (Optional)</span>
                  </label>
                  <a
                    href="https://mydupr.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-slate-500 hover:text-blue-600 flex items-center gap-0.5"
                  >
                    <span>DUPR Search</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={duprId}
                    onChange={(e) => setDuprId(e.target.value)}
                    placeholder="DUPR ID (e.g. DUPR-4910)"
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleDuprLookup}
                    className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-500/30 transition-colors"
                  >
                    Verify
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Doubles DUPR:</span>
                  <input
                    type="number"
                    step="0.01"
                    min="2.0"
                    max="6.5"
                    value={doublesRating}
                    onChange={(e) => setDoublesRating(parseFloat(e.target.value) || 3.5)}
                    className="w-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-right text-xs font-bold text-blue-700 dark:text-blue-400 font-mono"
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline shrink-0" />
                  <span>Only player rating is synced. Match scores are never sent to DUPR.</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Skill Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Casual", "Intermediate", "Advanced"] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => {
                        setSkill(lvl);
                        if (!duprId) {
                          setDoublesRating(lvl === "Advanced" ? 4.25 : lvl === "Intermediate" ? 3.75 : 3.0);
                        }
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        skill === lvl
                          ? "bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-500 dark:text-slate-950"
                          : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-xs active:scale-95"
                >
                  Save Friend & Link DUPR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
