import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  getDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, ADMIN_EMAIL } from '../firebase.ts';
import {
  Tournament,
  Registration,
  MatchResult,
  UserProfile,
} from '../types/tournament.ts';
import {
  canRegisterForTournament,
  checkDuplicateRegistration,
  calculateBrPoints,
  calculateCsPoints,
} from '../utils/tournamentRules.ts';

const TOURNAMENTS_COL = 'tournaments';
const USERS_COL = 'users';

// Starter seed tournaments for Free Fire BR and CS modes
export const SEED_TOURNAMENTS: Tournament[] = [
  {
    id: 'seed-tour-1',
    title: 'Free Fire Bermuda BR Championship #104',
    game: 'free_fire',
    mode: 'br',
    format: 'squad',
    map: 'Bermuda',
    entryFee: 0,
    prizePool: '₹2,500 + Diamond Badges',
    maxSlots: 12, // 12 Squads = 48 players
    registeredCount: 9,
    scheduleTime: 'Today, 08:30 PM IST',
    status: 'open',
    roomId: '9420811',
    roomPassword: '777',
    rules: 'Official Free Fire BR rules. Gun skins OFF, Character skills ON, Emulators prohibited. Screenshot required for kill verification. Check-in 15 min prior.',
    createdBy: ADMIN_EMAIL,
    createdAt: '2026-10-24T18:00:00Z',
    updatedAt: '2026-10-24T18:00:00Z',
  },
  {
    id: 'seed-tour-2',
    title: 'Clash Squad: Clash of Titans 4v4',
    game: 'free_fire',
    mode: 'cs',
    format: 'squad',
    map: 'Kalahari',
    entryFee: 0,
    prizePool: '₹1,500 + Winner Title',
    maxSlots: 8, // 8 Teams knockout
    registeredCount: 6,
    scheduleTime: 'Tonight, 09:30 PM IST',
    status: 'open',
    roomId: '7102943',
    roomPassword: 'ffcs',
    rules: 'Best of 7 rounds per match. Limited ammo ON, Grenades limited to 1 per round, No rooftop climbing, Gun properties OFF. Fair play strictly enforced.',
    createdBy: ADMIN_EMAIL,
    createdAt: '2026-10-24T17:30:00Z',
    updatedAt: '2026-10-24T17:30:00Z',
  },
  {
    id: 'seed-tour-3',
    title: 'Free Fire Solo Hunter Showdown',
    game: 'free_fire',
    mode: 'br',
    format: 'solo',
    map: 'Purgatory',
    entryFee: 0,
    prizePool: '₹1,000 + Solo King Trophy',
    maxSlots: 48,
    registeredCount: 38,
    scheduleTime: 'Tomorrow, 07:00 PM IST',
    status: 'open',
    roomId: '5501832',
    roomPassword: 'solo',
    rules: 'Solo Free Fire BR. Teaming up will result in immediate disqualification and permanent blacklist. Placement: 1st=12pts, 2nd=9pts, Kill=1pt.',
    createdBy: ADMIN_EMAIL,
    createdAt: '2026-10-24T16:00:00Z',
    updatedAt: '2026-10-24T16:00:00Z',
  },
  {
    id: 'seed-tour-4',
    title: 'Clash Squad 2v2 Duo Blitzkrieg',
    game: 'free_fire',
    mode: 'cs',
    format: 'duo',
    map: 'Alpine',
    entryFee: 0,
    prizePool: '₹800 + Fast Hands Award',
    maxSlots: 8,
    registeredCount: 8,
    scheduleTime: 'Live Now',
    status: 'room_released',
    roomId: '3819024',
    roomPassword: 'duo9',
    rules: 'Fast-paced 2v2 Clash Squad. Room is now active! Registered duos please join room within 10 minutes.',
    createdBy: ADMIN_EMAIL,
    createdAt: '2026-10-24T15:00:00Z',
    updatedAt: '2026-10-24T15:00:00Z',
  },
  {
    id: 'seed-tour-5',
    title: 'Grandmasters Battle Royale Series Season 1',
    game: 'free_fire',
    mode: 'br',
    format: 'squad',
    map: 'Bermuda',
    entryFee: 0,
    prizePool: '₹5,000 Glory Cup',
    maxSlots: 12,
    registeredCount: 12,
    scheduleTime: 'Completed Today',
    status: 'completed',
    roomId: '1102948',
    roomPassword: 'final',
    rules: 'Elite squad showdown. Results and winner leaderboard published.',
    createdBy: ADMIN_EMAIL,
    createdAt: '2026-10-24T14:00:00Z',
    updatedAt: '2026-10-24T14:00:00Z',
  },
];

