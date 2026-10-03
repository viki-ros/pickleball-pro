import React, { useState } from "react";
import { UserProfile } from "../types";
import { Phone, User, ArrowRight, ShieldCheck, Award, ExternalLink } from "lucide-react";
import { verifyDuprPlayer } from "../services/api";

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
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(Boolean(currentUser?.dupr_verified));

  if (!isOpen) return null;

  const handleDuprLookup = async () => {
    if (!duprId.trim()) return;
    setIsVerifying(true);
    try {
      const res = await verifyDuprPlayer(duprId);
      setDoublesRating(res.doublesRating);
      setSinglesRating(res.singlesRating);
      setVerifiedSuccess(true);
    } catch {
      setVerifiedSuccess(false);
    } finally {
      setIsVerifying(false);
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
              ? "Update your details and link your DUPR rating."
              : "Register with your name and mobile number to start scoring matches with friends and syncing with DUPR."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center">
            {error}
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

          {/* DUPR Integration Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Link DUPR Rating (Optional)</span>
              </label>
              <a
                href="https://mydupr.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-semibold"
              >
                <span>Find ID</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={duprId}
                onChange={(e) => {
                  setDuprId(e.target.value);
                  setVerifiedSuccess(false);
                }}
                placeholder="e.g. DUPR-7829 or 7GK482"
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono"
              />
              <button
                type="button"
                onClick={handleDuprLookup}
                disabled={!duprId.trim() || isVerifying}
                className="px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-bold transition-all disabled:opacity-50"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>

            {/* DUPR Rating Preview */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Doubles DUPR</span>
                <input
                  type="number"
                  step="0.01"
                  min="2.0"
                  max="6.5"
                  value={doublesRating}
                  onChange={(e) => setDoublesRating(parseFloat(e.target.value) || 3.5)}
                  className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5 text-right text-xs font-black text-blue-700 dark:text-blue-400 font-mono"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Singles DUPR</span>
                <input
                  type="number"
                  step="0.01"
                  min="2.0"
                  max="6.5"
                  value={singlesRating}
                  onChange={(e) => setSinglesRating(parseFloat(e.target.value) || 3.5)}
                  className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5 text-right text-xs font-black text-sky-700 dark:text-sky-400 font-mono"
                />
              </div>
            </div>

            {verifiedSuccess && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-semibold">
                ✓ DUPR profile linked: Ratings active on all match scorecards.
              </p>
            )}
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
