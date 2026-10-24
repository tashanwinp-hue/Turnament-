/**
 * Battle Arena - Free Fire Tournament Rules & Validation Engine
 */

export const ADMIN_EMAIL = 'ranjeetraj10100@gmail.com';

export interface BRPointsResult {
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
}

export interface CSPointsResult {
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
}

/**
 * Standard Official Free Fire Battle Royale Placement Points
 */
export const BR_PLACEMENT_POINTS: Record<number, number> = {
  1: 12, // Booyah!
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1,
};

/**
 * Calculates Battle Royale match points
 */
export function calculateBrPoints(rank: number, kills: number): BRPointsResult {
  const placementPoints = BR_PLACEMENT_POINTS[rank] || 0;
  const killPoints = Math.max(0, kills) * 1; // 1 point per kill
  return {
    placementPoints,
    killPoints,
    totalPoints: placementPoints + killPoints,
  };
}

/**
 * Calculates Clash Squad match points
 */
export function calculateCsPoints(isWinner: boolean, kills: number): CSPointsResult {
  const placementPoints = isWinner ? 10 : 2;
  const killPoints = Math.max(0, kills) * 1;
  return {
    placementPoints,
    killPoints,
    totalPoints: placementPoints + killPoints,
  };
}

/**
 * Validates Free Fire in-game UID (Numeric, 8-12 digits)
 */
export function isValidFreeFireUid(uid: string): boolean {
  if (!uid || typeof uid !== 'string') return false;
  const trimmed = uid.trim();
  return /^[0-9]{8,12}$/.test(trimmed);
}

/**
 * Validates Free Fire In-Game Name (IGN)
 */
export function isValidInGameName(ign: string): boolean {
  if (!ign || typeof ign !== 'string') return false;
  const trimmed = ign.trim();
  return trimmed.length >= 2 && trimmed.length <= 25;
}

/**
 * Checks if tournament has slots remaining and is open for registration
 */
export function canRegisterForTournament(tournament: {
  status: string;
  maxSlots: number;
  registeredCount: number;
}): { canRegister: boolean; reason?: string } {
  if (tournament.status !== 'open') {
    return { canRegister: false, reason: `Tournament is currently ${tournament.status.replace('_', ' ')}` };
  }
  if (tournament.registeredCount >= tournament.maxSlots) {
    return { canRegister: false, reason: 'Tournament slots are completely full' };
  }
  return { canRegister: true };
}

/**
 * Prevents duplicate registration for same user or same FF UID
 */
export function checkDuplicateRegistration(
  registrations: Array<{ userId: string; freeFireUid: string }>,
  userId: string,
  freeFireUid: string
): { isDuplicate: boolean; reason?: string } {
  const userExists = registrations.some(r => r.userId === userId);
  if (userExists) {
    return { isDuplicate: true, reason: 'You have already registered for this tournament' };
  }
  const uidExists = registrations.some(
    r => r.freeFireUid.trim().toLowerCase() === freeFireUid.trim().toLowerCase()
  );
  if (uidExists) {
    return { isDuplicate: true, reason: 'This Free Fire UID is already registered by another participant' };
  }
  return { isDuplicate: false };
}

/**
 * Evaluates whether a player or admin has authorization to view Custom Room credentials
 */
export function canAccessRoomCredentials(
  userEmail: string | null | undefined,
  tournamentStatus: string,
  hasConfirmedRegistration: boolean
): boolean {
  if (!userEmail) return false;
  // Admin always has access to room details
  if (userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;

  // Registered players get access only when status is room_released or live
  const allowedStatuses = ['room_released', 'live', 'completed'];
  return allowedStatuses.includes(tournamentStatus) && hasConfirmedRegistration;
}

/**
 * Formats prize display
 */
export function formatPrizePool(prize: string | number): string {
  if (typeof prize === 'number') {
    return prize > 0 ? `₹${prize}` : 'Free Entry / Glory';
  }
  return prize || 'Free Entry / Glory';
}
