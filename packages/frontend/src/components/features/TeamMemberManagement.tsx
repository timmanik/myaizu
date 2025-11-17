import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TeamMemberRole, type TeamMember } from '@aizu/shared';
import { User, UserPlus, Trash2, Shield, Users as UsersIcon } from 'lucide-react';
import { useAddTeamMember } from '../../hooks/useAddTeamMember';
import { useRemoveTeamMember } from '../../hooks/useRemoveTeamMember';
import { useUpdateTeamMemberRole } from '../../hooks/useUpdateTeamMemberRole';
import { useConfirm } from '../../hooks/use-confirm';
import { searchApi, type SearchUser } from '../../services/api/search';
import { useAuth } from '../../contexts/AuthContext';

interface TeamMemberManagementProps {
  teamId: string;
  members: TeamMember[];
  isAdmin: boolean;
  readOnly?: boolean;
}

export const TeamMemberManagement = ({
  teamId,
  members,
  isAdmin,
  readOnly = false,
}: TeamMemberManagementProps) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>(TeamMemberRole.MEMBER);
  const [isSearching, setIsSearching] = useState(false);

  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();
  const updateRoleMutation = useUpdateTeamMemberRole();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchApi.searchUsers(searchQuery, 10);
      // Filter out users who are already members
      const memberIds = members.map((m) => m.userId);
      const filteredResults = results.filter((user) => !memberIds.includes(user.id));
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = () => {
    if (!selectedUser) return;

    addMemberMutation.mutate(
      {
        teamId,
        data: {
          userId: selectedUser.id,
          role: selectedRole,
        },
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setSearchQuery('');
          setSearchResults([]);
          setSelectedUser(null);
          setSelectedRole(TeamMemberRole.MEMBER);
        },
      }
    );
  };

  const handleRemoveMember = async (userId: string) => {
    const confirmed = await confirm({
      title: "Remove Team Member",
      description: "Are you sure you want to remove this member from the team?",
      confirmText: "Remove",
      variant: "destructive",
    });

    if (confirmed) {
      removeMemberMutation.mutate({ teamId, userId });
    }
  };

  const handleUpdateRole = (userId: string, newRole: TeamMemberRole) => {
    updateRoleMutation.mutate({
      teamId,
      userId,
      data: { role: newRole },
    });
  };

  const handleMemberClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Manage Members
          </h3>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Search for a user by name or email to add them to the team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {searchResults.length > 0 && !selectedUser && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <p className="text-sm text-muted-foreground">Select a user:</p>
                  {searchResults.map((user) => (
                    <Card
                      key={user.id}
                      className="p-3 cursor-pointer hover:bg-accent"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div className="space-y-4">
                  <Card className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{selectedUser.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedUser.email}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(null)}
                      >
                        Change
                      </Button>
                    </div>
                  </Card>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select
                      value={selectedRole}
                      onValueChange={(value) => setSelectedRole(value as TeamMemberRole)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TeamMemberRole.MEMBER}>Member</SelectItem>
                        <SelectItem value={TeamMemberRole.ADMIN}>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {selectedRole === TeamMemberRole.ADMIN
                        ? 'Admins can manage team members and settings.'
                        : 'Members can view and contribute to team prompts.'}
                    </p>
                  </div>

                  <Button
                    onClick={handleAddMember}
                    disabled={addMemberMutation.isPending}
                    className="w-full"
                  >
                    {addMemberMutation.isPending ? 'Adding...' : 'Add to Team'}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUser?.id;
          const canModify = !isCurrentUser && !readOnly;

          return (
            <Card key={member.id} className="p-4">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleMemberClick(member.userId)}
                >
                  <User className="h-10 w-10 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate hover:underline">
                      {member.user?.name}
                      {isCurrentUser && (
                        <span className="text-sm text-muted-foreground ml-2">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {member.user?.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!readOnly && canModify ? (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleUpdateRole(member.userId, value as TeamMemberRole)
                      }
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TeamMemberRole.MEMBER}>Member</SelectItem>
                        <SelectItem value={TeamMemberRole.ADMIN}>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm font-medium px-3 py-2 bg-accent rounded-md capitalize w-32 text-center">
                      {member.role.toLowerCase()}
                    </div>
                  )}

                  {!readOnly && canModify && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={removeMemberMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <UsersIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No team members yet</p>
        </div>
      )}
    </div>
  );
};

