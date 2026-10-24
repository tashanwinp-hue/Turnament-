import React from 'react';
import { Users, Clock, Trophy, MapPin, Key, CheckCircle, ShieldCheck } from 'lucide-react';
import { Tournament, Registration } from '../types/tournament.ts';
import { formatPrizePool } from '../utils/tournamentRules.ts';

interface TournamentCardProps {
  tournament: Tournament;
  userRegistration?: Registration;
  onSelect: (tournament: Tournament) => void;
  isAdmin?: boolean;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  userRegistration,
  onSelect,
  isAdmin,
}) => {
  const percentFilled = Math.min(100, Math.round((tournament.registeredCount / tournament.maxSlots) * 100));
  const isFull = tournament.registeredCount >= tournament.maxSlots;
  const isRegistered = !!userRegistration;

  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'room_released':
        return (
          <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            <Key className="w-3 h-3" /> Room Out
          </span>
        );
      case 'live':
        return (
          <span className="flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Live Match
          </span>
        );
      case 'completed':
        return (
          <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
            Completed
          </span>
        );
      case 'open':
        return (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {isFull ? 'Slots Full' : 'Registration Open'}
          </span>
        );
      default:
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
            Upcoming
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(tournament)}
      className="group relative bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Badges */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
              tournament.mode === 'br'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}>
              {tournament.mode === 'br' ? 'Battle Royale (BR)' : 'Clash Squad (CS)'}
            </span>
            <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md uppercase tracking-wider border border-zinc-700">
              {tournament.format}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isRegistered && (
              <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Registered (Slot #{userRegistration.slotNumber})
              </span>
            )}
            {getStatusBadge()}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-heading text-xl text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
          {tournament.title}
        </h3>

        {/* Meta info row */}
        <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs text-zinc-300">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate">{tournament.map}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate">{tournament.scheduleTime}</span>
          </div>
        </div>

        {/* Prize Pool and Entry fee */}
        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase">Prize Pool</span>
              <span className="font-subheading font-bold text-amber-400 text-sm">
                {formatPrizePool(tournament.prizePool)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block uppercase">Entry Fee</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              FREE ENTRY
            </span>
          </div>
        </div>
      </div>

      {/* Slots Progress bar & CTA */}
      <div className="mt-3 pt-2">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-zinc-400 flex items-center gap-1">
            <Users className="w-3 h-3 text-zinc-400" /> Slots Filled
          </span>
          <span className="font-semibold text-zinc-200">
            {tournament.registeredCount} / {tournament.maxSlots} {tournament.format === 'squad' ? 'Teams' : 'Players'}
          </span>
        </div>

        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              percentFilled >= 100
                ? 'bg-red-500'
                : percentFilled > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${percentFilled}%` }}
          />
        </div>

        {/* Bottom Action Hint */}
        <div className="mt-3 flex items-center justify-between">
          {tournament.status === 'room_released' && (isRegistered || isAdmin) ? (
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-lg w-full justify-center">
              <Key className="w-3.5 h-3.5" />
              <span>Room ID & Pass Available</span>
            </div>
          ) : (
            <button
              onClick={e => {
                e.stopPropagation();
                onSelect(tournament);
              }}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-200 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>{isRegistered ? 'View Match & Room Info' : isFull ? 'View Slots & Standby' : 'Join Match'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
