import React from "react";
import { UserProfile } from "../types";
import { User, Phone, LogOut, Smartphone, ShieldCheck, RefreshCw } from "lucide-react";

interface ProfileViewProps {
  currentUser: UserProfile;
  onEditProfile: () => void;
  onLogout: () => void;
  onResetAllData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onEditProfile,
  onLogout,
  onResetAllData,
}) => {
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-sm">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center font-black text-white text-3xl shadow-lg mx-auto mb-4"
          style={{ backgroundColor: currentUser.avatar_color || "#10b981" }}
        >
          {currentUser.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">
          {currentUser.name}
        </h2>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 mt-2">
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentUser.phone}</span>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={onEditProfile}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 active:scale-95"
          >
            Edit Profile
          </button>
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs uppercase tracking-wider transition-all border border-rose-500/20 active:scale-95 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Account</span>
          </button>
        </div>
      </div>

      {/* App & Mobile Tips */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <span>Mobile Courtside Installation</span>
        </h3>
        
        <div className="space-y-3 text-xs text-slate-400">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80">
            <span className="font-bold text-white block mb-0.5">🍏 On iPhone (Safari)</span>
            Tap the <span className="text-emerald-400 font-semibold">Share</span> icon at bottom, then select <span className="text-white font-semibold">"Add to Home Screen"</span>.
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80">
            <span className="font-bold text-white block mb-0.5">🤖 On Android (Chrome)</span>
            Tap the <span className="text-emerald-400 font-semibold">Three Dots</span> at top right, then tap <span className="text-white font-semibold">"Install App"</span> or "Add to Home screen".
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-3xl p-5 text-center">
        <button
          onClick={onResetAllData}
          className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center justify-center gap-1.5 mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset app demo data to fresh install</span>
        </button>
      </div>

    </div>
  );
};