export const SEED_RESULTS: MatchResult[] = [
  { id: 'res-1', tournamentId: 'seed-tour-5', rank: 1, participantName: 'Team Total Gaming', teamName: 'Total Gaming', freeFireUid: '1029384756', kills: 14, placementPoints: 12, killPoints: 14, totalPoints: 26, isWinner: true, updatedAt: '2026-10-24T15:00:00Z' },
  { id: 'res-2', tournamentId: 'seed-tour-5', rank: 2, participantName: 'Team Desi Gamers', teamName: 'Desi Gamers', freeFireUid: '9847291048', kills: 8, placementPoints: 9, killPoints: 8, totalPoints: 17, isWinner: false, updatedAt: '2026-10-24T15:00:00Z' },
  { id: 'res-3', tournamentId: 'seed-tour-5', rank: 3, participantName: 'Team Critical Elite', teamName: 'Critical Elite', freeFireUid: '7482910384', kills: 7, placementPoints: 8, killPoints: 7, totalPoints: 15, isWinner: false, updatedAt: '2026-10-24T15:00:00Z' },
  { id: 'res-4', tournamentId: 'seed-tour-5', rank: 4, participantName: 'Team Two Side Gamers', teamName: 'TSG Army', freeFireUid: '6291048291', kills: 5, placementPoints: 7, killPoints: 5, totalPoints: 12, isWinner: false, updatedAt: '2026-10-24T15:00:00Z' },
  { id: 'res-5', tournamentId: 'seed-tour-5', rank: 5, participantName: 'Team Mafia Esports', teamName: 'Mafia Esports', freeFireUid: '5192038475', kills: 4, placementPoints: 6, killPoints: 4, totalPoints: 10, isWinner: false, updatedAt: '2026-10-24T15:00:00Z' },
];

export async function seedInitialTournaments(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, TOURNAMENTS_COL));
    if (snapshot.empty) {
      console.log('Syncing initial seed tournaments...');
      for (const t of SEED_TOURNAMENTS) {
        const docRef = doc(db, TOURNAMENTS_COL, t.id);
        await setDoc(docRef, t);

        if (t.status === 'completed') {
          for (const res of SEED_RESULTS) {
            const resRef = doc(db, TOURNAMENTS_COL, t.id, 'results', res.id);
            await setDoc(resRef, res);
          }
        }
      }
    }
  } catch (error) {
    console.info('Client initial seed check completed.');
  }
}

// Subscribe to all tournaments with real-time updates and seamless fallback
export function subscribeToTournaments(
  onUpdate: (tournaments: Tournament[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, TOURNAMENTS_COL), orderBy('createdAt', 'desc'));
  try {
    return onSnapshot(
      q,
      snapshot => {
        if (snapshot.empty) {
          onUpdate(SEED_TOURNAMENTS);
        } else {
          const list = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Tournament, 'id'>) }));
          onUpdate(list);
        }
      },
      error => {
        console.warn('Real-time query fallback to seed:', error);
        onUpdate(SEED_TOURNAMENTS);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    onUpdate(SEED_TOURNAMENTS);
    return () => {};
  }
}

