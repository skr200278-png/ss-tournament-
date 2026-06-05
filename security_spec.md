# security_spec.md — Tournament App Access Security Specification

## 1. Data Invariants & Authorization Boundaries

We partition user accounts, settings, and gaming lobbies so that permissions conform to a strict Zero-Trust approach:

1. **User Profiles (`/users/{userId}`)**:
   - Only the resource owner or a registered Administrator may read or write a user's wallet balances.
   - Standard players are forbidden from updating their `coins_balance` or `winning_balance` directly (except for internal transaction approvals, which are admin-authorized, or during local simulated guest mode).
   - Standard players are strictly forbidden from changing their `uid` or modifying other players' balances.

2. **Tournaments (`/tournaments/{matchId}`)**:
   - Any authenticated gamer can view available matches.
   - Joining a match is restricted: gamers can only increment `joined_count` by 1 and append *only their own* UID to the `joined_players_uids` list, and add their detailed game tag in `joined_players_details`.
   - Modifying core match variables (such as titles, rewards, maps, or slots) is strictly reserved for the Administrator.
   - Updating `room_id` and `room_password` to schedule game access is an Administrator-only action.

3. **Transactions (`/transactions/{transactionId}`)**:
   - Gamers can read their own subcollection or single transaction log matching their `userId`. They cannot read transactions of other users.
   - Standard players can submit details of deposits and withdrawals, assigning their request status as `'pending'`.
   - Admins handle transition logic (e.g., `'approved'` or `'rejected'`) and write back to the respective player's balance atomically.

4. **Settings (`/settings/{settingId}`)**:
   - General configurations (BKash/Nagad billing, announcement notices, scrolling banners) are publicly readable by signed-in users.
   - Editing general configurations is strictly prohibited for average players, and restricted to Administrators.

5. **Administrators (`/admins/{adminId}`)**:
   - Admins list is stored in `/admins/{adminId}`. If a document matching a user's UID exists in the `/admins/` path, they are granted Administrator authority.

---

## 2. The "Dirty Dozen" Vulnerability Payloads

These 12 JSON structures represent attacks attempting to bypass identity verification, escalate privileges, poison identifiers, or trigger state overrides:

### Payload 1: Privilege Escalation (Self-Assigned Admin Role)
- **Target Path**: `/admins/malicious_user_uid`
- **Payload**: `{"role": "admin"}`
- **Gamer Action**: Create/Set admin document.
- **Expected Outcome**: `PERMISSION_DENIED` (Only existing admins or bootstrap seeds can modify admin declarations).

### Payload 2: Ledger Spoofing (Standard User Injecting Coins Directly)
- **Target Path**: `/users/legit_user_uid`
- **Payload**: `{"coins_balance": 999999, "uid": "legit_user_uid", "email": "user@gmail.com", "name": "Hack"}`
- **Gamer Action**: Update user profile balance.
- **Expected Outcome**: `PERMISSION_DENIED` ( Standard users cannot perform arbitrary ledger updates on billing variables).

### Payload 3: Identity Theft (Standard User Modifying Profile of Another User)
- **Target Path**: `/users/victim_user_uid`
- **Payload**: `{"coins_balance": 0, "winning_balance": 0}`
- **Gamer Action**: Update victim profile.
- **Expected Outcome**: `PERMISSION_DENIED` (No write rights without authenticated UID matching).

### Payload 4: Arbitrary Slot Expansion on Tournaments
- **Target Path**: `/tournaments/match_ff_1`
- **Payload**: `{"total_slots": 99999}`
- **Gamer Action**: Increase capacity.
- **Expected Outcome**: `PERMISSION_DENIED` (Only Admin can modify tournament meta fields).

### Payload 5: Rogue Room hijacking (Standard User Spawning False Game Room details)
- **Target Path**: `/tournaments/match_ff_1`
- **Payload**: `{"room_id": "999999", "room_password": "fake_password"}`
- **Gamer Action**: Update room settings.
- **Expected Outcome**: `PERMISSION_DENIED` (Standard users cannot change room credentials).

