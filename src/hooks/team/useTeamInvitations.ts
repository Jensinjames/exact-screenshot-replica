import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { TeamInvitation, TeamRole } from '@/types';

export function useTeamInvitations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['team_invitations'],
    queryFn: async (): Promise<TeamInvitation[]> => {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: TeamRole }) => {
      if (!user) throw new Error('Not authenticated');

      // Check if invitation already exists
      const existingInvite = invitations.find(i => i.email === email);
      if (existingInvite) {
        throw new Error(`An invitation was already sent to ${email}`);
      }

      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          email,
          role,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team_invitations'] });
      toast.success('Invitation sent', { description: `Invitation sent to ${variables.email}` });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_invitations'] });
      toast.success('Invitation cancelled');
    },
    onError: (error: Error) => {
      toast.error('Error cancelling invitation', { description: error.message });
    },
  });

  const inviteMember = async (email: string, role: TeamRole): Promise<{ error: Error | null; data?: { token: string } }> => {
    try {
      const data = await inviteMutation.mutateAsync({ email, role });
      return { error: null, data: { token: data.token } };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const cancelInvitation = async (invitationId: string): Promise<{ error: Error | null }> => {
    try {
      await cancelMutation.mutateAsync(invitationId);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    invitations,
    loading,
    inviteMember,
    cancelInvitation,
    refetch,
  };
}
