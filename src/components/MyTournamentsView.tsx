import React, { useState } from 'react';
import { Key, Copy, Check, Calendar, Trophy, AlertCircle, Swords, ArrowRight, ShieldCheck } from 'lucide-react';
import { Tournament, Registration } from '../types/tournament.ts';
import { canAccessRoomCredentials } from '../utils/tournamentRules.ts';

interface MyTournamentsViewProps {
  tournaments: Tournament[];
  registrations: Registration[];
  userEmail?: string | null;
  onSelectTournament: (tournament: Tournament) => void;
  onExploreMatches: () => void;
}

export const MyTournamentsView: React.FC<MyTournamentsViewProps> = ({
  tournaments,
  registrations,
  userEmail,
  onSelectTournament,
  onExploreMatches,
}) => {
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Match tournaments with user's registrations
  const userTournaments = registrations.map(reg => {
    const tour = tournaments.find(t => t.id === reg.tournamentId);
    return { reg, tour };
  }).filter(item => item.tour !== undefined) as Array<{ reg: Registration; tour: Tournament }>;

  const activeTournaments = userTournaments.filter(
    item => item.tour.status !== 'completed' && item.tour.status !== 'cancelled'
  );
  const completedTournaments = userTournaments.filter(
    item => item.tour.status === 'completed'
  );

  const displayedList = filter === 'active' ? activeTournaments : completedTournaments;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-white font-bold tracking-wide">
            MY TOURNAMENTS
          </h2>
          <p className="text-xs text-zinc-400">
            Track your registered slots, room credentials, and tournament results
          </p>
        </div>

        {/* Tab Filter */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex items-center text-xs">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filter === 'active'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Active ({activeTournaments.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filter === 'completed'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            History ({completedTournaments.length})
          </button>
        </div>
      </div>

      {/* Tournaments List */}
      {displayedList.length === 0 ? (
        <div className="text-center py-12 px-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80">
          <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-heading text-xl text-zinc-200 font-bold mb-1">
            {filter === 'active' ? 'No Active Tournaments' : 'No Match History Yet'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            {filter === 'active'
              ? 'You have not joined any upcoming Battle Arena tournaments yet. Claim your free slot now!'
              : 'Matches you compete in will appear here with your placement and points breakdown.'}
          </p>
          {filter === 'active' && (
            <button
              onClick={onExploreMatches}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-lg shadow-amber-500/20"
            >
              <span>Explore Tournaments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedList.map(({ reg, tour }) => {
            const hasRoomAccess = canAccessRoomCredentials(userEmail, tour.status, true);

            return (
              <div
                key={reg.id}
                onClick={() => onSelectTournament(tour)}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all cursor-pointer flex flex-col gap-3"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                        tour.mode === 'br'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {tour.mode.toUpperCase()} {tour.format.toUpperCase()}
                      </span>
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
                        {tour.map}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                        Slot #{reg.slotNumber}
                      </span>
                    </div>

                    <h3 className="font-heading text-lg text-white font-bold leading-snug">
                      {tour.title}
                    </h3>
                  </div>

                  <span className="text-xs text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                    {tour.scheduleTime}
                  </span>
                </div>

                {/* Custom Room Secret Access Box */}
                {hasRoomAccess && tour.roomId ? (
                  <div
                    onClick={e => e.stopPropagation()}
                    className="bg-gradient-to-r from-emerald-950/70 to-zinc-950 border border-emerald-500/50 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Key className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                          Custom Room Active
                        </span>
                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span>
                            ID: <strong className="text-amber-400">{tour.roomId}</strong>
                          </span>
                          <span>
                            Pass: <strong className="text-amber-400">{tour.roomPassword}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => copyText(`${tour.roomId}`, `id_${tour.id}`)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        {copiedId === `id_${tour.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy ID</span>
                      </button>

                      <button
                        onClick={() => copyText(`${tour.roomPassword}`, `pass_${tour.id}`)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        {copiedId === `pass_${tour.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Pass</span>
                      </button>
                    </div>
                  </div>
                ) : tour.status === 'completed' ? (
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Match Completed</span>
                    <span className="text-amber-400 font-semibold">View Leaderboard & Standings →</span>
                  </div>
                ) : (
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Room ID will be revealed 15 minutes before match start.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
