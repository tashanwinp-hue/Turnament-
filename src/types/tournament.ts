export type GameMode = 'br' | 'cs';
export type TournamentFormat = 'solo' | 'duo' | 'squad';
export type TournamentStatus = 
  | 'upcoming' 
  | 'open' 
  | 'room_released' 
  | 'live' 
  | 'completed' 
  | 'cancelled';

export interface Tournament {
  id: string;
  title: string;
  game: 'free_fire';
  mode: GameMode;
  format: TournamentFormat;
  map: string;
  entryFee: number;
  prizePool: string;
  maxSlots: number;
  registeredCount: number;
  scheduleTime: string;
  status: TournamentStatus;
  roomId?: string;
  roomPassword?: string;
  rules: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  tournamentId: string;
  userId: string;
  userEmail: string;
  playerName: string;
  freeFireUid: string;
  inGameName: string;
  teamName?: string;
  teammates?: string;
  registeredAt: string;
  slotNumber: number;
  status: 'confirmed' | 'cancelled';
}

export interface MatchResult {
  id: string;
  tournamentId: string;
  rank: number;
  participantName: string;
  teamName?: string;
  freeFireUid: string;
  kills: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  isWinner: boolean;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  freeFireUid: string;
  inGameName: string;
  matchesPlayed: number;
  totalKills: number;
  booyahs: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAdmin: boolean;
}
