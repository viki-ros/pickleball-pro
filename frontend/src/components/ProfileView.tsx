import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { Phone, LogOut, Smartphone, Award, ExternalLink, RefreshCw, Shield, Edit3, Check, X, KeyRound, Key, CheckCircle2, Lock } from "lucide-react";
import { saveUserProfile, syncUserDupr, fetchDuprPlayer, connectDuprAccount, getDuprStatus } from "../services/api";

interface ProfileViewProps {
  currentUser: UserProfile;
  onEditProfile: () => void;
  onLogout: () => void;
  onResetAllData: () => void;
  onUserUpdated?: (updated: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onEditProfile,
  onLogout,
  onResetAllData,
  onUserUpdated,
}) => {
  // Syncing state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>("");

  // Link/Change DUPR ID Modal state (NO MANUAL RATING ENTRY)
  const [showLinkIdModal, setShowLinkIdModal] = useState<boolean>(false);
  const [newDuprId, setNewDuprId] = useState<string>(currentUser.dupr_id || "");
  const [isFetchingNewId, setIsFetchingNewId] = useState<boolean>(false);
  const [linkError, setLinkError] = useState<string>("");

  // DUPR API Connection state
  const [apiStatus, setApiStatus] = useState<{ connected: boolean; auth_type: string }>({ connected: false, auth_type: "none" });
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [connectEmail, setConnectEmail] = useState<string>("");
  const [connectPassword, setConnectPassword] = useState<string>("");
  const [connectToken, setConnectToken] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string>("");

  useEffect(() => {
    checkDuprApiStatus();
  }, []);

  const checkDuprApiStatus = async () => {
    try {
      const status = await getDuprStatus();
      setApiStatus({ connected: status.connected, auth_type: status.auth_type });
    } catch (e) {}
  };

  const handleAutoSyncDupr = async () => {
    if (!currentUser.dupr_id) {
      setShowLinkIdModal(true);
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg("");

    try {
      const updated = await syncUserDupr(currentUser.phone);
      if (updated && onUserUpdated) {
        onUserUpdated(updated);
      }

      // Also do direct fetch to confirm latest data
      const lookup = await fetchDuprPlayer(currentUser.dupr_id);
      if (lookup.status === "SUCCESS") {
        setSyncStatusMsg("✓ Official DUPR ratings refreshed directly from DUPR API!");
        if (lookup.doubles_rating !== undefined && lookup.singles_rating !== undefined) {
          const synced = await saveUserProfile(
            currentUser.name,
            currentUser.phone,
            currentUser.dupr_id,
            lookup.doubles_rating,
            lookup.singles_rating
          );
          if (onUserUpdated) onUserUpdated(synced);
        }
      } else if (lookup.status === "AUTH_REQUIRED") {
        setSyncStatusMsg("DUPR Account connection required to pull live ratings.");
        setShowConnectModal(true);
      } else {
        setSyncStatusMsg(lookup.message || "Synced with latest verified database profile.");
      }
    } catch (e: any) {
      setSyncStatusMsg("Network error contacting DUPR API.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatusMsg(""), 5000);
    }
  };

  const handleLinkNewDuprIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newDuprId.trim().toUpperCase();
    if (!clean || clean.length < 3) {
      setLinkError("Please enter a valid DUPR ID (at least 3 characters)");
      return;
    }

    setLinkError("");
    setIsFetchingNewId(true);

    try {
      const res = await fetchDuprPlayer(clean);
      if (res.status === "SUCCESS" && (res.doubles_rating !== undefined || res.singles_rating !== undefined)) {
        const updated = await saveUserProfile(
          currentUser.name,
          currentUser.phone,
          clean,
          res.doubles_rating || currentUser.dupr_doubles_rating,
          res.singles_rating || currentUser.dupr_singles_rating
        );
        if (onUserUpdated) onUserUpdated(updated);
        setShowLinkIdModal(false);
        setSyncStatusMsg(`✓ Linked DUPR ID ${clean} with official rating ${res.doubles_rating?.toFixed(2)}`);
      } else if (res.status === "AUTH_REQUIRED") {
        // Still link the ID, user can connect DUPR API to pull live ratings
        const updated = await saveUserProfile(
          currentUser.name,
          currentUser.phone,
          clean,
          currentUser.dupr_doubles_rating,
          currentUser.dupr_singles_rating
        );
        if (onUserUpdated) onUserUpdated(updated);
        setShowLinkIdModal(false);
        setSyncStatusMsg(`DUPR ID ${clean} saved. Connect DUPR API for live automatic sync.`);
        setShowConnectModal(true);
      } else if (res.status === "NOT_FOUND") {
        setLinkError(`DUPR ID "${clean}" was not found on DUPR. Please check the ID.`);
      } else {
        setLinkError(res.message || "Could not fetch rating for this DUPR ID.");
      }
    } catch (err: any) {
      setLinkError("Failed to fetch DUPR profile.");
    } finally {
      setIsFetchingNewId(false);
    }
  };

  const handleConnectDuprSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectError("");

    try {
      const payload: any = {};
      if (connectToken.trim()) {
        payload.token = connectToken.trim();
      } else if (connectEmail.trim() && connectPassword.trim()) {
        payload.email = connectEmail.trim();
        payload.password = connectPassword.trim();
      } else {
        setConnectError("Please enter email & password or direct token.");
        setIsConnecting(false);
        return;
      }

      const res = await connectDuprAccount(payload);
      if (res.status === "SUCCESS") {
        await checkDuprApiStatus();
        setShowConnectModal(false);
        setSyncStatusMsg("✓ Connected to DUPR successfully! Auto-syncing...");
        // Auto-refresh ratings
        setTimeout(() => handleAutoSyncDupr(), 300);
      } else {
        setConnectError(res.message || "Authentication failed. Check your credentials.");
      }
    } catch (err: any) {
      setConnectError("Connection error.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in pb-16">
      
      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-xs transition-colors">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center font-bold text-white text-3xl shadow-xs mx-auto mb-4"
          style={{ backgroundColor: currentUser.avatar_color || "#059669" }}
        >
          {currentUser.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {currentUser.name}
        </h2>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{currentUser.phone}</span>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={onEditProfile}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold text-xs uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700 active:scale-95 flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-300 font-bold text-xs uppercase tracking-wider transition-all border border-rose-200 dark:border-rose-500/20 active:scale-95 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Account</span>
          </button>
        </div>
      </div>

      {/* Official DUPR Rating Card: Auto-Synced via DUPR API */}
      <div className="bg-blue-50/40 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 border border-blue-200 dark:border-blue-500/30 rounded-3xl p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>Player DUPR Ratings</span>
                {currentUser.dupr_id ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ID: {currentUser.dupr_id}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                    Not Linked
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Auto-updated directly from official Dynamic Universal Pickleball Rating API
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConnectModal(true)}
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1 transition-colors ${
              apiStatus.connected
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 text-emerald-700 dark:text-emerald-400"
                : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${apiStatus.connected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            <span>{apiStatus.connected ? "DUPR API Connected" : "Connect DUPR"}</span>
          </button>
        </div>

        {/* DUPR Ratings Display (Zero Manual Entry) */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center relative overflow-hidden">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
              Doubles DUPR
            </span>
            <span className="text-3xl font-black text-blue-700 dark:text-blue-400 font-mono tracking-tight">
              {currentUser.dupr_doubles_rating ? currentUser.dupr_doubles_rating.toFixed(2) : "3.50"}
            </span>
            <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1 mt-1 font-mono">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Official Rating</span>
            </span>
          </div>

          <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center relative overflow-hidden">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
              Singles DUPR
            </span>
            <span className="text-3xl font-black text-sky-700 dark:text-sky-400 font-mono tracking-tight">
              {currentUser.dupr_singles_rating ? currentUser.dupr_singles_rating.toFixed(2) : "3.50"}
            </span>
            <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1 mt-1 font-mono">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Official Rating</span>
            </span>
          </div>
        </div>

        {/* Status Notification */}
        {syncStatusMsg && (
          <div className="p-3 mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold text-center animate-fade-in flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* Actions: Auto-Sync and Link/Change DUPR ID */}
        <div className="flex gap-2">
          <button
            onClick={handleAutoSyncDupr}
            disabled={isSyncing}
            className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing from DUPR API..." : "Auto-Update from DUPR"}</span>
          </button>

          <button
            onClick={() => {
              setNewDuprId(currentUser.dupr_id || "");
              setLinkError("");
              setShowLinkIdModal(true);
            }}
            className="py-3 px-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{currentUser.dupr_id ? "Change ID" : "Link ID"}</span>
          </button>

          <a
            href="https://dashboard.dupr.com"
            target="_blank"
            rel="noreferrer"
            className="py-3 px-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center"
            title="Open mydupr.com"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Privacy & No-Manual-Entry Assurance */}
        <div className="mt-4 p-3.5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Authentic Official Ratings (No Manual Rating Entry)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Ratings are fetched automatically using your DUPR Member ID directly from DUPR servers. Match scores are strictly local and private, and are never submitted to DUPR.
          </p>
        </div>

      </div>

      {/* Modal: Link or Change DUPR ID (Zero Manual Rating Input) */}
      {showLinkIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl my-8 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Link DUPR Member ID</span>
              </h3>
              <button
                onClick={() => setShowLinkIdModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter your official DUPR ID. The app will automatically connect to DUPR API to fetch and update your official doubles & singles ratings with no manual entry required.
            </p>

            {linkError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center">
                {linkError}
              </div>
            )}

            <form onSubmit={handleLinkNewDuprIdSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Official DUPR Member ID
                </label>
                <input
                  type="text"
                  value={newDuprId}
                  onChange={(e) => setNewDuprId(e.target.value.toUpperCase())}
                  placeholder="e.g. 7GK482 or ABC123"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400 font-mono font-bold"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isFetchingNewId || !newDuprId.trim()}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingNewId ? "animate-spin" : ""}`} />
                  <span>{isFetchingNewId ? "Fetching from DUPR API..." : "Auto-Fetch & Link"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkIdModal(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Connect DUPR Account / API */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl my-8 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Connect DUPR Account</span>
              </h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Log in with your official DUPR account or enter a Bearer token. This allows the backend to communicate directly with official DUPR servers to auto-update player ratings.
            </p>

            {connectError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center">
                {connectError}
              </div>
            )}

            <form onSubmit={handleConnectDuprSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  DUPR Email
                </label>
                <input
                  type="email"
                  value={connectEmail}
                  onChange={(e) => setConnectEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  DUPR Password
                </label>
                <input
                  type="password"
                  value={connectPassword}
                  onChange={(e) => setConnectPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div className="text-[10px] text-center text-slate-400 uppercase tracking-wider font-bold py-1">
                — or use direct token / partner key —
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  DUPR Bearer Token (Optional)
                </label>
                <input
                  type="text"
                  value={connectToken}
                  onChange={(e) => setConnectToken(e.target.value)}
                  placeholder="JWT Bearer token"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white text-xs font-mono outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isConnecting ? "Connecting..." : "Authenticate with DUPR"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* App & Mobile Tips */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Mobile Courtside Installation</span>
        </h3>
        
        <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">🍏 On iPhone (Safari)</span>
            Tap the <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Share</span> icon, then select <span className="text-slate-900 dark:text-white font-semibold">"Add to Home Screen"</span>.
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">🤖 On Android (Chrome)</span>
            Tap the <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Three Dots</span>, then tap <span className="text-slate-900 dark:text-white font-semibold">"Install App"</span>.
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-5 text-center">
        <button
          onClick={onResetAllData}
          className="text-xs text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5 mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset app demo data to fresh install</span>
        </button>
      </div>

    </div>
  );
};
