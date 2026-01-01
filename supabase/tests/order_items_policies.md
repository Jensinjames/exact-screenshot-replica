# Order item RLS verification

Use these steps to confirm the tightened policies after running the migration:

1. Seed an admin membership using the service role (required for bootstrap):
   ```sql
   insert into public.team_memberships (user_id, role)
   values ('<admin-user-uuid>', 'admin')
   on conflict (user_id) do update set role = excluded.role;
   ```
2. Simulate an authenticated admin session and confirm access works:
   ```sql
   select set_config('request.jwt.claim.sub', '<admin-user-uuid>', true);
   select set_config('request.jwt.claim.role', 'authenticated', true);
   select public.has_team_access(); -- should return true
   select count(*) from public.order_items; -- should succeed
   ```
3. Simulate a non-member user and confirm access is blocked:
   ```sql
   select set_config('request.jwt.claim.sub', '<non-member-uuid>', true);
   select set_config('request.jwt.claim.role', 'authenticated', true);
   select public.has_team_access(); -- should return false
   select count(*) from public.order_items; -- should be denied by RLS
   ```
4. Confirm inserts are also protected (replace IDs and prices as needed):
   ```sql
   select set_config('request.jwt.claim.sub', '<member-uuid>', true);
   select set_config('request.jwt.claim.role', 'authenticated', true);
   insert into public.order_items (order_id, product_id, size, variety, quantity, unit_price, total_price)
   values ('<order-id>', '<product-id>', 'medium', 'traditional', 1, 10.00, 10.00); -- should work for members/admins only
   ```

These checks rely on PostgreSQL `request.jwt.claim.*` overrides to emulate Supabase JWT claims in local testing.
