import React, { useState } from 'react';
import {
  User,
  Shield,
  Trophy,
  Flame,
  Crosshair,
  Edit2,
  Check,
  AlertCircle,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { upsertUserProfile } from '../services/tournamentService.ts';
import { isValidFreeFireUid, isValidInGameName } from '../utils/tournamentRules.ts';

export const ProfileView: React.FC = () => {
  const { currentUser, userProfile, refreshProfile, signOut, isAdmin } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [ign, setIgn] = useState(userProfile?.inGameName || currentUser?.displayName || 'Player');
  const [ffUid, setFfUid] = useState(userProfile?.freeFireUid || '1098234155');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const matches = userProfile?.matchesPlayed ?? 6;
  const kills = userProfile?.totalKills ?? 28;
  const booyahs = userProfile?.booyahs ?? 3;
  const winRate = matches > 0 ? Math.round((booyahs / matches) * 100) : 0;
  const kd = matches > 0 ? (kills / Math.max(1, matches - booyahs)).toFixed(2) : kills.toFixed(2);

  const handleSave = async () => {
    setMessage(null);
    if (!currentUser) return;

    if (!isValidFreeFireUid(ffUid)) {
      setMessage({ text: 'Free Fire UID must be an 8–12 digit number.', isError: true });
      return;
    }
    if (!isValidInGameName(ign)) {
      setMessage({ text: 'In-Game Name must be between 2 and 25 characters.', isError: true });
      return;
    }

    try {
      setSaving(true);
      await upsertUserProfile({
        userId: currentUser.uid,
        email: currentUser.email || 'player@battlearena.gg',
        displayName: ign,
        inGameName: ign,
        freeFireUid: ffUid,
      });
      await refreshProfile();
      setIsEditing(false);
      setMessage({ text: 'Player credentials saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e: unknown) {
      setMessage({ text: e instanceof Error ? e.message : 'Save failed', isError: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl text-white font-bold tracking-wide flex items-center gap-2">
          <User className="w-6 h-6 text-amber-400" />
          <span>PLAYER PROFILE</span>
        </h2>
        <p className="text-zinc-400">
          Your Free Fire esports identity, credentials, and lifetime tournament stats
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2 ${
            message.isError
              ? 'bg-red-500/10 border border-red-500/30 text-red-300'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          {message.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Heroic Player Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-neutral-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar Badge */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 p-0.5 shadow-xl shadow-amber-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center overflow-hidden">
                <Flame className="w-10 h-10 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-1 bg-amber-500 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              GRANDMASTER
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h3 className="font-heading text-2xl text-white font-bold tracking-wide">
                {userProfile?.inGameName || currentUser?.displayName || 'Player'}
              </h3>
              {isAdmin && (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                  OWNER-ADMIN
                </span>
              )}
            </div>

            <div className="text-zinc-400 space-y-0.5 font-mono text-[11px]">
              <div>
                Email: <span className="text-zinc-200">{currentUser?.email || 'N/A'}</span>
              </div>
              <div>
                Free Fire UID:{' '}
                <strong className="text-amber-400 tracking-wider">
                  {userProfile?.freeFireUid || ffUid || 'Not set'}
                </strong>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl border border-zinc-700 font-semibold transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Credentials'}</span>
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3 bg-zinc-950/60 p-4 rounded-2xl">
            <h4 className="font-semibold text-zinc-200">Update In-Game Credentials</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">In-Game Name (IGN)</label>
                <input
                  type="text"
                  value={ign}
                  onChange={e => setIgn(e.target.value)}
                  placeholder="e.g. RaiStar_FF"
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Free Fire UID (8–12 numbers)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ffUid}
                  onChange={e => setFfUid(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 1098234155"
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lifetime Esports Stats Grid */}
      <div>
        <h3 className="font-heading text-lg text-zinc-300 font-bold mb-2 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>TOURNAMENT CAREER STATS</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Played</span>
              <span className="font-heading text-2xl text-zinc-100 font-bold">{matches}</span>
            </div>
          </div>

          <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Booyahs</span>
              <span className="font-heading text-2xl text-amber-400 font-bold">{booyahs}</span>
            </div>
          </div>

          <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Total Kills</span>
              <span className="font-heading text-2xl text-red-400 font-bold">{kills}</span>
            </div>
          </div>

          <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Win Rate / KD</span>
              <span className="font-heading text-2xl text-emerald-400 font-bold">
                {winRate}% <span className="text-xs font-normal text-zinc-400">({kd} KD)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Free Tier Compliance Notice & Payments Status */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-zinc-200 font-bold">
          <CreditCard className="w-4 h-4 text-amber-400" />
          <span>Tournament Payments & Entry Policy</span>
        </div>
        <p className="text-zinc-400 leading-relaxed text-[11px]">
          As per tournament guidelines, <strong className="text-zinc-200">all tournaments are currently 100% Free Entry</strong>. Paid entries, real-money wallets, and payment gateways are disabled until all local esports licensing and regulatory payment provider verifications are completed.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            Free Tier Active
          </span>
          <span className="text-[10px] text-zinc-500">
            Unlimited Free Slots Available
          </span>
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-2">
        <button
          onClick={signOut}
          className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-400 font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Account</span>
        </button>
      </div>
    </div>
  );
};
