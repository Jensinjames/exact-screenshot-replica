-- Add the existing user to team_memberships as admin
-- This ensures the first user has proper access
INSERT INTO public.team_memberships (user_id, role)
SELECT p.user_id, 'admin'::team_role
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.team_memberships tm WHERE tm.user_id = p.user_id
)
LIMIT 1;