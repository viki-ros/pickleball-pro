import React, { useState } from "react";
import { Friend, HeadToHeadStat } from "../types";
import { UserPlus, Phone, Trash2, Swords, Award, ExternalLink, UserCheck, Shield, Edit3, Check, X, RefreshCw, CheckCircle2, Lock } from "lucide-react";
import { fetchDuprPlayer, syncFriendDupr } from "../services/api";

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

  // Add form state (NO MANUAL RATING ENTRY)
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [skill, setSkill] = useState<"Casual" | "Intermediate" | "Advanced">("Casual");
  const [duprId, setDuprId] = useState<string>("");
  const [doublesRating, setDoublesRating] = useState<number>(3.5);
  const [singlesRating, setSinglesRating] = useState<number>(3.5);
  const [error, setError] = useState<string>("");
  const [isFetchingAddDupr, setIsFetchingAddDupr] = useState<boolean>(false);
  const [addDuprMsg, setAddDuprMsg] = useState<string>("");

  // Edit form state (NO MANUAL RATING ENTRY)
  const [editName, setEditName] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editSkill, setEditSkill] = useState<"Casual" | "Intermediate" | "Advanced">("Casual");
  const [editDuprId, setEditDuprId] = useState<string>("");
  const [editDoublesRating, setEditDoublesRating] = useState<number>(3.5);
  const [editSinglesRating, setEditSinglesRating] = useState<number>(3.5);
  const [isFetchingEditDupr, setIsFetchingEditDupr] = useState<boolean>(false);
  const [editDuprMsg, setEditDuprMsg] = useState<string>("");

  // Card Quick Sync state
  const [syncingFriendId, setSyncingFriendId] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<{ id: string; message: string } | null>(null);

  const openEditModal = (friend: Friend) => {
    setEditingFriend(friend);
    setEditName(friend.name);
    setEditPhone(friend.phone);
    setEditSkill((friend.skill_level as any) || "Casual");
    setEditDuprId(friend.dupr_id || "");
    setEditDoublesRating(friend.dupr_doubles_rating || 3.5);
    setEditSinglesRating(friend.dupr_singles_rating || 3.5);
    setEditDuprMsg("");
  };

  const handleAutoFetchAddDupr = async () => {
    const clean = duprId.trim().toUpperCase();
    if (!clean || clean.length < 3) {
      setError("Please enter a valid DUPR ID (at least 3 characters)");
      return;
    }
    setError("");
    setIsFetchingAddDupr(true);
    setAddDuprMsg("Contacting DUPR API...");

    try {
      const res = await fetchDuprPlayer(clean);
      if (res.status === "SUCCESS") {
        if (res.doubles_rating !== undefined) setDoublesRating(res.doubles_rating);
        if (res.singles_rating !== undefined) setSinglesRating(res.singles_rating);
        if (!name.trim() && res.name) setName(res.name);
        setAddDuprMsg(`✓ Verified: ${res.name || clean} (Official DUPR)`);
      } else if (res.status === "AUTH_REQUIRED") {
        setAddDuprMsg("DUPR ID linked. Ratings auto-sync when DUPR API is connected.");
      } else if (res.status === "NOT_FOUND") {
        setAddDuprMsg(`DUPR ID "${clean}" not found on DUPR.`);
      } else {
        setAddDuprMsg(res.message || "Could not retrieve rating.");
      }
    } catch (e) {
      setAddDuprMsg("Connection failed.");
    } finally {
      setIsFetchingAddDupr(false);
    }
  };

  const handleAutoFetchEditDupr = async () => {
    const clean = editDuprId.trim().toUpperCase();
    if (!clean || clean.length < 3) {
      return;
    }
    setIsFetchingEditDupr(true);
    setEditDuprMsg("Contacting DUPR API...");

    try {
      const res = await fetchDuprPlayer(clean);
      if (res.status === "SUCCESS") {
        if (res.doubles_rating !== undefined) setEditDoublesRating(res.doubles_rating);
        if (res.singles_rating !== undefined) setEditSinglesRating(res.singles_rating);
        setEditDuprMsg(`✓ Refreshed from DUPR API: ${res.name || clean}`);
      } else if (res.status === "AUTH_REQUIRED") {
        setEditDuprMsg("DUPR account connection required to pull live official rating.");
      } else {
        setEditDuprMsg(res.message || "Could not fetch rating.");
      }
    } catch (e) {
      setEditDuprMsg("Connection error.");
    } finally {
      setIsFetchingEditDupr(false);
    }
  };

  const handleQuickSyncFriend = async (friend: Friend, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!friend.dupr_id) {
      openEditModal(friend);
      return;
    }

    setSyncingFriendId(friend.id);
    try {
      const updated = await syncFriendDupr(friend.id, friend.dupr_id);
      if (updated && onUpdateFriend) {
        onUpdateFriend(friend.id, updated);
      }
      setSyncToast({ id: friend.id, message: "✓ Official DUPR ratings refreshed" });
      setTimeout(() => setSyncToast(null), 3000);
    } catch (err) {
      setSyncToast({ id: friend.id, message: "Sync error" });
      setTimeout(() => setSyncToast(null), 3000);
    } finally {
      setSyncingFriendId(null);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFriend || !onUpdateFriend) return;
    onUpdateFriend(editingFriend.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      skill_level: editSkill,
      dupr_id: editDuprId.trim().toUpperCase() || undefined,
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
      duprId.trim().toUpperCase() || undefined,
      doublesRating,
      singlesRating
    );
    setName("");
    setPhone("");
    setSkill("Casual");
    setDuprId("");
    setDoublesRating(3.5);
    setSinglesRating(3.5);
    setAddDuprMsg("");
    setShowAddModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
              👥
            </span>
            <span>Friends & Players Directory</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Manage your playing partners with authentic DUPR ratings synced via official DUPR API.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setAddDuprMsg("");
            setShowAddModal(true);
          }}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Friend</span>
        </button>
      </div>

      {/* Friends Cards Grid */}
      {friends.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-2xl mx-auto">
            🎾
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Friends Added Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Add your regular pickleball partners with their DUPR ID. Ratings are synced directly from DUPR API without manual entry.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            Add Your First Partner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((friend) => {
            const h2h = headToHeadStats.find((s) => s.friend_phone === friend.phone);
            const isSyncingThis = syncingFriendId === friend.id;

            return (
              <div
                key={friend.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs transition-colors flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-xs shrink-0"
                        style={{ backgroundColor: friend.avatar_color || "#3b82f6" }}
                      >
                        {friend.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                          {friend.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{friend.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(friend)}
                        title="Edit friend details or DUPR ID"
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteFriend(friend.id)}
                        title="Delete friend"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Skill level, DUPR Badge, and H2H */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* Official DUPR Badge with Quick-Sync */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>DUPR {friend.dupr_doubles_rating ? friend.dupr_doubles_rating.toFixed(2) : "3.50"}</span>
                      {friend.dupr_id ? (
                        <span className="text-[10px] text-blue-500 font-normal">({friend.dupr_id})</span>
                      ) : null}

                      {/* Quick Auto-Sync Button */}
                      <button
                        onClick={(e) => handleQuickSyncFriend(friend, e)}
                        disabled={isSyncingThis}
                        title={friend.dupr_id ? "Auto-sync rating from DUPR API" : "Link DUPR ID"}
                        className="ml-1 p-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors text-blue-600 dark:text-blue-400"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncingThis ? "animate-spin" : ""}`} />
                      </button>
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

                  {syncToast && syncToast.id === friend.id && (
                    <div className="mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 animate-fade-in flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{syncToast.message}</span>
                    </div>
                  )}
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

      {/* Edit Friend Modal (NO MANUAL RATING ENTRY) */}
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Friend's Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Skill Level
                </label>
                <select
                  value={editSkill}
                  onChange={(e) => setEditSkill(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none"
                >
                  <option value="Casual">Casual (Rec)</option>
                  <option value="Intermediate">Intermediate (3.0 - 3.5)</option>
                  <option value="Advanced">Advanced (4.0+)</option>
                </select>
              </div>

              {/* DUPR Link for Friend (Auto-Sync Only) */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Official DUPR Member ID</span>
                  </label>
                  <a
                    href="https://dashboard.dupr.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5 font-semibold"
                  >
                    <span>mydupr.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editDuprId}
                    onChange={(e) => {
                      setEditDuprId(e.target.value.toUpperCase());
                      setEditDuprMsg("");
                    }}
                    placeholder="DUPR ID (e.g. 7GK482)"
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAutoFetchEditDupr}
                    disabled={isFetchingEditDupr || !editDuprId.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <RefreshCw className={`w-3 h-3 ${isFetchingEditDupr ? "animate-spin" : ""}`} />
                    <span>Auto-Sync</span>
                  </button>
                </div>

                {editDuprMsg && (
                  <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {editDuprMsg}
                  </div>
                )}

                {/* Read-only ratings display */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5 flex items-center justify-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Doubles DUPR
                    </span>
                    <span className="text-base font-black text-blue-700 dark:text-blue-400 font-mono">
                      {editDoublesRating ? editDoublesRating.toFixed(2) : "3.50"}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5 flex items-center justify-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Singles DUPR
                    </span>
                    <span className="text-base font-black text-sky-700 dark:text-sky-400 font-mono">
                      {editSinglesRating ? editSinglesRating.toFixed(2) : "3.50"}
                    </span>
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

      {/* Add Friend Modal (NO MANUAL RATING ENTRY) */}
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Skill Level
                </label>
                <select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-600 dark:focus:border-emerald-500 rounded-xl py-3 px-4 text-slate-900 dark:text-white text-sm outline-none"
                >
                  <option value="Casual">Casual (Recreational)</option>
                  <option value="Intermediate">Intermediate (3.0 - 3.5)</option>
                  <option value="Advanced">Advanced (4.0+)</option>
                </select>
              </div>

              {/* DUPR Link for Friend (Auto-Fetch Only, Zero Manual Entry) */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Friend's DUPR ID (Optional)</span>
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

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={duprId}
                    onChange={(e) => {
                      setDuprId(e.target.value.toUpperCase());
                      setAddDuprMsg("");
                    }}
                    placeholder="DUPR ID (e.g. 7GK482)"
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAutoFetchAddDupr}
                    disabled={isFetchingAddDupr || !duprId.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <RefreshCw className={`w-3 h-3 ${isFetchingAddDupr ? "animate-spin" : ""}`} />
                    <span>Auto-Fetch</span>
                  </button>
                </div>

                {addDuprMsg && (
                  <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {addDuprMsg}
                  </div>
                )}

                {/* Read-Only Verified Rating Preview */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5 flex items-center justify-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Doubles DUPR
                    </span>
                    <span className="text-base font-black text-blue-700 dark:text-blue-400 font-mono">
                      {doublesRating ? doublesRating.toFixed(2) : "3.50"}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-0.5 flex items-center justify-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Singles DUPR
                    </span>
                    <span className="text-base font-black text-sky-700 dark:text-sky-400 font-mono">
                      {singlesRating ? singlesRating.toFixed(2) : "3.50"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Save Partner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assurance banner */}
      <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          Player ratings are fetched directly via official DUPR API endpoints. Scores from personal and practice matches stay strictly private and are never submitted to DUPR.
        </p>
      </div>

    </div>
  );
};
