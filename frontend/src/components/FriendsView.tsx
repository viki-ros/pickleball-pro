import React, { useState } from "react";
import { Friend, HeadToHeadStat } from "../types";
import { UserPlus, Phone, Trash2, Swords, Sparkles, UserCheck } from "lucide-react";

interface FriendsViewProps {
  friends: Friend[];
  headToHeadStats: HeadToHeadStat[];
  onAddFriend: (name: string, phone: string, skill: "Casual" | "Intermediate" | "Advanced") => void;
  onDeleteFriend: (id: string) => void;
  onStartMatchWithFriend: (friend: Friend) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  friends,
  headToHeadStats,
  onAddFriend,
  onDeleteFriend,
  onStartMatchWithFriend,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [skill, setSkill] = useState<"Casual" | "Intermediate" | "Advanced">("Casual");
  const [error, setError] = useState<string>("");

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
    onAddFriend(name.trim(), phone.trim(), skill);
    setName("");
    setPhone("");
    setSkill("Casual");
    setShowAddModal(false);
  };

  const getH2H = (friendName: string) => {
    return headToHeadStats.find(
      (h) => h.friend_name.toLowerCase() === friendName.toLowerCase()
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Header bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Friends Directory</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {friends.length} {friends.length === 1 ? "friend" : "friends"}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Add your pickleball playing partners and opponents using their mobile number.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Friend</span>
        </button>
      </div>

      {/* Friends Cards Grid */}
      {friends.length === 0 ? (
        <div className="text-center py-16 px-6 bg-slate-900/60 border border-slate-800 rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-3">
            👥
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Friends Added Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Add friends using their name and mobile number to quickly pick them for singles or doubles matches and track your head-to-head records.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
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
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm"
                        style={{ backgroundColor: friend.avatar_color || "#3b82f6" }}
                      >
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white tracking-tight">
                          {friend.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{friend.phone}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteFriend(friend.id)}
                      title="Remove Friend"
                      className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Skill level and H2H badge */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                      {friend.skill_level || "Casual"}
                    </span>

                    {h2h && h2h.matches_played > 0 ? (
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        {h2h.wins}W - {h2h.losses}L vs you ({h2h.win_rate}%)
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">
                        No matches played yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Start Match Action */}
                <div className="mt-5 pt-3 border-t border-slate-800/60">
                  <button
                    onClick={() => onStartMatchWithFriend(friend)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group-hover:bg-slate-800/80"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Start Match With {friend.name.split(" ")[0]}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <span>Add a Playing Partner</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Friend's Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dave Miller"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all placeholder:text-slate-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0144 or 9876543210"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Skill Level (Optional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Casual", "Intermediate", "Advanced"] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setSkill(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        skill === lvl
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
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
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg active:scale-95"
                >
                  Save Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
