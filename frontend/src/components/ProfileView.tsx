import React, { useState, useEffect } from "react";
import { UserProfile, DuprConfig } from "../types";
import { Phone, LogOut, Smartphone, Award, ExternalLink, Settings, Check, RefreshCw } from "lucide-react";
import { getDuprConfig, saveDuprConfig } from "../services/api";

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
  const [duprConfig, setDuprConfig] = useState<DuprConfig>({
    environment: "uat",
    auto_sync: false,
  });
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    getDuprConfig().then(setDuprConfig);
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveDuprConfig(duprConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold text-xs uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
          >
            Edit Profile & DUPR
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

      {/* DUPR Rating Card */}
      <div className="bg-blue-50/30 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 border border-blue-200 dark:border-blue-500/30 rounded-3xl p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>Official DUPR Ratings</span>
                {currentUser.dupr_verified && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Dynamic Universal Pickleball Rating (mydupr.com)
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
            <span className="text-[10px] text-slate-500 block mt-1">
              {currentUser.dupr_id ? `ID: ${currentUser.dupr_id}` : "Unlinked"}
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

        {/* DUPR Partner API Settings Toggle */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-950/60 hover:bg-slate-50 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-all flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>DUPR Partner API & Sync Settings</span>
          </span>
          <span className="text-slate-400">{showConfig ? "▲" : "▼"}</span>
        </button>

        {showConfig && (
          <form onSubmit={handleSaveConfig} className="mt-4 pt-4 border-t border-blue-200 dark:border-slate-800/80 space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                API Environment
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDuprConfig({ ...duprConfig, environment: "uat" })}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    duprConfig.environment === "uat"
                      ? "bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:text-slate-950"
                      : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  UAT Sandbox (uat.mydupr.com)
                </button>
                <button
                  type="button"
                  onClick={() => setDuprConfig({ ...duprConfig, environment: "production" })}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    duprConfig.environment === "production"
                      ? "bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:text-slate-950"
                      : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  Production (mydupr.com)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                DUPR Client Key (Optional for Partner Clubs)
              </label>
              <input
                type="text"
                value={duprConfig.client_key || ""}
                onChange={(e) => setDuprConfig({ ...duprConfig, client_key: e.target.value })}
                placeholder="Partner Client Key"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                DUPR Client Secret
              </label>
              <input
                type="password"
                value={duprConfig.client_secret || ""}
                onChange={(e) => setDuprConfig({ ...duprConfig, client_secret: e.target.value })}
                placeholder="Partner Client Secret"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoSync"
                checked={duprConfig.auto_sync}
                onChange={(e) => setDuprConfig({ ...duprConfig, auto_sync: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
              <label htmlFor="autoSync" className="text-slate-700 dark:text-slate-300 font-medium">
                Auto-submit completed matches to DUPR
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Settings Saved</span>
                </>
              ) : (
                <span>Save DUPR Settings</span>
              )}
            </button>
          </form>
        )}

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
