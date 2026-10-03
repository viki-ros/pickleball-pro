import React, { useState, useEffect } from "react";
import { RotateCcw, Volume2, VolumeX, Swords, Zap, Check, Award, Shield } from "lucide-react";
import { Match } from "../types";
import { recordRally, undoRally, resetMatch } from "../services/api";

interface LiveScoreTrackerProps {
  match: Match;
  onMatchUpdate: (updated: Match) => void;
  onFinishMatch?: () => void;
}

export const LiveScoreTracker: React.FC<LiveScoreTrackerProps> = ({
  match,
  onMatchUpdate,
  onFinishMatch,
}) => {
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastAction, setLastAction] = useState<string>("");

  // Speak official score call via Web Speech API
  const speakScore = (callText: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = callText.replace(/-/g, " ");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const handleRallyWon = async (winningTeam: 1 | 2) => {
    if (match.is_completed || loading) return;
    try {
      setLoading(true);
      const updated = await recordRally(match.id, winningTeam);
      onMatchUpdate(updated);
      setLastAction(`Point won by Team ${winningTeam}`);
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
      setLastAction("Undid last rally");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (loading || !window.confirm("Reset this match score to 0 - 0?")) return;
    try {
      setLoading(true);
      const updated = await resetMatch(match.id);
      onMatchUpdate(updated);
      setLastAction("Match reset to 0-0");
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

  const team1Label = (match.team1_player_names && match.team1_player_names.length > 0)
    ? match.team1_player_names.join(" & ")
    : "Team 1";

  const team2Label = (match.team2_player_names && match.team2_player_names.length > 0)
    ? match.team2_player_names.join(" & ")
    : "Team 2";

  const isMatchPoint = !match.is_completed && (
    (match.score_team1 >= match.target_points - 1 && match.score_team1 > match.score_team2) ||
    (match.score_team2 >= match.target_points - 1 && match.score_team2 > match.score_team1)
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5 animate-fade-in pb-16">
      
      {/* Header Info Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/20">
              {match.scoring_mode === "sideout" ? "Side-Out" : "Rally"}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              {match.match_type.toUpperCase()} • To {match.target_points} (Win by {match.win_by})
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5 truncate max-w-sm sm:max-w-md">
            {match.title}
          </h2>
        </div>

        {/* Audio Referee Toggle & Call */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 w-full sm:w-auto justify-between sm:justify-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 block">
              Referee Call
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-amber-300 font-mono tracking-wider">
              {match.score_call || "0 - 0 - 2"}
            </span>
          </div>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? "Voice referee ON" : "Voice referee MUTED"}
            className={`p-2.5 rounded-xl border transition-all ${
              voiceEnabled
                ? "bg-amber-100 dark:bg-amber-400/10 border-amber-300 dark:border-amber-400/30 text-amber-900 dark:text-amber-300"
                : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Match Point Alert */}
      {isMatchPoint && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 px-4 py-3 rounded-2xl flex items-center justify-between animate-pulse shadow-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-xs uppercase tracking-wider">Match Point in Effect</span>
          </div>
          <span className="text-xs font-medium">Target: {match.target_points} (win by {match.win_by})</span>
        </div>
      )}

      {/* Match Complete Victory Card */}
      {match.is_completed && (
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-7 text-center shadow-lg relative overflow-hidden animate-fade-in transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-3">
            🏆
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            MATCH FINISHED
          </h3>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {match.winner_team === 1 ? team1Label : team2Label} Won the Match!
          </p>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-2 tracking-tight">
            {match.score_team1} - {match.score_team2}
          </div>

          {/* Privacy & Career Stat Notice */}
          <div className="my-5 max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Result Saved to Your Private Stats</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Match scores are kept strictly private on your device/app and are never submitted to DUPR.
            </p>
          </div>

          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
            >
              Play Rematch (Reset)
            </button>
            {onFinishMatch && (
              <button
                onClick={onFinishMatch}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 uppercase tracking-wider"
              >
                View Match Stats
              </button>
            )}
          </div>
        </div>
      )}

      {/* Courtside Dual Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* TEAM 1 CARD */}
        <div
          className={`rounded-3xl border-2 p-6 flex flex-col justify-between transition-all shadow-xs ${
            match.serving_team === 1
              ? "bg-emerald-50/20 dark:bg-slate-900 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/10 shadow-sm"
              : "bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Team 1</span>
              {match.serving_team === 1 && (
                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center gap-1 shadow-xs">
                  <span>🎾 SERVING</span>
                  {match.match_type === "doubles" && match.scoring_mode === "sideout" && (
                    <span>(Server {match.server_number})</span>
                  )}
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {team1Label}
            </h3>
          </div>

          {/* Huge Number */}
          <div className="my-6 sm:my-8 text-center">
            <span className="text-8xl sm:text-9xl font-black font-mono tracking-tighter text-slate-900 dark:text-white select-none">
              {match.score_team1}
            </span>
          </div>

          {/* Point Button */}
          <button
            onClick={() => handleRallyWon(1)}
            disabled={match.is_completed || loading}
            className={`w-full py-4 sm:py-5 rounded-2xl text-base font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 ${
              match.is_completed
                ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/15"
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>+1 Point</span>
          </button>
        </div>

        {/* TEAM 2 CARD */}
        <div
          className={`rounded-3xl border-2 p-6 flex flex-col justify-between transition-all shadow-xs ${
            match.serving_team === 2
              ? "bg-blue-50/20 dark:bg-slate-900 border-blue-600 dark:border-sky-500 ring-2 ring-blue-500/10 shadow-sm"
              : "bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Team 2</span>
              {match.serving_team === 2 && (
                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-600 text-white dark:bg-sky-500 dark:text-slate-950 flex items-center gap-1 shadow-xs">
                  <span>🎾 SERVING</span>
                  {match.match_type === "doubles" && match.scoring_mode === "sideout" && (
                    <span>(Server {match.server_number})</span>
                  )}
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {team2Label}
            </h3>
          </div>

          {/* Huge Number */}
          <div className="my-6 sm:my-8 text-center">
            <span className="text-8xl sm:text-9xl font-black font-mono tracking-tighter text-slate-900 dark:text-white select-none">
              {match.score_team2}
            </span>
          </div>

          {/* Point Button */}
          <button
            onClick={() => handleRallyWon(2)}
            disabled={match.is_completed || loading}
            className={`w-full py-4 sm:py-5 rounded-2xl text-base font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 ${
              match.is_completed
                ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/15"
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>+1 Point</span>
          </button>
        </div>

      </div>

      {/* Courtside Control Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Undo Point</span>
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all border border-rose-200 dark:border-rose-500/20 active:scale-95"
          >
            <span>Reset 0-0</span>
          </button>
        </div>

        {lastAction && (
          <span className="text-xs text-slate-600 dark:text-slate-400 italic truncate">
            {lastAction}
          </span>
        )}

        <div className="text-xs text-slate-500 hidden sm:block">
          Hotkeys: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono">1</kbd> Team 1 • <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono">2</kbd> Team 2
        </div>
      </div>

    </div>
  );
};
