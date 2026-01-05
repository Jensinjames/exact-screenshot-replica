import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, Clock, Copy, Mail, Shield, User, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'member';
  created_at: string;
  expires_at: string;
  token: string;
}

interface PendingInvitationsListProps {
  invitations: Invitation[];
  onCancel: (invitationId: string) => Promise<{ error: Error | null }>;
}

export default function PendingInvitationsList({
  invitations,
  onCancel,
}: PendingInvitationsListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = async (invitation: Invitation) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/auth?invited_email=${encodeURIComponent(invitation.email)}&token=${invitation.token}`;
    
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(invitation.id);
      toast.success('Invitation link copied');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="w-24"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => (
          <TableRow key={invitation.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{invitation.email}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={invitation.role === 'admin' ? 'default' : 'secondary'}>
                {invitation.role === 'admin' ? (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 mr-1" />
                    Member
                  </>
                )}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopyLink(invitation)}
                  title="Copy invitation link"
                >
                  {copiedId === invitation.id ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCancel(invitation.id)}
                  className="text-destructive hover:text-destructive"
                  title="Cancel invitation"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
