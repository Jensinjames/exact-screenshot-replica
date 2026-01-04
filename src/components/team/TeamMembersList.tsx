import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, Shield, ShieldOff, Trash2, User } from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface TeamMembersListProps {
  members: TeamMember[];
  currentUserId: string | undefined;
  onUpdateRole: (memberId: string, newRole: 'admin' | 'member') => Promise<{ error: Error | null }>;
  onRemove: (memberId: string) => Promise<{ error: Error | null }>;
}

export default function TeamMembersList({
  members,
  currentUserId,
  onUpdateRole,
  onRemove,
}: TeamMembersListProps) {
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const isCurrentUser = member.user_id === currentUserId;
          const isLastAdmin =
            member.role === 'admin' &&
            members.filter((m) => m.role === 'admin').length === 1;

          return (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.full_name || 'Unknown User'}
                      {isCurrentUser && (
                        <span className="text-muted-foreground ml-2">(You)</span>
                      )}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                  {member.role === 'admin' ? (
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
                {new Date(member.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {!isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role === 'member' ? (
                        <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'admin')}>
                          <Shield className="w-4 h-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                      ) : (
                        !isLastAdmin && (
                          <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'member')}>
                            <ShieldOff className="w-4 h-4 mr-2" />
                            Remove Admin
                          </DropdownMenuItem>
                        )
                      )}
                      {!isLastAdmin && (
                        <DropdownMenuItem
                          onClick={() => onRemove(member.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove from Team
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
