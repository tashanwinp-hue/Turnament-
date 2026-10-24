import React, { useState, useEffect } from 'react';
import { Trophy, Award, Flame, Users, Sparkles, Crosshair } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Tournament, MatchResult } from '../types/tournament.ts';
import { subscribeToMatchResults } from '../services/tournamentService.ts';

interface LeaderboardViewProps {
  tournaments: Tournament[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ tournaments }) => {
  // Prefer completed tournament first so standings and Booyah champion display immediately
  const completedTournament = tournaments.find(t => t.status === 'completed');
  const availableTournaments = tournaments.filter(t => t.status === 'completed' || t.status === 'live' || t.status === 'room_released');
  const initialTournament = completedTournament || availableTournaments[0] || tournaments[0];

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    initialTournament?.id || ''
  );
  const [results, setResults] = useState<MatchResult[]>([]);
  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId) || initialTournament;

  useEffect(() => {
    if (!selectedTournamentId && initialTournament) {
      setSelectedTournamentId(initialTournament.id);
    }
  }, [initialTournament, selectedTournamentId]);

  useEffect(() => {
    if (!selectedTournamentId) return;
    const unsub = subscribeToMatchResults(selectedTournamentId, list => {
      setResults(list);
      // Trigger victory confetti if results exist
      if (list.length > 0) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff'],
        });
      }
    });
    return () => unsub();
  }, [selectedTournamentId]);

  const winner = results.find(r => r.rank === 1);
  const runnerUp = results.find(r => r.rank === 2);
  const thirdPlace = results.find(r => r.rank === 3);

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl text-white font-bold tracking-wide flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>ESPORTS LEADERBOARD</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Official match standings, total kills, and placement points
          </p>
        </div>

        {/* Tournament Selector */}
        {tournaments.length > 0 && (
          <div className="w-full sm:w-auto">
            <select
              value={selectedTournamentId}
              onChange={e => setSelectedTournamentId(e.target.value)}
              className="w-full sm:w-72 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>
                  {t.mode.toUpperCase()} {t.format.toUpperCase()} - {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12 px-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
          <Award className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <h3 className="font-heading text-xl text-zinc-200 font-bold mb-1">
            Standings In Progress
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Match results for <strong>{selectedTournament?.title}</strong> will be published here upon official verification by tournament administration.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Winner Showcase Banner */}
          {winner && (
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/60 via-zinc-900 to-amber-950/60 border border-amber-500/50 rounded-2xl p-5 shadow-xl shadow-amber-500/10">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-40 h-40 text-amber-400" />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Trophy className="w-9 h-9 text-black fill-black" />
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>CHAMPION • BOOYAH!</span>
                    </div>
                    <h3 className="font-heading text-3xl text-white font-bold leading-none">
                      {winner.participantName}
                    </h3>
                    <div className="text-xs text-zinc-400 font-mono mt-1">
                      FF UID: {winner.freeFireUid}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-zinc-950/80 px-4 py-2.5 rounded-xl border border-zinc-800">
                  <div className="text-center px-2">
                    <span className="text-[10px] text-zinc-400 block uppercase">Kills</span>
                    <span className="font-heading text-2xl text-red-400 font-bold leading-none">
                      {winner.kills}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-zinc-800" />
                  <div className="text-center px-2">
                    <span className="text-[10px] text-zinc-400 block uppercase">Total Points</span>
                    <span className="font-heading text-2xl text-amber-400 font-bold leading-none">
                      {winner.totalPoints} PTS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top 3 Podium (when >= 3 results) */}
          {results.length >= 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {winner && (
                <div className="bg-gradient-to-b from-amber-500/20 to-zinc-900 border border-amber-500/40 p-4 rounded-xl text-center flex flex-col justify-between order-1 sm:order-2">
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-black font-extrabold flex items-center justify-center text-xs mx-auto mb-2 shadow-md">
                    #1
                  </div>
                  <div className="font-heading text-xl text-amber-300 font-bold truncate">
                    {winner.participantName}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {winner.kills} Kills • <strong className="text-amber-400">{winner.totalPoints} pts</strong>
                  </div>
                </div>
              )}

              {runnerUp && (
                <div className="bg-zinc-900 border border-zinc-700/80 p-4 rounded-xl text-center flex flex-col justify-between order-2 sm:order-1">
                  <div className="w-7 h-7 rounded-full bg-zinc-300 text-black font-extrabold flex items-center justify-center text-xs mx-auto mb-2 shadow-md">
                    #2
                  </div>
                  <div className="font-heading text-xl text-zinc-200 font-bold truncate">
                    {runnerUp.participantName}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {runnerUp.kills} Kills • <strong className="text-zinc-200">{runnerUp.totalPoints} pts</strong>
                  </div>
                </div>
              )}

              {thirdPlace && (
                <div className="bg-zinc-900 border border-zinc-700/80 p-4 rounded-xl text-center flex flex-col justify-between order-3">
                  <div className="w-7 h-7 rounded-full bg-amber-800 text-zinc-100 font-extrabold flex items-center justify-center text-xs mx-auto mb-2 shadow-md">
                    #3
                  </div>
                  <div className="font-heading text-xl text-zinc-200 font-bold truncate">
                    {thirdPlace.participantName}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {thirdPlace.kills} Kills • <strong className="text-zinc-200">{thirdPlace.totalPoints} pts</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span>Full Standings Table</span>
              <span>{results.length} Competitors</span>
            </div>

            <div className="divide-y divide-zinc-800/80 text-xs">
              {results.map(res => (
                <div
                  key={res.id}
                  className={`flex items-center justify-between p-3.5 transition-colors ${
                    res.rank === 1 ? 'bg-amber-500/5' : 'hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-md font-mono text-xs flex items-center justify-center font-bold ${
                        res.rank === 1
                          ? 'bg-amber-500 text-black'
                          : res.rank === 2
                          ? 'bg-zinc-300 text-black'
                          : res.rank === 3
                          ? 'bg-amber-800 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {res.rank}
                    </span>

                    <div>
                      <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                        <span>{res.participantName}</span>
                        {res.teamName && (
                          <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 rounded">
                            {res.teamName}
                          </span>
                        )}
                        {res.rank === 1 && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded uppercase font-bold">
                            Booyah
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        FF UID: {res.freeFireUid}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="text-zinc-400">
                      <span className="text-[10px] block uppercase text-zinc-500">Kills</span>
                      <span className="font-semibold text-zinc-200">{res.kills}</span>
                    </div>

                    <div className="text-zinc-400">
                      <span className="text-[10px] block uppercase text-zinc-500">Placement</span>
                      <span className="font-semibold text-zinc-200">{res.placementPoints}</span>
                    </div>

                    <div className="min-w-[60px]">
                      <span className="text-[10px] block uppercase text-zinc-500">Total</span>
                      <span className="font-subheading font-bold text-amber-400 text-sm">
                        {res.totalPoints} PTS
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
