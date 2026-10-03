import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { Phone, User, ArrowRight, ShieldCheck, Award, ExternalLink, RefreshCw, CheckCircle2, Lock, KeyRound, Key } from "lucide-react";
import { fetchDuprPlayer, connectDuprAccount, getDuprStatus } from "../services/api";

interface AuthModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  onSave: (name: string, phone: string, duprId?: string, doublesRating?: number, singlesRating?: number) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, currentUser, onSave, onClose }) => {
  const [name, setName] = useState<string>(currentUser?.name || "");
  const [phone, setPhone] = useState<string>(currentUser?.phone || "");
  const [duprId, setDuprId] = useState<string>(currentUser?.dupr_id || "");
  const [doublesRating, setDoublesRating] = useState<number>(currentUser?.dupr_doubles_rating || 3.5);
  const [singlesRating, setSinglesRating] = useState<number>(currentUser?.dupr_singles_rating || 3.5);
  const [error, setError] = useState<string>("");

  // DUPR Auto-Fetch & Connection State
  const [isFetchingDupr, setIsFetchingDupr] = useState<boolean>(false);
  const [duprStatusMsg, setDuprStatusMsg] = useState<string>("");
  const [duprFetchStatus, setDuprFetchStatus] = useState<"idle" | "success" | "auth_needed" | "not_found">("idle");
  const [showConnectDupr, setShowConnectDupr] = useState<boolean>(false);
  const [connectEmail, setConnectEmail] = useState<string>("");
  const [connectPassword, setConnectPassword] = useState<string>("");
  const [connectToken, setConnectToken] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectSuccess, setConnectSuccess] = useState<string>("");

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setDuprId(currentUser.dupr_id || "");
      setDoublesRating(currentUser.dupr_doubles_rating || 3.5);
      setSinglesRating(currentUser.dupr_singles_rating || 3.5);
      if (currentUser.dupr_id) {
        setDuprFetchStatus("success");
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleAutoFetchDupr = async (idToLookup?: string) => {
    const targetId = (idToLookup || duprId).trim().toUpperCase();
    if (!targetId || targetId.length < 3) {
      setError("Please enter a valid DUPR ID (at least 3 characters)");
      return;
    }

    setError("");
    setIsFetchingDupr(true);
    setDuprStatusMsg("Connecting to DUPR API...");

    try {
      const res = await fetchDuprPlayer(targetId);
      if (res.status === "SUCCESS" && (res.doubles_rating !== undefined || res.singles_rating !== undefined)) {
        if (res.doubles_rating !== undefined) setDoublesRating(res.doubles_rating);
        if (res.singles_rating !== undefined) setSinglesRating(res.singles_rating);
        setDuprFetchStatus("success");
        setDuprStatusMsg(res.name ? `Verified: ${res.name} (Official DUPR)` : "Official ratings retrieved from DUPR API!");
      } else if (res.status === "AUTH_REQUIRED") {
        setDuprFetchStatus("auth_needed");
        setDuprStatusMsg(res.message || "Connect your DUPR account to auto-fetch live official ratings.");
      } else if (res.status === "NOT_FOUND") {
        setDuprFetchStatus("not_found");
        setDuprStatusMsg(`DUPR ID "${targetId}" not found. Verify your ID in the DUPR app.`);
      } else {
        setDuprFetchStatus("idle");
        setDuprStatusMsg(res.message || "Could not retrieve rating.");
      }
    } catch (err: any) {
      setDuprFetchStatus("idle");
      setDuprStatusMsg("Network error connecting to DUPR.");
    } finally {
      setIsFetchingDupr(false);
    }
  };

  const handleConnectDuprSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError("");
    setConnectSuccess("");

    try {
      const payload: any = {};
      if (connectToken.trim()) {
        payload.token = connectToken.trim();
      } else if (connectEmail.trim() && connectPassword.trim()) {
        payload.email = connectEmail.trim();
        payload.password = connectPassword.trim();
      } else {
        setError("Please enter your DUPR email & password or direct API token.");
        setIsConnecting(false);
        return;
      }

      const res = await connectDuprAccount(payload);
      if (res.status === "SUCCESS") {
        setConnectSuccess("Connected to DUPR successfully!");
        setShowConnectDupr(false);
        // Auto-fetch if ID is present
        if (duprId.trim()) {
          setTimeout(() => handleAutoFetchDupr(), 300);
        }
      } else {
        setError(res.message || "Failed to authenticate with DUPR.");
      }
    } catch (err: any) {
      setError(err.message || "DUPR connection failed.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!phone.trim() || phone.trim().length < 4) {
      setError("Please enter a valid mobile number");
      return;
    }
    setError("");
    onSave(
      name.trim(),
      phone.trim(),
      duprId.trim() || undefined,
      doublesRating,
      singlesRating
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative my-8 transition-colors">
        
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-4 shadow-xs">
          🏓
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentUser ? "Edit Your Profile" : "Welcome to Pickleball Tracker"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
            {currentUser
              ? "Update your details and auto-sync official DUPR ratings."
              : "Register with your name and mobile number. Auto-fetch official DUPR ratings with your DUPR ID."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {connectSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold text-center">
            {connectSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-emerald-600 dark:focus:border-emerald-500 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 555-0199 or 9876543210"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-emerald-600 dark:focus:border-emerald-500 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
              Used to associate matches with your friends.
            </p>
          </div>

          {/* DUPR Integration Section: Auto-Update via DUPR API (Zero Manual Entry) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>DUPR ID (Auto-Sync Ratings)</span>
              </label>
              <a
                href="https://dashboard.dupr.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 font-semibold"
              >
                <span>Find ID on mydupr.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={duprId}
                onChange={(e) => {
                  setDuprId(e.target.value.toUpperCase());
                  setDuprFetchStatus("idle");
                  setDuprStatusMsg("");
                }}
                placeholder="Enter DUPR ID (e.g. 7GK482)"
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono font-semibold"
              />
              <button
                type="button"
                onClick={() => handleAutoFetchDupr()}
                disabled={isFetchingDupr || !duprId.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingDupr ? "animate-spin" : ""}`} />
                <span>{isFetchingDupr ? "Fetching..." : "Auto-Fetch"}</span>
              </button>
            </div>

            {/* DUPR Status Message */}
            {duprStatusMsg && (
              <div className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                duprFetchStatus === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                  : duprFetchStatus === "auth_needed"
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}>
                {duprFetchStatus === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                <span className="flex-1 leading-snug font-medium">{duprStatusMsg}</span>
                {duprFetchStatus === "auth_needed" && (
                  <button
                    type="button"
                    onClick={() => setShowConnectDupr(!showConnectDupr)}
                    className="text-[11px] font-bold text-amber-900 dark:text-amber-200 underline shrink-0 hover:opacity-80"
                  >
                    Connect DUPR
                  </button>
                )}
              </div>
            )}

            {/* Optional Connect DUPR Form */}
            {showConnectDupr && (
              <div className="mt-3 p-3.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 animate-fade-in text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    <span>Connect DUPR Account for Live Sync</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowConnectDupr(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Log in with your official DUPR account or enter a Bearer token to automatically sync your verified ratings.
                </p>
                <div>
                  <input
                    type="email"
                    value={connectEmail}
                    onChange={(e) => setConnectEmail(e.target.value)}
                    placeholder="DUPR Email address"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={connectPassword}
                    onChange={(e) => setConnectPassword(e.target.value)}
                    placeholder="DUPR Password"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div className="text-[10px] text-center text-slate-400 uppercase tracking-wider font-bold">— or direct token —</div>
                <div>
                  <input
                    type="text"
                    value={connectToken}
                    onChange={(e) => setConnectToken(e.target.value)}
                    placeholder="DUPR API Bearer Token"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleConnectDuprSubmit}
                  disabled={isConnecting}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isConnecting ? "Connecting..." : "Authenticate DUPR Account"}</span>
                </button>
              </div>
            )}

            {/* Read-Only Verified Rating Badges (NO MANUAL ENTRY) */}
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 text-center relative">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-0.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Official Doubles</span>
                </div>
                <div className="text-xl font-black text-blue-700 dark:text-blue-400 font-mono">
                  {doublesRating ? doublesRating.toFixed(2) : "3.50"}
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  {duprFetchStatus === "success" ? "✓ DUPR API" : "Auto-Fetched"}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 text-center relative">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-0.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Official Singles</span>
                </div>
                <div className="text-xl font-black text-sky-700 dark:text-sky-400 font-mono">
                  {singlesRating ? singlesRating.toFixed(2) : "3.50"}
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  {duprFetchStatus === "success" ? "✓ DUPR API" : "Auto-Fetched"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline shrink-0" />
              <span>Ratings auto-sync via official DUPR API. Match scores remain strictly private.</span>
            </p>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{currentUser ? "Save Changes" : "Get Started"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onClose && currentUser && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 mt-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-semibold transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
};
