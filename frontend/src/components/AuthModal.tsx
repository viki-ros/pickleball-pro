import React, { useState } from "react";
import { UserProfile } from "../types";
import { Phone, User, ArrowRight, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  onSave: (name: string, phone: string) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, currentUser, onSave, onClose }) => {
  const [name, setName] = useState<string>(currentUser?.name || "");
  const [phone, setPhone] = useState<string>(currentUser?.phone || "");
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

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
    onSave(name.trim(), phone.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-4 shadow-inner">
          🏓
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {currentUser ? "Edit Your Profile" : "Welcome to Pickleball Tracker"}
          </h2>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
            {currentUser
              ? "Update your name or contact number used for match records."
              : "Register with your name and mobile number to start scoring matches with friends and tracking your stats."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition-all placeholder:text-slate-600"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 555-0199 or 9876543210"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition-all placeholder:text-slate-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
              Used to associate matches with your friends. Stored safely.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{currentUser ? "Save Changes" : "Get Started"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onClose && currentUser && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 mt-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-all"
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
