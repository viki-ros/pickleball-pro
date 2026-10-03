import React from "react";
import { Match } from "../types";

interface CourtVisualizerProps {
  match: Match;
}

export const CourtVisualizer: React.FC<CourtVisualizerProps> = ({ match }) => {
  // Determine which side is active server:
  const isTeam1Serving = match.serving_team === 1;
  const serverNum = match.server_number;

  // Player names
  const t1p1 = match.team1_player1?.name || "Team 1 P1";
  const t1p2 = match.match_type === "doubles" ? (match.team1_player2?.name || "Team 1 P2") : null;
  const t2p1 = match.team2_player1?.name || "Team 2 P1";
  const t2p2 = match.match_type === "doubles" ? (match.team2_player2?.name || "Team 2 P2") : null;

  // Active serving court side
  // In doubles: whoever is serving is on their side (right or left)
  // For Team 1 (bottom): Right is screen-right, Left is screen-left
  // For Team 2 (top): From their perspective, their right is screen-left!
  let activeServerSide: "right" | "left" = "right";
  if (isTeam1Serving) {
    if (serverNum === 1) {
      activeServerSide = match.team1_player1_side;
    } else {
      activeServerSide = match.team1_player2_side;
    }
  } else {
    if (serverNum === 1) {
      activeServerSide = match.team2_player1_side;
    } else {
      activeServerSide = match.team2_player2_side;
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Court Visualizer & Positioning
          </h3>
          <p className="text-xs text-slate-500">
            Official 20' × 44' Regulation Layout with 7' Non-Volley Zone (Kitchen)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-xs font-semibold text-lime-400">
            Active Serve: Team {match.serving_team} ({activeServerSide.toUpperCase()})
          </span>
        </div>
      </div>

      {/* 2D Court Container */}
      <div className="w-full max-w-md mx-auto aspect-[1/2] rounded-xl border-4 border-slate-300 relative bg-emerald-800 flex flex-col shadow-inner overflow-hidden select-none">
        
        {/* TEAM 2 COURT (TOP HALF - 22 ft) */}
        <div className="flex-1 flex flex-col border-b-4 border-slate-100/90 relative">
          
          {/* Team 2 Service Courts (15 ft) */}
          <div className="flex-1 flex border-b-2 border-slate-200/80">
            {/* Team 2 Right Court (Screen Left) */}
            <div className={`flex-1 border-r-2 border-slate-200/80 p-2 flex flex-col justify-start items-center transition-colors ${
              !isTeam1Serving && activeServerSide === "right" ? "bg-emerald-700/60 ring-2 ring-inset ring-amber-400/80" : ""
            }`}>
              <span className="text-[10px] font-bold text-emerald-200/60 uppercase">T2 Right Box</span>
              <div className="mt-2 text-center">
                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950/70 text-slate-200 border border-slate-700">
                  {match.team2_player1_side === "right" ? t2p1 : (t2p2 || t2p1)}
                </span>
                {!isTeam1Serving && activeServerSide === "right" && (
                  <div className="text-[10px] font-bold text-amber-300 mt-1 flex items-center justify-center gap-1">
                    <span>🎾 SERVER {match.match_type === 'doubles' ? serverNum : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Team 2 Left Court (Screen Right) */}
            <div className={`flex-1 p-2 flex flex-col justify-start items-center transition-colors ${
              !isTeam1Serving && activeServerSide === "left" ? "bg-emerald-700/60 ring-2 ring-inset ring-amber-400/80" : ""
            }`}>
              <span className="text-[10px] font-bold text-emerald-200/60 uppercase">T2 Left Box</span>
              <div className="mt-2 text-center">
                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950/70 text-slate-200 border border-slate-700">
                  {match.team2_player1_side === "left" ? t2p1 : (t2p2 || "")}
                </span>
                {!isTeam1Serving && activeServerSide === "left" && (
                  <div className="text-[10px] font-bold text-amber-300 mt-1 flex items-center justify-center gap-1">
                    <span>🎾 SERVER {match.match_type === 'doubles' ? serverNum : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team 2 Kitchen / Non-Volley Zone (7 ft) */}
          <div className="h-[24%] bg-sky-700/80 flex items-center justify-center border-t border-slate-300/40 relative">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-200/60">
              Kitchen (NVZ) - 7 FT
            </span>
          </div>
        </div>

        {/* NET (Center Line) */}
        <div className="h-2 bg-slate-100 flex items-center justify-between px-1 shadow-md z-10">
          <div className="w-2 h-2 rounded-full bg-slate-700" />
          <span className="text-[9px] font-extrabold text-slate-800 uppercase tracking-widest">
            NET (34")
          </span>
          <div className="w-2 h-2 rounded-full bg-slate-700" />
        </div>

        {/* TEAM 1 COURT (BOTTOM HALF - 22 ft) */}
        <div className="flex-1 flex flex-col relative">
          
          {/* Team 1 Kitchen / Non-Volley Zone (7 ft) */}
          <div className="h-[24%] bg-sky-700/80 flex items-center justify-center border-b border-slate-300/40 relative">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-200/60">
              Kitchen (NVZ) - 7 FT
            </span>
          </div>

          {/* Team 1 Service Courts (15 ft) */}
          <div className="flex-1 flex">
            {/* Team 1 Left Court (Screen Left) */}
            <div className={`flex-1 border-r-2 border-slate-200/80 p-2 flex flex-col justify-end items-center transition-colors ${
              isTeam1Serving && activeServerSide === "left" ? "bg-emerald-700/60 ring-2 ring-inset ring-amber-400/80" : ""
            }`}>
              <div className="mb-2 text-center">
                {isTeam1Serving && activeServerSide === "left" && (
                  <div className="text-[10px] font-bold text-amber-300 mb-1 flex items-center justify-center gap-1">
                    <span>🎾 SERVER {match.match_type === 'doubles' ? serverNum : ''}</span>
                  </div>
                )}
                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950/70 text-slate-200 border border-slate-700">
                  {match.team1_player1_side === "left" ? t1p1 : (t1p2 || "")}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-200/60 uppercase">T1 Left Box</span>
            </div>

            {/* Team 1 Right Court (Screen Right) */}
            <div className={`flex-1 p-2 flex flex-col justify-end items-center transition-colors ${
              isTeam1Serving && activeServerSide === "right" ? "bg-emerald-700/60 ring-2 ring-inset ring-amber-400/80" : ""
            }`}>
              <div className="mb-2 text-center">
                {isTeam1Serving && activeServerSide === "right" && (
                  <div className="text-[10px] font-bold text-amber-300 mb-1 flex items-center justify-center gap-1">
                    <span>🎾 SERVER {match.match_type === 'doubles' ? serverNum : ''}</span>
                  </div>
                )}
                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950/70 text-slate-200 border border-slate-700">
                  {match.team1_player1_side === "right" ? t1p1 : (t1p2 || t1p1)}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-200/60 uppercase">T1 Right Box</span>
            </div>
          </div>

        </div>

      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-sky-700" />
          <span>Non-Volley Zone (Kitchen)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-800" />
          <span>Service Court</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm ring-2 ring-amber-400 bg-emerald-700" />
          <span>Active Serving Box</span>
        </div>
      </div>
    </div>
  );
};
