import React from "react";
import { UserProfile } from "../types";
import { Swords, Users, BarChart3, User, Plus } from "lucide-react";

interface NavbarProps {
  activeTab: "match" | "friends" | "stats" | "profile";
  setActiveTab: (tab: "match" | "friends" | "stats" | "profile") => void;
  currentUser: UserProfile | null;
  onOpenNewMatch: () => void;
  onOpenProfile: () => void;
  hasActiveMatch: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenNewMatch,
  onOpenProfile,
  hasActiveMatch,
}) => {
  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div
            onClick={() => setActiveTab("match")}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-black shadow-inner">
              🏓
            </div>
            <div>
              <span className="font-black text-white text-base tracking-tight block leading-none">
                Pickleball
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block leading-none mt-1">
                Tracker
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-2xl p-1">
            <button
              onClick={() => setActiveTab("match")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "match"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>{hasActiveMatch ? "Live Score" : "Match"}</span>
            </button>

            <button
              onClick={() => setActiveTab("friends")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "friends"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Friends</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "stats"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Stats</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "profile"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenNewMatch}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">New Match</span>
              <span className="xs:hidden">Match</span>
            </button>

            {currentUser && (
              <button
                onClick={onOpenProfile}
                title={`${currentUser.name} (${currentUser.phone})`}
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-sm ring-1 ring-slate-800 hover:ring-emerald-500 transition-all active:scale-95"
                style={{ backgroundColor: currentUser.avatar_color || "#10b981" }}
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2">
        <div className="grid grid-cols-4 gap-1">
          
          <button
            onClick={() => setActiveTab("match")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === "match" ? "text-emerald-400 font-bold" : "text-slate-400"
            }`}
          >
            <Swords className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{hasActiveMatch ? "Score" : "Match"}</span>
          </button>

          <button
            onClick={() => setActiveTab("friends")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === "friends" ? "text-emerald-400 font-bold" : "text-slate-400"
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Friends</span>
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === "stats" ? "text-emerald-400 font-bold" : "text-slate-400"
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Stats</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === "profile" ? "text-emerald-400 font-bold" : "text-slate-400"
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
