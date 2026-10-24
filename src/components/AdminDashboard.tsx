import React, { useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Key,
  Award,
  Users,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Loader2,
  Crown,
  Sparkles,
} from 'lucide-react';
import { Tournament, GameMode, TournamentFormat, TournamentStatus, Registration } from '../types/tournament.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ADMIN_EMAIL } from '../firebase.ts';
import {
  createTournament,
  updateTournament,
  deleteTournament,
  saveMatchResults,
} from '../services/tournamentService.ts';
import { calculateBrPoints, calculateCsPoints } from '../utils/tournamentRules.ts';

interface AdminDashboardProps {
  tournaments: Tournament[];
  onTournamentChanged?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ tournaments }) => {
  const { currentUser, isAdmin, simulateLoginAs } = useAuth();

  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'results' | 'participants'>('manage');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Form state for Create Tournament
  const [newTitle, setNewTitle] = useState('');
  const [newMode, setNewMode] = useState<GameMode>('br');
  const [newFormat, setNewFormat] = useState<TournamentFormat>('squad');
  const [newMap, setNewMap] = useState('Bermuda');
  const [newMaxSlots, setNewMaxSlots] = useState<number>(12);
  const [newPrizePool, setNewPrizePool] = useState('₹2,000 + Badges');
  const [newSchedule, setNewSchedule] = useState('Tomorrow, 08:30 PM IST');
  const [newRules, setNewRules] = useState('Official Free Fire esports rules. Character skills ON, Gun skins OFF. No emulators or scripts. Join room 15 min prior.');

  // Room modal state
  const [selectedTournamentForRoom, setSelectedTournamentForRoom] = useState<Tournament | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPassInput, setRoomPassInput] = useState('');

  // Results submission state
  const [resultTournamentId, setResultTournamentId] = useState<string>(tournaments[0]?.id || '');
  const [resultEntries, setResultEntries] = useState<Array<{
    rank: number;
    participantName: string;
    teamName: string;
    freeFireUid: string;
    kills: number;
  }>>([
    { rank: 1, participantName: 'Team Alpha', teamName: 'Alpha Esports', freeFireUid: '1098234155', kills: 12 },
    { rank: 2, participantName: 'Team Titans', teamName: 'Titans', freeFireUid: '9847291048', kills: 6 },
    { rank: 3, participantName: 'Team Phoenix', teamName: 'Phoenix', freeFireUid: '7482910384', kills: 5 },
  ]);

  // Access Guard: If not logged in as authorized admin
  if (!isAdmin) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center max-w-lg mx-auto my-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-heading text-2xl text-white font-bold">
            ADMIN AUTHORIZATION REQUIRED
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Tournament creation, room credentials release, and result verification are securely restricted to the owner-admin:
          </p>
          <div className="mt-2 inline-block bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono text-amber-400">
            {ADMIN_EMAIL}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => simulateLoginAs(ADMIN_EMAIL, 'Admin Owner')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all"
          >
            <Crown className="w-4 h-4 text-black fill-black" />
            <span>Sign In As Authorized Owner-Admin</span>
          </button>
        </div>
      </div>
    );
  }

  // Handle Create Tournament Submit
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      setSubmitting(true);
      await createTournament({
        title: newTitle.trim(),
        game: 'free_fire',
        mode: newMode,
        format: newFormat,
        map: newMap,
        entryFee: 0, // Free entry mandatory
        prizePool: newPrizePool.trim(),
        maxSlots: Number(newMaxSlots),
        scheduleTime: newSchedule.trim(),
        status: 'open',
        rules: newRules.trim(),
        createdBy: ADMIN_EMAIL,
      });

      setFeedback({ text: 'Tournament created successfully in Cloud Firestore!' });
      setNewTitle('');
      setActiveTab('manage');
    } catch (err: unknown) {
      setFeedback({ text: err instanceof Error ? err.message : 'Creation failed', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Room Release
  const handleReleaseRoom = async () => {
    if (!selectedTournamentForRoom) return;
    if (!roomIdInput.trim() || !roomPassInput.trim()) {
      setFeedback({ text: 'Both Custom Room ID and Password are required.', isError: true });
      return;
    }
    try {
      setSubmitting(true);
      await updateTournament(selectedTournamentForRoom.id, {
        roomId: roomIdInput.trim(),
        roomPassword: roomPassInput.trim(),
        status: 'room_released',
      });
      setFeedback({ text: `Room credentials released to registered participants of "${selectedTournamentForRoom.title}"!` });
      setSelectedTournamentForRoom(null);
      setRoomIdInput('');
      setRoomPassInput('');
    } catch (err: unknown) {
      setFeedback({ text: err instanceof Error ? err.message : 'Update failed', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Status Change
  const handleStatusChange = async (tournamentId: string, status: TournamentStatus) => {
    try {
      await updateTournament(tournamentId, { status });
      setFeedback({ text: `Status updated to ${status.toUpperCase()}` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      setFeedback({ text: err instanceof Error ? err.message : 'Status update failed', isError: true });
    }
  };

  // Handle Delete
  const handleDelete = async (tournamentId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete tournament "${title}"?`)) return;
    try {
      await deleteTournament(tournamentId);
      setFeedback({ text: `Tournament deleted.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      setFeedback({ text: err instanceof Error ? err.message : 'Delete failed', isError: true });
    }
  };

  // Results submission
  const handlePublishResults = async () => {
    if (!resultTournamentId) return;
    const tour = tournaments.find(t => t.id === resultTournamentId);
    if (!tour) return;

    try {
      setSubmitting(true);
      await saveMatchResults(tour.id, tour.mode, resultEntries);
      setFeedback({ text: `Results & Booyah leaderboard published for ${tour.title}!` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      setFeedback({ text: err instanceof Error ? err.message : 'Publish failed', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-2xl text-white font-bold tracking-wide">
              ADMIN DASHBOARD
            </h2>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              OWNER-ADMIN
            </span>
          </div>
          <p className="text-zinc-400">
            Secure tournament creation, custom room release, and match scoring
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'manage' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Manage ({tournaments.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'create' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Match</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'results' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Publish Results</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2 ${
            feedback.isError
              ? 'bg-red-500/10 border border-red-500/30 text-red-300'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          {feedback.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tab: Manage Tournaments */}
      {activeTab === 'manage' && (
        <div className="space-y-3">
          {tournaments.length === 0 ? (
            <div className="text-center py-10 bg-zinc-900 rounded-2xl border border-zinc-800">
              <p className="text-zinc-400">No tournaments created yet.</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-3 py-1.5 px-3 rounded-lg bg-amber-500 text-black font-bold"
              >
                Create First Tournament
              </button>
            </div>
          ) : (
            tournaments.map(t => (
              <div
                key={t.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      t.mode === 'br' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {t.mode.toUpperCase()} {t.format.toUpperCase()}
                    </span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                      {t.map}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold">
                      Slots: {t.registeredCount} / {t.maxSlots}
                    </span>
                  </div>
                  <h4 className="font-heading text-lg text-white font-bold leading-tight">
                    {t.title}
                  </h4>
                  <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>{t.scheduleTime}</span>
                    {t.roomId && (
                      <span className="text-emerald-400 font-mono">
                        • Room: {t.roomId} (Pass: {t.roomPassword})
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Switcher & Room Action */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Status selector */}
                  <select
                    value={t.status}
                    onChange={e => handleStatusChange(t.id, e.target.value as TournamentStatus)}
                    className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="open">Open</option>
                    <option value="room_released">Room Released</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {/* Release Room Credentials Button */}
                  <button
                    onClick={() => {
                      setSelectedTournamentForRoom(t);
                      setRoomIdInput(t.roomId || '');
                      setRoomPassInput(t.roomPassword || '');
                    }}
                    className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-300 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Set Room ID</span>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(t.id, t.title)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                    title="Delete tournament"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Create Tournament */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateTournament} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-heading text-xl text-white font-bold flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-500" />
            <span>CREATE FREE FIRE TOURNAMENT</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="text-zinc-300 font-semibold block mb-1">Tournament Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Free Fire Bermuda Masters BR Series #108"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 focus:border-amber-500"
              />
            </div>

            {/* Mode: BR or CS */}
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Game Mode *</label>
              <select
                value={newMode}
                onChange={e => {
                  const m = e.target.value as GameMode;
                  setNewMode(m);
                  if (m === 'cs') setNewMaxSlots(8);
                  else setNewMaxSlots(12);
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
              >
                <option value="br">Battle Royale (BR)</option>
                <option value="cs">Clash Squad (CS)</option>
              </select>
            </div>

            {/* Format: Solo, Duo, Squad */}
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Format *</label>
              <select
                value={newFormat}
                onChange={e => {
                  const f = e.target.value as TournamentFormat;
                  setNewFormat(f);
                  if (newMode === 'br') {
                    if (f === 'solo') setNewMaxSlots(48);
                    else if (f === 'duo') setNewMaxSlots(24);
                    else setNewMaxSlots(12);
                  }
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
              >
                <option value="solo">Solo (1 Player)</option>
                <option value="duo">Duo (2 Players)</option>
                <option value="squad">Squad (4 Players)</option>
              </select>
            </div>

            {/* Map */}
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Map *</label>
              <select
                value={newMap}
                onChange={e => setNewMap(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
              >
                <option value="Bermuda">Bermuda</option>
                <option value="Purgatory">Purgatory</option>
                <option value="Kalahari">Kalahari</option>
                <option value="Alpine">Alpine</option>
                <option value="NexTerra">NexTerra</option>
              </select>
            </div>

            {/* Max Slots */}
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Max Slots (Teams/Players) *</label>
              <input
                type="number"
                min={2}
                max={48}
                value={newMaxSlots}
                onChange={e => setNewMaxSlots(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
              />
            </div>

            {/* Prize Pool */}
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Prize Pool / Glory *</label>
              <input
                type="text"
                value={newPrizePool}
                onChange={e => setNewPrizePool(e.target.value)}
                placeholder="e.g. ₹2,000 + Badges"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
              />
            </div>

            {/* Schedule */}
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Schedule Time *</label>
              <input
                type="text"
                value={newSchedule}
                onChange={e => setNewSchedule(e.target.value)}
                placeholder="e.g. Today, 09:00 PM IST"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
              />
            </div>

            {/* Rules */}
            <div className="sm:col-span-2">
              <label className="text-zinc-300 font-semibold block mb-1">Rules & Fair Play *</label>
              <textarea
                rows={3}
                value={newRules}
                onChange={e => setNewRules(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Publish Tournament</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Publish Match Results */}
      {activeTab === 'results' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl text-white font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>OFFICIAL RESULTS & POINTS ENTRY</span>
              </h3>
              <p className="text-zinc-400">
                Placement points (1st=12pts, 2nd=9pts...) + 1 pt per kill are computed automatically.
              </p>
            </div>

            <select
              value={resultTournamentId}
              onChange={e => setResultTournamentId(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200"
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {/* Results Entries Editor */}
          <div className="space-y-3">
            {resultEntries.map((entry, index) => {
              const selectedTour = tournaments.find(t => t.id === resultTournamentId);
              const isBr = selectedTour?.mode !== 'cs';
              const pts = isBr
                ? calculateBrPoints(entry.rank, entry.kills)
                : calculateCsPoints(entry.rank === 1, entry.kills);

              return (
                <div
                  key={index}
                  className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center"
                >
                  <div className="sm:col-span-1">
                    <label className="text-[10px] text-zinc-500 uppercase block">Rank</label>
                    <input
                      type="number"
                      min={1}
                      max={48}
                      value={entry.rank}
                      onChange={e => {
                        const copy = [...resultEntries];
                        copy[index].rank = Number(e.target.value);
                        setResultEntries(copy);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-center font-bold text-amber-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-zinc-500 uppercase block">Participant / Team Name</label>
                    <input
                      type="text"
                      value={entry.participantName}
                      onChange={e => {
                        const copy = [...resultEntries];
                        copy[index].participantName = e.target.value;
                        setResultEntries(copy);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-200"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="text-[10px] text-zinc-500 uppercase block">Free Fire UID</label>
                    <input
                      type="text"
                      value={entry.freeFireUid}
                      onChange={e => {
                        const copy = [...resultEntries];
                        copy[index].freeFireUid = e.target.value;
                        setResultEntries(copy);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 font-mono text-zinc-200"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="text-[10px] text-zinc-500 uppercase block">Kills</label>
                    <input
                      type="number"
                      min={0}
                      value={entry.kills}
                      onChange={e => {
                        const copy = [...resultEntries];
                        copy[index].kills = Number(e.target.value);
                        setResultEntries(copy);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-center font-bold text-red-400"
                    />
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <label className="text-[10px] text-zinc-500 uppercase block">Total Points</label>
                    <span className="font-heading text-lg font-bold text-amber-400">
                      {pts.totalPoints} PTS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setResultEntries([
                  ...resultEntries,
                  {
                    rank: resultEntries.length + 1,
                    participantName: `Team Player ${resultEntries.length + 1}`,
                    teamName: '',
                    freeFireUid: '1098200000',
                    kills: 2,
                  },
                ]);
              }}
              className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              + Add Competitor Row
            </button>

            <button
              onClick={handlePublishResults}
              disabled={submitting}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Save & Publish Standings</span>
            </button>
          </div>
        </div>
      )}

      {/* Set Room Modal */}
      {selectedTournamentForRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-heading text-xl text-white font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" />
                <span>RELEASE ROOM CREDENTIALS</span>
              </h3>
              <button
                onClick={() => setSelectedTournamentForRoom(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-zinc-400 text-xs">
              Setting and releasing credentials for: <strong className="text-zinc-200">{selectedTournamentForRoom.title}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Custom Room ID *</label>
                <input
                  type="text"
                  placeholder="e.g. 9840214"
                  value={roomIdInput}
                  onChange={e => setRoomIdInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 font-mono text-amber-400"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Room Password *</label>
                <input
                  type="text"
                  placeholder="e.g. 777"
                  value={roomPassInput}
                  onChange={e => setRoomPassInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 font-mono text-amber-400"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedTournamentForRoom(null)}
                className="py-2 px-3 rounded-xl bg-zinc-800 text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReleaseRoom}
                disabled={submitting}
                className="py-2 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                <span>Release to Players</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