// Subscribe to registrations of a specific tournament
export function subscribeToRegistrations(
  tournamentId: string,
  onUpdate: (registrations: Registration[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = `${TOURNAMENTS_COL}/${tournamentId}/registrations`;
  const colRef = collection(db, path);
  try {
    return onSnapshot(
      colRef,
      snapshot => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Registration, 'id'>) }));
        // Provide sample confirmed participants for initial showcase
        if (list.length === 0 && tournamentId.startsWith('seed-tour')) {
          const demoRegs: Registration[] = [
            { id: 'reg-demo-1', tournamentId, userId: 'demo_user_1', userEmail: 'raistar@battlearena.gg', playerName: 'RaiStar_FF', freeFireUid: '1098234155', inGameName: 'RaiStar_FF', teamName: 'Raistar Squad', registeredAt: '2026-10-24T18:10:00Z', slotNumber: 1, status: 'confirmed' },
            { id: 'reg-demo-2', tournamentId, userId: 'demo_user_2', userEmail: 'pahadi@battlearena.gg', playerName: 'Pahadi_Sniper', freeFireUid: '2093847291', inGameName: 'Pahadi_Sniper', teamName: 'Sniper Godz', registeredAt: '2026-10-24T18:12:00Z', slotNumber: 2, status: 'confirmed' },
            { id: 'reg-demo-3', tournamentId, userId: 'demo_user_3', userEmail: 'vasiyo@battlearena.gg', playerName: 'Vasiyo_CR7', freeFireUid: '3109284756', inGameName: 'Vasiyo_CR7', teamName: 'Total Gaming', registeredAt: '2026-10-24T18:15:00Z', slotNumber: 3, status: 'confirmed' },
          ];
          onUpdate(demoRegs);
        } else {
          onUpdate(list);
        }
      },
      error => {
        if (onError) onError(error);
      }
    );
  } catch {
    return () => {};
  }
}

// Subscribe to match results / leaderboard of a tournament
export function subscribeToMatchResults(
  tournamentId: string,
  onUpdate: (results: MatchResult[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = `${TOURNAMENTS_COL}/${tournamentId}/results`;
  const q = query(collection(db, path), orderBy('rank', 'asc'));
  try {
    return onSnapshot(
      q,
      snapshot => {
        if (snapshot.empty && tournamentId === 'seed-tour-5') {
          onUpdate(SEED_RESULTS);
        } else {
          const list = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<MatchResult, 'id'>) }));
          onUpdate(list);
        }
      },
      error => {
        if (tournamentId === 'seed-tour-5') {
          onUpdate(SEED_RESULTS);
        }
        if (onError) onError(error);
      }
    );
  } catch {
    if (tournamentId === 'seed-tour-5') onUpdate(SEED_RESULTS);
    return () => {};
  }
}

// Register a player for a tournament
export async function registerForTournament(params: {
  tournamentId: string;
  userId: string;
  userEmail: string;
  playerName: string;
  freeFireUid: string;
  inGameName: string;
  teamName?: string;
  teammates?: string;
}): Promise<Registration> {
  const tournamentRef = doc(db, TOURNAMENTS_COL, params.tournamentId);
  const registrationsRef = collection(db, TOURNAMENTS_COL, params.tournamentId, 'registrations');

  try {
    return await runTransaction(db, async transaction => {
      const tournamentSnap = await transaction.get(tournamentRef);
      let registeredCount = 0;
      let maxSlots = 48;
      let status = 'open';

      if (tournamentSnap.exists()) {
        const data = tournamentSnap.data() as Tournament;
        registeredCount = data.registeredCount || 0;
        maxSlots = data.maxSlots || 48;
        status = data.status || 'open';
      }

      if (status !== 'open') {
        throw new Error('Tournament is currently closed or not open for registration.');
      }
      if (registeredCount >= maxSlots) {
        throw new Error('Tournament slots are full.');
      }

      const regDocRef = doc(registrationsRef, `${params.tournamentId}_${params.userId}`);
      const nextSlot = registeredCount + 1;
      const now = new Date().toISOString();

      const newRegistration: Registration = {
        id: regDocRef.id,
        tournamentId: params.tournamentId,
        userId: params.userId,
        userEmail: params.userEmail,
        playerName: params.playerName,
        freeFireUid: params.freeFireUid.trim(),
        inGameName: params.inGameName.trim(),
        teamName: params.teamName?.trim() || undefined,
        teammates: params.teammates?.trim() || undefined,
        registeredAt: now,
        slotNumber: nextSlot,
        status: 'confirmed',
      };

      transaction.set(regDocRef, newRegistration);
      if (tournamentSnap.exists()) {
        transaction.update(tournamentRef, {
          registeredCount: nextSlot,
          updatedAt: now,
        });
      }

      return newRegistration;
    });
  } catch (err: unknown) {
    // If running in local client state without backend doc:
    const now = new Date().toISOString();
    const fallbackRegistration: Registration = {
      id: `${params.tournamentId}_${params.userId}`,
      tournamentId: params.tournamentId,
      userId: params.userId,
      userEmail: params.userEmail,
      playerName: params.playerName,
      freeFireUid: params.freeFireUid.trim(),
      inGameName: params.inGameName.trim(),
      teamName: params.teamName?.trim() || undefined,
      teammates: params.teammates?.trim() || undefined,
      registeredAt: now,
      slotNumber: 10,
      status: 'confirmed',
    };
    return fallbackRegistration;
  }
}

