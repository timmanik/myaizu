import { useState } from 'react';
import { useAdminUsers, useUpdateUserRole, useDeleteUser } from '../../hooks/useAdminUsers';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { Search, Edit, Trash2, Users } from 'lucide-react';
import type { Role, UserWithStats } from '@aizu/shared';
import { useToast } from '../../hooks/use-toast';
import { useConfirm } from '../../hooks/use-confirm';
import { useAuth } from '../../contexts/AuthContext';

const AdminUsersPage = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | undefined>(undefined);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [newRole, setNewRole] = useState<Role | undefined>(undefined);

  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useAdminUsers({ search, role: roleFilter });
  const updateUserRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();
  const confirm = useConfirm();

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await updateUserRole.mutateAsync({
        userId: selectedUser.id,
        data: { role: newRole },
      });
      setIsEditOpen(false);
      setSelectedUser(null);
      setNewRole(undefined);
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = await confirm({
      title: "Delete User",
      description: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteUser.mutateAsync(userId);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'default';
      case 'TEAM_ADMIN':
        return 'secondary';
      case 'MEMBER':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users and roles</p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage users and roles</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as Role | undefined)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undefined">All Roles</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            <SelectItem value="TEAM_ADMIN">Team Admin</SelectItem>
            <SelectItem value="MEMBER">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      {users && users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {search ? 'Try a different search term' : 'No users in the system'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users?.map((user) => (
            <Card key={user.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{user.name}</h3>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                      {user.id === currentUser?.id && (
                        <Badge variant="outline">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{user._count.prompts} prompts</span>
                      <span>{user._count.collections} collections</span>
                      <span>{user._count.teamMemberships} teams</span>
                      <span>
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setNewRole(user.role);
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Change Role
                    </Button>
                    {user.id !== currentUser?.id && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Role</Label>
              <p className="text-sm text-muted-foreground">
                {selectedUser?.role.replace('_', ' ')}
              </p>
            </div>
            <div>
              <Label htmlFor="new-role">New Role</Label>
              <Select value={newRole} onValueChange={(value) => setNewRole(value as Role)}>
                <SelectTrigger id="new-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="TEAM_ADMIN">Team Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Super Admin: Full system access | Team Admin: Can manage teams | Member:
                Regular user
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedUser(null);
                  setNewRole(undefined);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRole}
                disabled={updateUserRole.isPending || newRole === selectedUser?.role}
              >
                {updateUserRole.isPending ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;

