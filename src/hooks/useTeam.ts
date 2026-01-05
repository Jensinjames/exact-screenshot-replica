import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

interface TeamMembership {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
  full_name: string | null;
  avatar_url: string | null;
}

type TeamInvitation = Tables<'team_invitations'>;

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('team_memberships')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      // Silent fail - user may not be a team member
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
}

export function useTeamMembers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_memberships')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles separately to avoid relation issues
      const memberData: TeamMembership[] = [];
      for (const membership of data || []) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', membership.user_id)
          .single();
        
        memberData.push({
          ...membership,
          full_name: profileData?.full_name || null,
          avatar_url: profileData?.avatar_url || null,
        });
      }
      
      setMembers(memberData);
    } catch (error) {
      // Silent fail - handled by empty state
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      const { error } = await supabase
        .from('team_memberships')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      
      setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
      toast({ title: 'Role updated successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ 
        title: 'Error updating role', 
        description: error.message,
        variant: 'destructive' 
      });
      return { error };
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const memberToRemove = members.find(m => m.id === memberId);
      if (memberToRemove?.user_id === user?.id) {
        toast({ 
          title: 'Cannot remove yourself', 
          variant: 'destructive' 
        });
        return { error: new Error('Cannot remove yourself') };
      }

      const { error } = await supabase
        .from('team_memberships')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast({ title: 'Member removed successfully' });
      return { error: null };
    } catch (error: any) {
      toast({ 
        title: 'Error removing member', 
        description: error.message,
        variant: 'destructive' 
      });
      return { error };
    }
  };

  return {
    members,
    loading,
    updateMemberRole,
    removeMember,
    refetch: fetchMembers,
  };
}

export function useTeamInvitations() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      // Silent fail - handled by empty state
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (email: string, role: 'admin' | 'member') => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Check if invitation already exists
      const existingInvite = invitations.find(i => i.email === email);
      if (existingInvite) {
        toast({ 
          title: 'Invitation already sent', 
          description: `An invitation was already sent to ${email}`,
          variant: 'destructive' 
        });
        return { error: new Error('Invitation already exists') };
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
      
      setInvitations(prev => [data, ...prev]);
      toast({ 
        title: 'Invitation sent', 
        description: `Invitation sent to ${email}` 
      });
      return { error: null, data };
    } catch (error: any) {
      toast({ 
        title: 'Error sending invitation', 
        description: error.message,
        variant: 'destructive' 
      });
      return { error };
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
      
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
      toast({ title: 'Invitation cancelled' });
      return { error: null };
    } catch (error: any) {
      toast({ 
        title: 'Error cancelling invitation', 
        description: error.message,
        variant: 'destructive' 
      });
      return { error };
    }
  };

  return {
    invitations,
    loading,
    inviteMember,
    cancelInvitation,
    refetch: fetchInvitations,
  };
}