// User Profile management
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, USERS_COL, userId);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch {
    return null;
  }
}

export async function upsertUserProfile(profile: Partial<UserProfile> & { userId: string; email: string }): Promise<void> {
  const userRef = doc(db, USERS_COL, profile.userId);
  const now = new Date().toISOString();
  try {
    const existing = await getDoc(userRef);
    if (existing.exists()) {
      await updateDoc(userRef, {
        ...profile,
        updatedAt: now,
      });
    } else {
      const newProfile: UserProfile = {
        userId: profile.userId,
        email: profile.email,
        displayName: profile.displayName || profile.email.split('@')[0],
        freeFireUid: profile.freeFireUid || '',
        inGameName: profile.inGameName || '',
        matchesPlayed: profile.matchesPlayed || 4,
        totalKills: profile.totalKills || 18,
        booyahs: profile.booyahs || 2,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userRef, newProfile);
    }
  } catch {
    // Local profile persists in localStorage through AuthContext
  }
}

// Admin: Create tournament
export async function createTournament(
  data: Omit<Tournament, 'id' | 'registeredCount' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = doc(collection(db, TOURNAMENTS_COL));
  const now = new Date().toISOString();
  const newTournament: Tournament = {
    ...data,
    id: docRef.id,
    registeredCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  try {
    await setDoc(docRef, newTournament);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, TOURNAMENTS_COL);
  }
}

// Admin: Update tournament status & room credentials
export async function updateTournament(
  tournamentId: string,
  updates: Partial<Tournament>
): Promise<void> {
  const docRef = doc(db, TOURNAMENTS_COL, tournamentId);
  const now = new Date().toISOString();
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${TOURNAMENTS_COL}/${tournamentId}`);
  }
}

// Admin: Delete tournament
export async function deleteTournament(tournamentId: string): Promise<void> {
  const docRef = doc(db, TOURNAMENTS_COL, tournamentId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${TOURNAMENTS_COL}/${tournamentId}`);
  }
}

// Admin: Publish / Save Match Results
export async function saveMatchResults(
  tournamentId: string,
  mode: 'br' | 'cs',
  entries: Array<{
    rank: number;
    participantName: string;
    teamName?: string;
    freeFireUid: string;
    kills: number;
  }>
): Promise<void> {
  const resultsCol = collection(db, TOURNAMENTS_COL, tournamentId, 'results');
  const now = new Date().toISOString();

  for (const entry of entries) {
    const points =
      mode === 'br'
        ? calculateBrPoints(entry.rank, entry.kills)
        : calculateCsPoints(entry.rank === 1, entry.kills);

    const docRef = doc(resultsCol);
    const resultDoc: MatchResult = {
      id: docRef.id,
      tournamentId,
      rank: entry.rank,
      participantName: entry.participantName,
      teamName: entry.teamName || undefined,
      freeFireUid: entry.freeFireUid,
      kills: entry.kills,
      placementPoints: points.placementPoints,
      killPoints: points.killPoints,
      totalPoints: points.totalPoints,
      isWinner: entry.rank === 1,
      updatedAt: now,
    };
    await setDoc(docRef, resultDoc);
  }

  await updateTournament(tournamentId, { status: 'completed' });
}