### Payload 6: Transaction Scraping (Standard User Reading All Logs)
- **Target Path**: `/transactions` (collection query)
- **Payload**: `getDocs(collection(db, "transactions"))`
- **Gamer Action**: Read whole transactions list.
- **Expected Outcome**: `PERMISSION_DENIED` (Can only read transactions matching `userId == auth.uid`).

### Payload 7: Transaction Interception (Gamer Approving Own Deposit)
- **Target Path**: `/transactions/tx_deposit_99`
- **Payload**: `{"amount": 1000, "status": "approved", "userId": "attacker_uid"}`
- **Gamer Action**: Approve pending deposit without Admin intervention.
- **Expected Outcome**: `PERMISSION_DENIED` (Status change logic reserved to Admin).

### Payload 8: Withdrawal Coin Theft (Standard User Rejecting Withdrawal of Another User)
- **Target Path**: `/transactions/tx_withdraw_88`
- **Payload**: `{"status": "rejected"}`
- **Gamer Action**: Update state fields of another user's coin withdraw request.
- **Expected Outcome**: `PERMISSION_DENIED` (Owner can submit, but cannot self-claim other requests).

### Payload 9: Billing hijack (Standard User Modifying BKash/Nagad numbers)
- **Target Path**: `/settings/general`
- **Payload**: `{"bKash_number": "01700000000"}`
- **Gamer Action**: Update billing details to standard account.
- **Expected Outcome**: `PERMISSION_DENIED` (Only Admins can write settings).

### Payload 10: Denials of Wallet via ID Poisoning
- **Target Path**: `/tournaments/VERY_LONG_GARBAGE_CHARACTER_STRING_THAT_DEPLOYS_EXHAUSTIVE_RESOURCES_TO_INDEX`
- **Payload**: `{"title": "Trash"}`
- **Gamer Action**: Create tournament with invalid key form.
- **Expected Outcome**: `PERMISSION_DENIED` (Blocked by ID structure limits).

### Payload 11: Anti-Temporal Timestamp Poisoning
- **Target Path**: `/transactions/tx_1`
- **Payload**: `{"timestamp": "2030-01-01T00:00:00Z"}`
- **Gamer Action**: Post fake transaction date.
- **Expected Outcome**: `PERMISSION_DENIED` (Validation requires verification or server sync).

### Payload 12: Fraudulent Joined List Forgery
- **Target Path**: `/tournaments/match_ff_1`
- **Payload**: `{"joined_players_uids": ["attacker_uid", "fake_uid_1", "fake_uid_2"]}`
- **Gamer Action**: Standard user joining multiple users simultaneously or deleting other players.
- **Expected Outcome**: `PERMISSION_DENIED` (Standard users can only register *themselves*, and cannot delete/modify other registrations).

---

## 3. Test Structure Blueprint (`firestore.rules.test.ts`)

This represents the conceptual unit testing definitions:

```typescript
import { assertFails, assertSucceeds, initializeTestApp } from '@firebase/rules-unit-testing';

describe('Tournament App Access Controls', () => {
  it('prevents standard users from writing to general settings', async () => {
    const db = initializeTestApp({ auth: { uid: 'normal_user_1' } }).firestore();
    const settingsDoc = db.doc('settings/general');
    await assertFails(settingsDoc.set({ bKash_number: '01700000000' }));
  });

  it('allows admins to write to general settings', async () => {
    const db = initializeTestApp({ auth: { uid: 'admin_user_1' } }).firestore();
    // Simulate administrative declaration
    await db.doc('admins/admin_user_1').set({ active: true });
    
    const settingsDoc = db.doc('settings/general');
    await assertSucceeds(settingsDoc.set({ bKash_number: '01700000000' }));
  });

  it('prevents editing victim profiles', async () => {
    const db = initializeTestApp({ auth: { uid: 'normal_user_1' } }).firestore();
    const otherUser = db.doc('users/normal_user_2');
    await assertFails(otherUser.update({ coins_balance: 10 }));
  });
});
```
