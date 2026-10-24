import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Tournament, Registration } from '../types/tournament.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { registerForTournament } from '../services/tournamentService.ts';
import { isValidFreeFireUid, isValidInGameName } from '../utils/tournamentRules.ts';

interface RegistrationModalProps {
  tournament: Tournament;
  onClose: () => void;
  onSuccess: (reg: Registration) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  tournament,
  onClose,
  onSuccess,
}) => {
  const { currentUser, userProfile, refreshProfile } = useAuth();

  const [freeFireUid, setFreeFireUid] = useState(userProfile?.freeFireUid || '');
  const [inGameName, setInGameName] = useState(userProfile?.inGameName || currentUser?.displayName || '');
  const [teamName, setTeamName] = useState('');
  const [teammates, setTeammates] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTeamFormat = tournament.format === 'duo' || tournament.format === 'squad';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      setError('You must be signed in to register.');
      return;
    }

    if (!isValidFreeFireUid(freeFireUid)) {
      setError('Free Fire UID must be an 8 to 12 digit numeric identifier (e.g., 1098234155).');
      return;
    }

    if (!isValidInGameName(inGameName)) {
      setError('In-Game Name (IGN) must be between 2 and 25 characters.');
      return;
    }

    if (isTeamFormat && !teamName.trim()) {
      setError(`Please provide your Team / Clan Name for ${tournament.format.toUpperCase()} format.`);
      return;
    }

    if (!agreed) {
      setError('You must acknowledge the Free Fire Fair Play and No Hack rules.');
      return;
    }

    try {
      setSubmitting(true);
      const reg = await registerForTournament({
        tournamentId: tournament.id,
        userId: currentUser.uid,
        userEmail: currentUser.email || 'player@battlearena.gg',
        playerName: currentUser.displayName || inGameName,
        freeFireUid: freeFireUid.trim(),
        inGameName: inGameName.trim(),
        teamName: isTeamFormat ? teamName.trim() : undefined,
        teammates: isTeamFormat ? teammates.trim() : undefined,
      });

      await refreshProfile();
      onSuccess(reg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Slot Registration • {tournament.mode.toUpperCase()} {tournament.format.toUpperCase()}
            </span>
            <h2 className="font-heading text-xl text-white font-bold leading-tight">
              {tournament.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Free Fire In-Game UID */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Free Fire UID (In-Game Account ID) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 1098234155"
              value={freeFireUid}
              onChange={e => setFreeFireUid(e.target.value.replace(/[^0-9]/g, ''))}
              required
              className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Find this in Free Fire &gt; Profile banner under your avatar (8–12 numbers).
            </p>
          </div>

          {/* In-Game Name */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              In-Game Name (IGN) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. RaiStar_FF"
              value={inGameName}
              onChange={e => setInGameName(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Team Name for Duo / Squad */}
          {isTeamFormat && (
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Team / Clan Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Total Gaming, Team Elite"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Teammates' details */}
          {isTeamFormat && (
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Teammate IGNs & UIDs (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Player 2: IGN (UID), Player 3: IGN (UID)..."
                value={teammates}
                onChange={e => setTeammates(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors resize-none"
              />
            </div>
          )}

          {/* Terms checkbox */}
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-start gap-2.5">
            <input
              id="rules-check"
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-500 bg-zinc-900 cursor-pointer"
            />
            <label htmlFor="rules-check" className="text-[11px] text-zinc-300 leading-snug cursor-pointer">
              I agree to fair play rules. I understand that third-party modifications, scripts, emulators, or teaming up will cause permanent disqualification.
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase">Entry Fee</span>
              <span className="font-bold text-emerald-400">FREE ENTRY (₹0)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Booking Slot...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Slot</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
