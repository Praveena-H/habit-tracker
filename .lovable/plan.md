

# User-Customizable Soft 75 Rules

Extend the previously approved Soft 75 plan so users define their own rules per challenge — mirroring the habit creation flow.

## Schema change (vs. prior plan)

`soft75_rules` table stays, but no defaults are seeded. Instead, when a user starts a new challenge they go through a **rule builder** dialog (similar to `AddHabitDialog`).

Columns: `id`, `challenge_id` (FK, cascade), `label` (text), `emoji` (text, optional), `description` (text, optional), `order_index` (int). RLS: user can CRUD rules only for their own challenges (joined via `challenge_id → soft75_challenges.user_id = auth.uid()`).

## New flow

1. **Start Challenge dialog** (`StartChallengeDialog.tsx`):
   - Pick a start date (defaults to today, no future dates beyond today).
   - Add 1–10 custom rules. Each rule: emoji (via existing `EmojiPicker`), label (required), short description (optional).
   - Reorder rules (up/down buttons).
   - "Start Challenge" creates the `soft75_challenges` row + all `soft75_rules` rows in one transaction.

2. **Edit Rules dialog** (`EditRulesDialog.tsx`) — available from `Soft75View` header:
   - Edit label/emoji/description of existing rules.
   - Add a new rule mid-challenge (applies from edit date forward; past logs untouched).
   - Soft-delete a rule (mark inactive via `archived_at` column) so historical day completeness still reads correctly.

3. **Daily checklist** renders one toggle per active rule for that date. Day is "complete" when all active-on-that-date rules are checked. Lenient handling unchanged: misses don't reset.

## Files (delta from prior plan)

- Add: `src/components/soft75/StartChallengeDialog.tsx`
- Modify: `src/components/soft75/EditRulesDialog.tsx` (full CRUD instead of label-only edit)
- Modify: `src/hooks/useSoft75.ts` to expose `createChallenge(rules)`, `addRule`, `updateRule`, `archiveRule`
- Add `archived_at timestamptz` to `soft75_rules`

Everything else from the previously approved plan (auth, profiles, habits → Supabase migration, tab toggle, 75-cell grid, lenient counter) stays the same.

## Implementation order (updated)

1. Connect Supabase, create `profiles` + `habits` tables, migrate `useHabits`
2. Auth pages + `ProtectedRoute` + sign-out
3. Soft 75 tables (`soft75_challenges`, `soft75_rules` with `archived_at`, `soft75_daily_logs`)
4. `useSoft75` hook with full rule CRUD
5. `StartChallengeDialog` (rule builder) and `EditRulesDialog`
6. `Soft75View` + `Soft75Checklist` + `Soft75Grid`
7. Wire Habits / Soft 75 tab toggle into `DashboardLayout`

