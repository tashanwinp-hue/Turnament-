# Battle Arena Esports - Firestore Security Specification

## 1. Data Invariants
- Identity Integrity: A player cannot register on behalf of another user (`userId == request.auth.uid`).
- Admin Protection: Only the authorized owner-admin (`ranjeetraj10100@gmail.com`) can create tournaments, update match statuses, modify rules, delete tournaments, or enter official match results and points.
- Room ID Secrecy: Custom match Room ID and Password can only be viewed by confirmed registered players after status is `room_released` or `live`, or by the owner-admin.
- Slot Integrity: Tournaments cannot exceed `maxSlots`, and players cannot register duplicate slots using either the same account or the same Free Fire UID.
- Result Immutability: Once match results are published, only the admin can modify scores.
- Free Entry Policy: Paid wagers and real-money deposits remain disabled.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Tournament Creation**: `POST /tournaments` with no auth header -> `PERMISSION_DENIED`
2. **Player Creating Tournament**: Signed in as `player@gmail.com` trying to write to `/tournaments/tour1` -> `PERMISSION_DENIED`
3. **Spoofed User Registration**: Signed in as `uid_123` sending `userId: "uid_999"` -> `PERMISSION_DENIED`
4. **Room Credentials Write by Non-Admin**: Normal player attempting to change `roomId` or `roomPassword` -> `PERMISSION_DENIED`
5. **Score Manipulation**: Non-admin participant writing to `/tournaments/{id}/results` -> `PERMISSION_DENIED`
6. **Admin Impersonation without Email Verification**: Attacker sending `email: ranjeetraj10100@gmail.com` without valid token -> `PERMISSION_DENIED`
7. **Deleting Other Player's Registration**: User A attempting to delete User B's registration doc -> `PERMISSION_DENIED`
8. **Direct Status Injection**: Bypassing tournament lifecycle (e.g. setting `status: completed` directly) -> `PERMISSION_DENIED`
9. **Shadow Fields Attack**: Injecting unapproved fields like `isAdmin: true` into user profile -> `PERMISSION_DENIED`
10. **Junk String Path Poisoning**: Attempting to inject oversized 100KB document ID strings into paths -> `PERMISSION_DENIED`
11. **Altering Tournament Max Slots as Player**: Overwriting maxSlots to bypass full tournament -> `PERMISSION_DENIED`
12. **Public Unauthenticated List of Registrations with Private Info**: Scraped list queries without auth -> `PERMISSION_DENIED`
