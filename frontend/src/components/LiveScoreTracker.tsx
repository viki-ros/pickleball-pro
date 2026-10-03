import React, { useState, useEffect } from "react";
import { RotateCcw, Volume2, VolumeX, Award, ShieldAlert, Zap, CheckCircle2 } from "lucide-react";
import { Match } from "../types";
import { recordRally, undoRally, resetMatch } from "../services/api";
import { CourtVisualizer } from "./CourtVisualizer";

interface LiveScoreTrackerProps {
  match: Match;
  onMatchUpdate: (updated: Match) => void;
}

export const LiveScoreTracker: React.FC<LiveScoreTrackerProps> = ({ match, onMatchUpdate }) => {
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastAction, setLastAction] = useState<string>("");

  // Speak score call via Web Speech API
  const speakScore = (callText: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = callText.replace(/-/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleRallyWon = async (winningTeam: 1 | 2) => {
    if (match.is_completed || loading) return;
    try {
      setLoading(true);
      const updated = await recordRally(match.id, winningTeam);
      onMatchUpdate(updated);
      setLastAction(`Point awarded / rally won by Team ${winningTeam}`);
      if (updated.score_call) {
        speakScore(updated.score_call);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const updated = await undoRally(match.id);
      onMatchUpdate(updated);
      setLastAction("Last rally undone");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (loading || !window.confirm("Are you sure you want to reset this match to 0-0-2?")) return;
    try {
      setLoading(true);
      const updated = await resetMatch(match.id);
      onMatchUpdate(updated);
      setLastAction("Match reset to 0-0-2");
      speakScore(updated.score_call || "0 0 2");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts (1 = Team 1, 2 = Team 2, z = Undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "1") handleRallyWon(1);
      if (e.key === "2") handleRallyWon(2);
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) handleUndo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [match]);

  const team1Names = [match.team1_player1?.name, match.team1_player2?.name].filter(Boolean).join(" & ") || "Team 1";
  const team2Names = [match.team2_player1?.name, match.team2_player2?.name].filter(Boolean).join(" & ") || "Team 2";

  // Match point check
  const isMatchPoint = !match.is_completed && (
    (match.score_team1 >= match.target_points - 1 && match.score_team1 > match.score_team2) ||
    (match.score_team2 >= match.target_points - 1 && match.score_team2 > match.score_team1)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner: Score Call & Match Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {match.scoring_mode === "sideout" ? "Official Side-Out" : "Rally Scoring"}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {match.match_type.toUpperCase()} • First to {match.target_points} (Win by {match.win_by})
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            {match.title}
          </h2>
        </div>

        {/* Big Official Score Call Box */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-xl px-5 py-2.5">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Official Call
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wider font-mono">
              {match.score_call || "0 - 0 - 2"}
            </span>
          </div>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? "Voice referee active" : "Voice referee muted"}
            className={`p-2.5 rounded-lg border transition-all ${
              voiceEnabled
                ? "bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/20"
                : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Match Point Alert */}
      {isMatchPoint && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2.5 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm uppercase tracking-wider">Match Point in Effect!</span>
          </div>
          <span className="text-xs font-medium">Must win by {match.win_by} points</span>
        </div>
      )}

      {/* Winner Celebration Modal */}
      {match.is_completed && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500 rounded-2xl p-6 shadow-2xl text-center relative overflow-hidden animate-fade-in">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
            <Award className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-white">MATCH COMPLETED!</h3>
          <p className="text-lg font-bold text-emerald-400 mt-1">
            🏆 {match.winner_team === 1 ? team1Names : team2Names} Wins!
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Final Score: {match.score_team1} - {match.score_team2}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg border border-slate-700"
            >
              Play Rematch (Reset)
            </button>
          </div>
        </div>
      )}

      {/* Courtside Dual Scorecards with Giant Touch Tap Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* TEAM 1 SCORECARD */}
        <div className={`rounded-2xl border-2 p-5 sm:p-6 transition-all flex flex-col justify-between shadow-xl ${
          match.serving_team === 1
            ? "bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-900 border-emerald-500 shadow-emerald-500/10"
            : "bg-slate-900/90 border-slate-800"
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team 1</span>
              {match.serving_team === 1 && (
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-sm flex items-center gap-1">
                  <span>🎾 SERVING</span>
                  {match.match_type === "doubles" && match.scoring_mode === "sideout" && (
                    <span>(Server {match.server_number})</span>
                  )}
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-white tracking-tight truncate">
              {team1Names}
            </h3>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>DUPR: {match.team1_player1?.rating || 3.5}</span>
              {match.match_type === "doubles" && match.team1_player2 && (
                <span>/ {match.team1_player2.rating || 3.5}</span>
              )}
            </div>
          </div>

          {/* Giant Score Display */}
          <div className="my-6 text-center">
            <span className="text-7xl sm:text-8xl font-black font-mono tracking-tighter text-white">
              {match.score_team1}
            </span>
          </div>

          {/* Giant Tap Target Button */}
          <button
            onClick={() => handleRallyWon(1)}
            disabled={match.is_completed || loading}
            className={`w-full py-4 sm:py-5 rounded-xl text-base sm:text-lg font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
              match.is_completed
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20"
            }`}
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>Team 1 Won Rally (+1)</span>
          </button>
        </div>

        {/* TEAM 2 SCORECARD */}
        <div className={`rounded-2xl border-2 p-5 sm:p-6 transition-all flex flex-col justify-between shadow-xl ${
          match.serving_team === 2
            ? "bg-gradient-to-b from-slate-900 via-sky-950/20 to-slate-900 border-sky-500 shadow-sky-500/10"
            : "bg-slate-900/90 border-slate-800"
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team 2</span>
              {match.serving_team === 2 && (
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-500 text-slate-950 shadow-sm flex items-center gap-1">
                  <span>🎾 SERVING</span>
                  {match.match_type === "doubles" && match.scoring_mode === "sideout" && (
                    <span>(Server {match.server_number})</span>
                  )}
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-white tracking-tight truncate">
              {team2Names}
            </h3>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>DUPR: {match.team2_player1?.rating || 3.5}</span>
              {match.match_type === "doubles" && match.team2_player2 && (
                <span>/ {match.team2_player2.rating || 3.5}</span>
              )}
            </div>
          </div>

          {/* Giant Score Display */}
          <div className="my-6 text-center">
            <span className="text-7xl sm:text-8xl font-black font-mono tracking-tighter text-white">
              {match.score_team2}
            </span>
          </div>

          {/* Giant Tap Target Button */}
          <button
            onClick={() => handleRallyWon(2)}
            disabled={match.is_completed || loading}
            className={`w-full py-4 sm:py-5 rounded-xl text-base sm:text-lg font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
              match.is_completed
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-slate-950 shadow-sky-500/20"
            }`}
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>Team 2 Won Rally (+1)</span>
          </button>
        </div>

      </div>

      {/* Courtside Controls Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo Rally (Ctrl+Z)</span>
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Match</span>
          </button>
        </div>

        {lastAction && (
          <span className="text-xs text-slate-400 italic truncate">
            {lastAction}
          </span>
        )}

        <div className="text-xs text-slate-500 hidden sm:block">
          Hotkeys: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">1</kbd> Team 1 • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">2</kbd> Team 2
        </div>
      </div>

      {/* Interactive Court Visualizer */}
      <CourtVisualizer match={match} />

    </div>
  );
};
