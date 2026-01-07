import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useIsAdmin() {
  const { user } = useAuth();

  const { data: isAdmin = false, isLoading: loading } = useQuery({
    queryKey: ['team_admin_status', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('team_memberships')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) return false;
      return data?.role === 'admin';
    },
    enabled: !!user,
  });

  return { isAdmin, loading };
}
