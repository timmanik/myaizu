import { useState } from 'react';
import {
  useAdminTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  useAssignTeamAdmin,
} from '../../hooks/useAdminTeams';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Skeleton } from '../../components/ui/skeleton';
import { Plus, Search, Users, FileText, Edit, Trash2, UserPlus } from 'lucide-react';
import type { TeamWithDetails } from '@aizu/shared';
import { useToast } from '../../hooks/use-toast';
import { useConfirm } from '../../hooks/use-confirm';

const AdminTeamsPage = () => {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithDetails | null>(null);

  const { data: teams, isLoading } = useAdminTeams(search);
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const assignTeamAdmin = useAssignTeamAdmin();
  const { toast } = useToast();
  const confirm = useConfirm();

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      await createTeam.mutateAsync({ name, description });
      setIsCreateOpen(false);
      toast({
        title: 'Success',
        description: 'Team created successfully',
      });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create team',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeam) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      await updateTeam.mutateAsync({
        teamId: selectedTeam.id,
        data: { name, description },
      });
      setIsEditOpen(false);
      setSelectedTeam(null);
      toast({
        title: 'Success',
        description: 'Team updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update team',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    const confirmed = await confirm({
      title: "Delete Team",
      description: "Are you sure you want to delete this team? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteTeam.mutateAsync(teamId);
      toast({
        title: 'Success',
        description: 'Team deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete team',
        variant: 'destructive',
      });
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeam) return;

    const formData = new FormData(e.currentTarget);
    const userId = formData.get('userId') as string;

    try {
      await assignTeamAdmin.mutateAsync({
        teamId: selectedTeam.id,
        data: { userId },
      });
      setIsAddAdminOpen(false);
      setSelectedTeam(null);
      toast({
        title: 'Success',
        description: 'Team admin assigned successfully',
      });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to assign team admin',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">Create and manage teams</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Create and manage teams</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team to organize prompts and collaborate
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name *</Label>
                <Input id="name" name="name" required placeholder="Engineering Team" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Prompts for the engineering team..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTeam.isPending}>
                  {createTeam.isPending ? 'Creating...' : 'Create Team'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {teams && teams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'Try a different search term' : 'Create your first team to get started'}
            </p>
            {!search && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams?.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription className="mt-1.5">
                      {team.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{team.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{team._count?.prompts || 0} prompts</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTeam(team);
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTeam(team);
                      setIsAddAdminOpen(true);
                    }}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Add Admin
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Team Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update team information</DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Team Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  required
                  defaultValue={selectedTeam.name}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={selectedTeam.description || ''}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTeam.isPending}>
                  {updateTeam.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Admin Dialog */}
      <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Team Admin</DialogTitle>
            <DialogDescription>
              Add a user as an admin for {selectedTeam?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignAdmin} className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                name="userId"
                required
                placeholder="Enter user ID"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can find user IDs in the Users page
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddAdminOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignTeamAdmin.isPending}>
                {assignTeamAdmin.isPending ? 'Assigning...' : 'Assign Admin'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTeamsPage;

