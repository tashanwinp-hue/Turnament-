import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBrPoints,
  calculateCsPoints,
  isValidFreeFireUid,
  isValidInGameName,
  canRegisterForTournament,
  checkDuplicateRegistration,
  canAccessRoomCredentials,
  ADMIN_EMAIL,
} from './tournamentRules.ts';

test('calculateBrPoints awards correct placement and kill points for 1st place Booyah', () => {
  const result = calculateBrPoints(1, 7);
  assert.equal(result.placementPoints, 12);
  assert.equal(result.killPoints, 7);
  assert.equal(result.totalPoints, 19);
});

test('calculateBrPoints handles 5th place correctly', () => {
  const result = calculateBrPoints(5, 3);
  assert.equal(result.placementPoints, 6);
  assert.equal(result.killPoints, 3);
  assert.equal(result.totalPoints, 9);
});

test('calculateBrPoints awards 0 placement points for rank 11 or lower', () => {
  const result = calculateBrPoints(15, 2);
  assert.equal(result.placementPoints, 0);
  assert.equal(result.killPoints, 2);
  assert.equal(result.totalPoints, 2);
});

test('calculateCsPoints awards 10 placement points for victory and 1pt per kill', () => {
  const winResult = calculateCsPoints(true, 5);
  assert.equal(winResult.placementPoints, 10);
  assert.equal(winResult.killPoints, 5);
  assert.equal(winResult.totalPoints, 15);

  const lossResult = calculateCsPoints(false, 4);
  assert.equal(lossResult.placementPoints, 2);
  assert.equal(lossResult.killPoints, 4);
  assert.equal(lossResult.totalPoints, 6);
});

test('isValidFreeFireUid validates 8 to 12 digit numbers and rejects non-numeric/short IDs', () => {
  assert.equal(isValidFreeFireUid('12345678'), true);
  assert.equal(isValidFreeFireUid('987654321098'), true);
  assert.equal(isValidFreeFireUid('12345'), false); // too short
  assert.equal(isValidFreeFireUid('12345678901234'), false); // too long
  assert.equal(isValidFreeFireUid('abc123456'), false); // non numeric
  assert.equal(isValidFreeFireUid(''), false);
});

test('isValidInGameName checks valid character lengths', () => {
  assert.equal(isValidInGameName('RaiStar_FF'), true);
  assert.equal(isValidInGameName('A'), false); // too short
  assert.equal(isValidInGameName('   '), false);
  assert.equal(isValidInGameName('ThisInGameNameIsFarTooLongForFreeFire'), false);
});

test('canRegisterForTournament respects tournament status and slot limits', () => {
  const openTournament = { status: 'open', maxSlots: 48, registeredCount: 47 };
  assert.equal(canRegisterForTournament(openTournament).canRegister, true);

  const fullTournament = { status: 'open', maxSlots: 48, registeredCount: 48 };
  assert.equal(canRegisterForTournament(fullTournament).canRegister, false);

  const upcomingTournament = { status: 'upcoming', maxSlots: 48, registeredCount: 0 };
  assert.equal(canRegisterForTournament(upcomingTournament).canRegister, false);
});

test('checkDuplicateRegistration detects existing user and existing FF UID', () => {
  const existingList = [
    { userId: 'user-1', freeFireUid: '1122334455' },
    { userId: 'user-2', freeFireUid: '9988776655' },
  ];

  const duplicateUser = checkDuplicateRegistration(existingList, 'user-1', '5566778899');
  assert.equal(duplicateUser.isDuplicate, true);

  const duplicateUid = checkDuplicateRegistration(existingList, 'user-3', '1122334455');
  assert.equal(duplicateUid.isDuplicate, true);

  const freshUser = checkDuplicateRegistration(existingList, 'user-3', '5566778899');
  assert.equal(freshUser.isDuplicate, false);
});

test('canAccessRoomCredentials gives instant access to owner-admin', () => {
  assert.equal(canAccessRoomCredentials(ADMIN_EMAIL, 'upcoming', false), true);
  assert.equal(canAccessRoomCredentials(ADMIN_EMAIL, 'open', false), true);
});

test('canAccessRoomCredentials releases room only to confirmed participants when room_released or live', () => {
  const playerEmail = 'gamer123@gmail.com';
  // Not registered:
  assert.equal(canAccessRoomCredentials(playerEmail, 'room_released', false), false);
  // Registered but status is still open (room not released yet):
  assert.equal(canAccessRoomCredentials(playerEmail, 'open', true), false);
  // Registered and status is room_released:
  assert.equal(canAccessRoomCredentials(playerEmail, 'room_released', true), true);
  // Registered and status is live:
  assert.equal(canAccessRoomCredentials(playerEmail, 'live', true), true);
});
