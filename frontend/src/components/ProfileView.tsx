import React, { useState } from "react";
import { UserProfile } from "../types";
import { Phone, LogOut, Smartphone, Award, ExternalLink, RefreshCw, Shield, Edit3 } from "lucide-react";
import { verifyDuprPlayer, saveUserProfile } from "../services/api";

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
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>("");

  const handleSyncDupr = async () => {
    if (!currentUser.dupr_id) {
      onEditProfile();
      return;
    }
    try {
      setIsSyncing(true);
      setSyncStatus("");
      const res = await verifyDuprPlayer(currentUser.dupr_id);
      const updated = await saveUserProfile(
        currentUser.name,
        currentUser.phone,
        currentUser.dupr_id,
        res.doublesRating,
        res.singlesRating
      );
      if (onUserUpdated) {
        onUserUpdated(updated);
      }
      setSyncStatus(`✓ DUPR rating refreshed: Doubles ${res.doublesRating.toFixed(2)} • Singles ${res.singlesRating.toFixed(2)}`);
      setTimeout(() => setSyncStatus(""), 4000);
    } catch (err) {
      setSyncStatus("Failed to sync DUPR rating. Please check your connection.");
      setTimeout(() => setSyncStatus(""), 4000);
    } finally {
      setIsSyncing(false);
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

      {/* DUPR Rating Sync Card */}
      <div className="bg-blue-50/40 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 border border-blue-200 dark:border-blue-500/30 rounded-3xl p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>Player DUPR Ratings</span>
                {currentUser.dupr_verified && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Official rating synced from Dynamic Universal Pickleball Rating (mydupr.com)
              </p>
            </div>
          </div>

          <a
            href="https://mydupr.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-semibold"
          >
            <span>mydupr.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* DUPR ID & Ratings Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
              Doubles DUPR
            </span>
            <span className="text-3xl font-black text-blue-700 dark:text-blue-400 font-mono tracking-tight">
              {currentUser.dupr_doubles_rating ? currentUser.dupr_doubles_rating.toFixed(2) : "3.50"}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">
              {currentUser.dupr_id ? `ID: ${currentUser.dupr_id}` : "No ID linked"}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
              Singles DUPR
            </span>
            <span className="text-3xl font-black text-sky-700 dark:text-sky-400 font-mono tracking-tight">
              {currentUser.dupr_singles_rating ? currentUser.dupr_singles_rating.toFixed(2) : "3.50"}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              Standard 1v1
            </span>
          </div>
        </div>

        {/* Sync Latest Rating Action */}
        <div className="space-y-2">
          <button
            onClick={handleSyncDupr}
            disabled={isSyncing}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Fetching Latest Rating from DUPR..." : "Sync Latest DUPR Rating"}</span>
          </button>

          {syncStatus && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold text-center animate-fade-in">
              {syncStatus}
            </div>
          )}
        </div>

        {/* Privacy Assurance Notice */}
        <div className="mt-4 p-3.5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Match Privacy Guarantee</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Match scores and rally records are saved exclusively to your device and are <strong className="text-slate-700 dark:text-slate-300">never submitted to DUPR</strong>. We only sync official player skill ratings so you can see authentic ratings courtside.
          </p>
        </div>

      </div>

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
