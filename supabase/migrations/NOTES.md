# Migration notes

- A new `public.team_memberships` table with `team_role` enum controls access to order items. Seed at least one admin row after deploying so the admin dashboard can reach `order_items`.
- Order item RLS now depends on `public.has_team_access()`, which checks for `admin` or `member` rows in `team_memberships` tied to the caller's `auth.uid()`.
- Existing broad `order_items` policies were replaced; requests without a matching membership row will be denied for SELECT/INSERT/UPDATE/DELETE.
