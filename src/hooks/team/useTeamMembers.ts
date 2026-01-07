import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TeamRole } from '@/types';

interface TeamMember {
  id: string;
  user_id: string;
  role: TeamRole;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function useTeamMembers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch members with profiles in a single optimized query
  const { data: members = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['team_members'],
    queryFn: async (): Promise<TeamMember[]> => {
      // Get all memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('team_memberships')
        .select('*')
        .order('created_at', { ascending: true });

      if (membershipsError) throw membershipsError;
      if (!memberships?.length) return [];

      // Get all profiles for these users in a single query (fixes N+1)
      const userIds = memberships.map(m => m.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Create a map for quick lookup
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Combine data
      return memberships.map(membership => ({
        ...membership,
        full_name: profileMap.get(membership.user_id)?.full_name || null,
        avatar_url: profileMap.get(membership.user_id)?.avatar_url || null,
      }));
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: TeamRole }) => {
      const { error } = await supabase
        .from('team_memberships')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
      toast.success('Role updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Error updating role', { description: error.message });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const memberToRemove = members.find(m => m.id === memberId);
      if (memberToRemove?.user_id === user?.id) {
        throw new Error('Cannot remove yourself');
      }

      const { error } = await supabase
        .from('team_memberships')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
      toast.success('Member removed successfully');
    },
    onError: (error: Error) => {
      toast.error('Error removing member', { description: error.message });
    },
  });

  const updateMemberRole = async (memberId: string, newRole: TeamRole): Promise<{ error: Error | null }> => {
    try {
      await updateRoleMutation.mutateAsync({ memberId, newRole });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const removeMember = async (memberId: string): Promise<{ error: Error | null }> => {
    try {
      await removeMemberMutation.mutateAsync(memberId);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    members,
    loading,
    updateMemberRole,
    removeMember,
    refetch,
  };
}
