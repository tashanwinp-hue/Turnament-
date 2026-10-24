import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Users,
  Clock,
  Shield,
  Key,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  Swords,
  Award,
} from 'lucide-react';
import { Tournament, Registration, MatchResult } from '../types/tournament.ts';
import {
  subscribeToRegistrations,
  subscribeToMatchResults,
} from '../services/tournamentService.ts';
import {
  canAccessRoomCredentials,
  formatPrizePool,
  BR_PLACEMENT_POINTS,
} from '../utils/tournamentRules.ts';

interface TournamentDetailModalProps {
  tournament: Tournament;
  onClose: () => void;
  onOpenRegister: (tournament: Tournament) => void;
  currentUserEmail?: string | null;
  currentUserId?: string;
}

export const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({
  tournament,
  onClose,
  onOpenRegister,
  currentUserEmail,
  currentUserId,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'slots' | 'results'>('overview');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const unsubRegs = subscribeToRegistrations(tournament.id, setRegistrations);
    const unsubRes = subscribeToMatchResults(tournament.id, setResults);
    return () => {
      unsubRegs();
      unsubRes();
    };
  }, [tournament.id]);

  const userReg = registrations.find(r => r.userId === currentUserId && r.status === 'confirmed');
  const isRegistered = !!userReg;
  const hasRoomAccess = canAccessRoomCredentials(currentUserEmail, tournament.status, isRegistered);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isFull = (tournament.registeredCount || registrations.length) >= tournament.maxSlots;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                tournament.mode === 'br'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}>
                Free Fire {tournament.mode.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded uppercase tracking-wider border border-zinc-700">
                {tournament.format} • {tournament.map}
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl text-white font-bold leading-tight">
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

        {/* Room Credentials Banner */}
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800">
          {hasRoomAccess ? (
            <div className="bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-500/40 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span>Custom Room Credentials (Active)</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">
                  Confidential
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Room ID Box */}
                <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-700/80 rounded-lg p-2.5">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block">Room ID</span>
                    <span className="font-mono text-base font-bold text-amber-400 tracking-wider">
                      {tournament.roomId || 'Pending release'}
                    </span>
                  </div>
                  {tournament.roomId && (
                    <button
                      onClick={() => copyToClipboard(tournament.roomId!, 'roomId')}
                      className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2 py-1 rounded text-[11px] transition-colors"
                    >
                      {copiedField === 'roomId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'roomId' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {/* Password Box */}
                <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-700/80 rounded-lg p-2.5">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase block">Password</span>
                    <span className="font-mono text-base font-bold text-amber-400 tracking-wider">
                      {tournament.roomPassword || 'Pending release'}
                    </span>
                  </div>
                  {tournament.roomPassword && (
                    <button
                      onClick={() => copyToClipboard(tournament.roomPassword!, 'roomPassword')}
                      className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2 py-1 rounded text-[11px] transition-colors"
                    >
                      {copiedField === 'roomPassword' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'roomPassword' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-2 text-[11px] text-zinc-400">
                ⚡ <strong>Instructions:</strong> Open Free Fire &gt; Custom &gt; Enter Room ID & Password. Join your assigned slot immediately.
              </p>
            </div>
          ) : isRegistered ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300 block">
                  You are registered (Slot #{userReg?.slotNumber})!
                </span>
                <span className="text-zinc-400">
                  Room ID & Password will be automatically unlocked here 15 minutes before match start time ({tournament.scheduleTime}).
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-3 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-zinc-300 block">Room ID & Password Protected</span>
                <span className="text-zinc-400">
                  Only registered participants will receive the custom match credentials before match start.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-4 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Overview & Rules
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'slots'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Slots & Participants</span>
            <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded-full text-[10px]">
              {registrations.length}
            </span>
          </button>
          {results.length > 0 && (
            <button
              onClick={() => setActiveTab('results')}
              className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'results'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Results & Winners</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase">Schedule</span>
                  <span className="font-semibold text-zinc-200">{tournament.scheduleTime}</span>
                </div>
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase">Prize Pool</span>
                  <span className="font-semibold text-amber-400">{formatPrizePool(tournament.prizePool)}</span>
                </div>
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase">Entry Fee</span>
                  <span className="font-semibold text-emerald-400">FREE ENTRY</span>
                </div>
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block uppercase">Slots Available</span>
                  <span className="font-semibold text-zinc-200">
                    {Math.max(0, tournament.maxSlots - registrations.length)} / {tournament.maxSlots}
                  </span>
                </div>
              </div>

              {/* Points Distribution System */}
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-2">
                  <Trophy className="w-4 h-4" />
                  <span>Official Esports Points System</span>
                </div>
                {tournament.mode === 'br' ? (
                  <div>
                    <p className="text-[11px] text-zinc-400 mb-2">
                      Each kill awards <strong className="text-zinc-200">1 Kill Point</strong>. Placement points awarded per final standings:
                    </p>
                    <div className="grid grid-cols-5 gap-1.5 text-center text-[11px]">
                      {Object.entries(BR_PLACEMENT_POINTS).slice(0, 5).map(([rank, pts]) => (
                        <div key={rank} className="bg-zinc-900 border border-zinc-800 p-1.5 rounded">
                          <div className="text-zinc-400">#{rank}</div>
                          <div className="font-bold text-amber-400">{pts} pts</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] text-zinc-400">
                      Clash Squad is a fast-paced round-based mode. Match winner receives <strong className="text-amber-400">10 placement points</strong> + <strong className="text-zinc-200">1 pt per kill</strong>. Runner-up receives 2 points.
                    </p>
                  </div>
                )}
              </div>

              {/* Tournament Rules */}
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-200 font-bold mb-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Fair Play & Rules</span>
                </div>
                <div className="text-zinc-300 space-y-1.5 text-[11px] whitespace-pre-line leading-relaxed">
                  {tournament.rules}
                </div>
              </div>

              {/* Regulatory Notice */}
              <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 text-[10px] text-zinc-500 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Free-Entry Policy:</strong> This tournament is hosted completely free of charge. Real-money entry fees, gambling, or paid wagers remain disabled in accordance with policy and payment gateway guidelines.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'slots' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Confirmed Slots: <strong className="text-zinc-200">{registrations.length}</strong> / {tournament.maxSlots}
                </span>
                <span className="text-[11px] text-amber-400 font-medium">Slot order guaranteed</span>
              </div>

              {registrations.length === 0 ? (
                <div className="text-center py-8 bg-zinc-950 rounded-xl border border-zinc-800">
                  <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-300 font-semibold">No participants registered yet</p>
                  <p className="text-[11px] text-zinc-500">Be the first player or team to claim Slot #1!</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {registrations.map(reg => (
                    <div
                      key={reg.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border ${
                        reg.userId === currentUserId
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                          : 'bg-zinc-950 border-zinc-800/80 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-mono text-xs flex items-center justify-center font-bold">
                          #{reg.slotNumber}
                        </span>
                        <div>
                          <div className="font-semibold text-xs flex items-center gap-1.5">
                            <span>{reg.inGameName}</span>
                            {reg.teamName && (
                              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">
                                {reg.teamName}
                              </span>
                            )}
                            {reg.userId === currentUserId && (
                              <span className="text-[9px] bg-amber-500 text-black font-extrabold px-1 rounded uppercase">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            FF UID: {reg.freeFireUid}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400">
                Official standings and points recorded by Tournament Admin:
              </div>
              <div className="space-y-1.5">
                {results.map(res => (
                  <div
                    key={res.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border ${
                      res.isWinner
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded font-mono text-xs flex items-center justify-center font-extrabold ${
                        res.rank === 1 ? 'bg-amber-500 text-black' : res.rank === 2 ? 'bg-zinc-300 text-black' : res.rank === 3 ? 'bg-amber-800 text-white' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        #{res.rank}
                      </span>
                      <div>
                        <div className="font-semibold text-xs flex items-center gap-1.5">
                          <span>{res.participantName}</span>
                          {res.isWinner && (
                            <span className="text-[9px] bg-amber-500 text-black font-extrabold px-1.5 py-0.5 rounded uppercase">
                              👑 BOOYAH!
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          Kills: {res.kills} • Placement: {res.placementPoints} pts
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-amber-400 font-subheading">
                        {res.totalPoints} PTS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-zinc-400 block text-[10px] uppercase">Entry Cost</span>
            <span className="font-bold text-emerald-400">FREE TO PLAY</span>
          </div>

          <div>
            {isRegistered ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 rounded-xl font-semibold">
                <Check className="w-4 h-4" />
                <span>Slot #{userReg?.slotNumber} Confirmed</span>
              </div>
            ) : tournament.status === 'completed' ? (
              <span className="text-xs text-zinc-500 font-semibold">Tournament Finished</span>
            ) : isFull ? (
              <button
                disabled
                className="py-2 px-4 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-500 cursor-not-allowed"
              >
                Slots Full
              </button>
            ) : (
              <button
                onClick={() => onOpenRegister(tournament)}
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Register Now (Free)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
