import React, { useState } from "react";
import { Friend, HeadToHeadStat } from "../types";
import { UserPlus, Phone, Trash2, Swords, Award, ExternalLink, UserCheck, Shield, Edit3, Check, X } from "lucide-react";

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
  onUpdateFriend?: (friendId: string, data: Partial<Friend>) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  friends,
  headToHeadStats,
  onAddFriend,
  onDeleteFriend,
  onStartMatchWithFriend,
  onUpdateFriend,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);

  // Add form state
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [skill, setSkill] = useState<"Casual" | "Intermediate" | "Advanced">("Casual");
  const [duprId, setDuprId] = useState<string>("");
  const [doublesRating, setDoublesRating] = useState<number>(3.5);
  const [singlesRating, setSinglesRating] = useState<number>(3.5);
  const [error, setError] = useState<string>("");

  // Edit form state
  const [editName, setEditName] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editSkill, setEditSkill] = useState<"Casual" | "Intermediate" | "Advanced">("Casual");
  const [editDuprId, setEditDuprId] = useState<string>("");
  const [editDoublesRating, setEditDoublesRating] = useState<number>(3.5);
  const [editSinglesRating, setEditSinglesRating] = useState<number>(3.5);

  const openEditModal = (friend: Friend) => {
    setEditingFriend(friend);
    setEditName(friend.name);
    setEditPhone(friend.phone);
    setEditSkill((friend.skill_level as any) || "Casual");
    setEditDuprId(friend.dupr_id || "");
    setEditDoublesRating(friend.dupr_doubles_rating || 3.5);
    setEditSinglesRating(friend.dupr_singles_rating || 3.5);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFriend || !onUpdateFriend) return;
    onUpdateFriend(editingFriend.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      skill_level: editSkill,
      dupr_id: editDuprId.trim() || undefined,
      dupr_doubles_rating: editDoublesRating,
      dupr_singles_rating: editSinglesRating,
      dupr_verified: Boolean(editDuprId.trim()),
    });
    setEditingFriend(null);
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
    setDoublesRating(3.5);
    setSinglesRating(3.5);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Playing Partners & Friends
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Manage partners and preserve their official DUPR ratings.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Friend</span>
        </button>
      </div>

      {/* Friends Cards Grid */}
      {friends.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-3xl mx-auto mb-3">
            👥
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            No Friends Added Yet
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
            Add friends using their name and mobile number to quickly pick them for matches and display their authentic DUPR ratings.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
          >
            + Add First Friend
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((friend) => {
            const h2h = headToHeadStats.find((s) => s.friend_name === friend.name);
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

                    <div className="flex items-center gap-1">
                      {onUpdateFriend && (
                        <button
                          onClick={() => openEditModal(friend)}
                          title="Edit Friend / DUPR Rating"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteFriend(friend.id)}
                        title="Remove Friend"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Skill level, DUPR Badge, and H2H */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* DUPR Badge */}
                    <div
                      onClick={() => onUpdateFriend && openEditModal(friend)}
                      title="Click to edit DUPR rating"
                      className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>DUPR {friend.dupr_doubles_rating ? friend.dupr_doubles_rating.toFixed(2) : "3.50"}</span>
                      {friend.dupr_id && (
                        <span className="text-[10px] text-blue-500 font-normal">({friend.dupr_id})</span>
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

      {/* Edit Friend Modal */}
      {editingFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl my-8 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Edit Friend & DUPR</span>
              </h3>
              <button
                onClick={() => setEditingFriend(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-900 dark:text-white text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-900 dark:text-white text-sm outline-none"
                  required
                />
              </div>

              {/* DUPR Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Official DUPR Information</span>
                  </label>
                  <a
                    href="https://dashboard.dupr.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5 font-semibold"
                  >
                    <span>Check mydupr.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div>
                  <input
                    type="text"
                    value={editDuprId}
                    onChange={(e) => setEditDuprId(e.target.value)}
                    placeholder="DUPR Member ID (e.g. DUPR-4910)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">
                      Doubles DUPR
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.0"
                      max="7.0"
                      value={editDoublesRating}
                      onChange={(e) => setEditDoublesRating(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-blue-700 dark:text-blue-400 font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">
                      Singles DUPR
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.0"
                      max="7.0"
                      value={editSinglesRating}
                      onChange={(e) => setEditSinglesRating(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-sky-700 dark:text-sky-400 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingFriend(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
                  placeholder="e.g. Marcus Miller"
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
                    href="https://dashboard.dupr.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5 font-semibold"
                  >
                    <span>Check mydupr.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div>
                  <input
                    type="text"
                    value={duprId}
                    onChange={(e) => setDuprId(e.target.value)}
                    placeholder="DUPR ID (e.g. DUPR-4910)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">
                      Doubles DUPR
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.0"
                      max="7.0"
                      value={doublesRating}
                      onChange={(e) => setDoublesRating(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-blue-700 dark:text-blue-400 font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">
                      Singles DUPR
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.0"
                      max="7.0"
                      value={singlesRating}
                      onChange={(e) => setSinglesRating(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-sky-700 dark:text-sky-400 font-mono outline-none"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline shrink-0" />
                  <span>Enter their authentic rating from DUPR. Never faked or estimated.</span>
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
                          const baseRating = lvl === "Advanced" ? 4.25 : lvl === "Intermediate" ? 3.75 : 3.0;
                          setDoublesRating(baseRating);
                          setSinglesRating(baseRating);
                        }
                      }}
                      className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                        skill === lvl
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950"
                          : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900"
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
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95"
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
