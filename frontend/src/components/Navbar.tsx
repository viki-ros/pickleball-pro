import React from "react";
import { UserProfile } from "../types";
import { Swords, Users, BarChart3, User, Plus, Sun, Moon } from "lucide-react";

interface NavbarProps {
  activeTab: "match" | "friends" | "stats" | "profile";
  setActiveTab: (tab: "match" | "friends" | "stats" | "profile") => void;
  currentUser: UserProfile | null;
  onOpenNewMatch: () => void;
  onOpenProfile: () => void;
  hasActiveMatch: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenNewMatch,
  onOpenProfile,
  hasActiveMatch,
  theme,
  onToggleTheme,
}) => {
  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div
            onClick={() => setActiveTab("match")}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500/10 border border-emerald-700 dark:border-emerald-500/20 text-white dark:text-emerald-400 flex items-center justify-center text-lg font-black shadow-xs">
              🏓
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white text-base tracking-tight block leading-none">
                Pickleball
              </span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block leading-none mt-1">
                Tracker
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-1">
            <button
              onClick={() => setActiveTab("match")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "match"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{hasActiveMatch ? "Live Score" : "Match"}</span>
            </button>

            <button
              onClick={() => setActiveTab("friends")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "friends"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Friends</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "stats"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Stats</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "profile"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle (Light Studio vs Dark Obsidian) */}
            <button
              onClick={onToggleTheme}
              title={theme === "light" ? "Switch to Night Mode" : "Switch to Daylight Court"}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={onOpenNewMatch}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">New Match</span>
              <span className="xs:hidden">Match</span>
            </button>

            {currentUser && (
              <button
                onClick={onOpenProfile}
                title={`${currentUser.name} (${currentUser.phone})`}
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-xs ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-emerald-500 transition-all active:scale-95"
                style={{ backgroundColor: currentUser.avatar_color || "#059669" }}
              >
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 px-4 py-2 transition-colors">
        <div className="grid grid-cols-4 gap-1">
          
          <button
            onClick={() => setActiveTab("match")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === "match"
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Swords className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{hasActiveMatch ? "Score" : "Match"}</span>
          </button>

          <button
            onClick={() => setActiveTab("friends")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === "friends"
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Friends</span>
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === "stats"
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Stats</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === "profile"
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Profile</span>
          </button>

        </div>
      </div>
    </>
  );
};
