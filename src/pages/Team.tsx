import { useTeamMembers, useTeamInvitations } from '@/hooks/team';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import TeamMembersList from '@/components/team/TeamMembersList';
import PendingInvitationsList from '@/components/team/PendingInvitationsList';
import InviteTeamMemberDialog from '@/components/team/InviteTeamMemberDialog';

export default function Team() {
  const { user } = useAuth();
  const { members, loading: membersLoading, updateMemberRole, removeMember } = useTeamMembers();
  const { invitations, loading: invitationsLoading, inviteMember, cancelInvitation } = useTeamInvitations();

  const loading = membersLoading || invitationsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and invitations</p>
        </div>
        <InviteTeamMemberDialog onInvite={inviteMember} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? 's' : ''} in your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMembersList
            members={members}
            currentUserId={user?.id}
            onUpdateRole={updateMemberRole}
            onRemove={removeMember}
          />
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PendingInvitationsList
              invitations={invitations}
              onCancel={cancelInvitation}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
