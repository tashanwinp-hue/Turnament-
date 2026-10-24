import React, { useState, useEffect } from 'react';
import {
  Swords,
  Flame,
  Search,
  Filter,
  Users,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Trophy,
  Key,
  Calendar,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { testConnection } from './firebase.ts';
import { Tournament, Registration, GameMode, TournamentFormat } from './types/tournament.ts';
import {
  seedInitialTournaments,
  subscribeToTournaments,
  subscribeToRegistrations,
} from './services/tournamentService.ts';
import { AndroidFrameProvider, AndroidFrameShell, useAndroidFrame } from './components/AndroidFrame.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav, NavTab } from './components/BottomNav.tsx';
import { TournamentCard } from './components/TournamentCard.tsx';
import { TournamentDetailModal } from './components/TournamentDetailModal.tsx';
import { RegistrationModal } from './components/RegistrationModal.tsx';
import { MyTournamentsView } from './components/MyTournamentsView.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AndroidSetupGuideModal } from './components/AndroidSetupGuideModal.tsx';

function MainTournamentApp() {
  const { currentUser, isAdmin } = useAuth();
  const { isPhoneView } = useAndroidFrame();

  const [currentTab, setCurrentTab] = useState<NavTab>('tournaments');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRegistrations, setUserRegistrations] = useState<Registration[]>([]);

  // Filters for Tournaments List
  const [modeFilter, setModeFilter] = useState<'all' | GameMode>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | TournamentFormat>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [detailTournament, setDetailTournament] = useState<Tournament | null>(null);
  const [registerTournament, setRegisterTournament] = useState<Tournament | null>(null);
  const [showAndroidGuide, setShowAndroidGuide] = useState<boolean>(false);
  const [bannerToast, setBannerToast] = useState<string | null>(null);

  // Initialize and load tournaments
  useEffect(() => {
    let unsubTournaments: (() => void) | null = null;

    const init = async () => {
      try {
        await testConnection();
        await seedInitialTournaments();
      } catch (err) {
        console.warn('Initialization note:', err);
      } finally {
        unsubTournaments = subscribeToTournaments(list => {
          setTournaments(list);
          setLoading(false);
        });
      }
    };

    init();
    return () => {
      if (unsubTournaments) unsubTournaments();
    };
  }, []);

  // Listen for user registrations across active tournaments
  useEffect(() => {
    if (!currentUser || tournaments.length === 0) {
      setUserRegistrations([]);
      return;
    }

    const unsubscribes: Array<() => void> = [];
    const registeredList: Registration[] = [];

    tournaments.forEach(t => {
      const unsub = subscribeToRegistrations(t.id, regs => {
        const userReg = regs.find(r => r.userId === currentUser.uid && r.status === 'confirmed');
        if (userReg) {
          registeredList.push(userReg);
        }
      });
      unsubscribes.push(unsub);
    });

    // Simple delay to aggregate registrations snapshot
    const timer = setTimeout(() => {
      // Remove duplicates by ID
      const unique = Array.from(new Map(registeredList.map(r => [r.id, r])).values());
      setUserRegistrations(unique);
    }, 400);

    return () => {
      clearTimeout(timer);
      unsubscribes.forEach(u => u());
    };
  }, [currentUser, tournaments]);

  // Filtered tournament list
  const filteredTournaments = tournaments.filter(t => {
    if (modeFilter !== 'all' && t.mode !== modeFilter) return false;
    if (formatFilter !== 'all' && t.format !== formatFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchMap = t.map.toLowerCase().includes(q);
      if (!matchTitle && !matchMap) return false;
    }
    return true;
  });

  const showToast = (msg: string) => {
    setBannerToast(msg);
    setTimeout(() => setBannerToast(null), 3500);
  };

  return (
    <AndroidFrameShell>
      <div className="min-h-full flex flex-col justify-between bg-zinc-950 text-zinc-100">
        {/* Esports Header */}
        <Header
          onOpenAndroidGuide={() => setShowAndroidGuide(true)}
          onOpenProfile={() => setCurrentTab('profile')}
        />

        {/* Global Toast Notification */}
        {bannerToast && (
          <div className="bg-amber-500 text-black font-bold text-xs py-2 px-4 text-center sticky top-[57px] z-40 shadow-lg animate-in slide-in-from-top duration-200">
            {bannerToast}
          </div>
        )}

        {/* Main Content by Tab */}
        <div className="flex-1 p-3 sm:p-5 max-w-5xl w-full mx-auto">
          {currentTab === 'tournaments' && (
            <div className="space-y-4">
              {/* Hero Banner with Free Fire Aesthetic */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600/30 via-zinc-900 to-amber-600/20 border border-orange-500/30 p-4 sm:p-6 shadow-xl">
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Free Fire Esports Season Active</span>
                  </div>
                  <h2 className="font-heading text-3xl sm:text-4xl text-white font-bold tracking-wide leading-none">
                    JOIN TOURNAMENTS & CLAIM BOOYAH
                  </h2>
                  <p className="text-xs text-zinc-300 mt-1.5 max-w-xl">
                    Compete in Free Fire Battle Royale (BR) & Clash Squad (CS) tournaments. Free entry, slot tracking, automated room ID release, and live leaderboards.
                  </p>
                </div>
              </div>

              {/* Mode & Format Filter Pills */}
              <div className={`flex justify-between gap-2.5 ${isPhoneView ? 'flex-col items-stretch' : 'flex-col sm:flex-row items-stretch sm:items-center'}`}>
                {/* Game Mode Switcher: ALL | BR | CS */}
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setModeFilter('all')}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                      modeFilter === 'all'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    All Modes
                  </button>
                  <button
                    onClick={() => setModeFilter('br')}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                      modeFilter === 'br'
                        ? 'bg-orange-500 text-black shadow-md font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Battle Royale (BR)
                  </button>
                  <button
                    onClick={() => setModeFilter('cs')}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                      modeFilter === 'cs'
                        ? 'bg-cyan-500 text-black shadow-md font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Clash Squad (CS)
                  </button>
                </div>

                {/* Format Filter: ALL | SOLO | DUO | SQUAD */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
                  <span className="text-zinc-500 text-[11px] uppercase mr-1 hidden sm:inline">Format:</span>
                  {(['all', 'solo', 'duo', 'squad'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFormatFilter(f)}
                      className={`px-2.5 py-1 rounded-lg border text-xs capitalize transition-all whitespace-nowrap ${
                        formatFilter === f
                          ? 'bg-zinc-800 border-amber-500 text-amber-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tournaments by name or map (Bermuda, Kalahari, Purgatory)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Tournament Grid */}
              {loading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">Loading Free Fire Tournaments...</p>
                </div>
              ) : filteredTournaments.length === 0 ? (
                <div className="text-center py-12 px-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                  <Swords className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                  <h3 className="font-heading text-xl text-zinc-200 font-bold">No Tournaments Found</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    No tournaments match the selected filters. Try switching modes or clearing your search.
                  </p>
                  <button
                    onClick={() => {
                      setModeFilter('all');
                      setFormatFilter('all');
                      setSearchQuery('');
                    }}
                    className="mt-3 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className={`grid gap-3.5 ${isPhoneView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {filteredTournaments.map(t => {
                    const userReg = userRegistrations.find(r => r.tournamentId === t.id);
                    return (
                      <TournamentCard
                        key={t.id}
                        tournament={t}
                        userRegistration={userReg}
                        onSelect={tour => setDetailTournament(tour)}
                        isAdmin={isAdmin}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {currentTab === 'my_matches' && (
            <MyTournamentsView
              tournaments={tournaments}
              registrations={userRegistrations}
              userEmail={currentUser?.email}
              onSelectTournament={t => setDetailTournament(t)}
              onExploreMatches={() => setCurrentTab('tournaments')}
            />
          )}

          {currentTab === 'leaderboard' && (
            <LeaderboardView tournaments={tournaments} />
          )}

          {currentTab === 'profile' && (
            <ProfileView />
          )}

          {currentTab === 'admin' && (
            <AdminDashboard tournaments={tournaments} />
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          registeredCount={userRegistrations.length}
        />

        {/* Tournament Detail Modal */}
        {detailTournament && (
          <TournamentDetailModal
            tournament={detailTournament}
            onClose={() => setDetailTournament(null)}
            onOpenRegister={t => {
              setDetailTournament(null);
              setRegisterTournament(t);
            }}
            currentUserEmail={currentUser?.email}
            currentUserId={currentUser?.uid}
          />
        )}

        {/* Registration Form Modal */}
        {registerTournament && (
          <RegistrationModal
            tournament={registerTournament}
            onClose={() => setRegisterTournament(null)}
            onSuccess={reg => {
              setRegisterTournament(null);
              showToast(`Slot #${reg.slotNumber} confirmed for ${registerTournament.title}!`);
              setUserRegistrations(prev => [...prev, reg]);
              setCurrentTab('my_matches');
            }}
          />
        )}

        {/* Android Phone Setup Guide Modal */}
        {showAndroidGuide && (
          <AndroidSetupGuideModal onClose={() => setShowAndroidGuide(false)} />
        )}
      </div>
    </AndroidFrameShell>
  );
}

export default function App() {
  return (
    <AndroidFrameProvider>
      <AuthProvider>
        <MainTournamentApp />
      </AuthProvider>
    </AndroidFrameProvider>
  );
}
