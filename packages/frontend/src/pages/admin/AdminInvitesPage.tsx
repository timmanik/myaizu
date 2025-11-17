import { useState } from 'react';
import { useInvites, useCreateInvite, useRevokeInvite } from '../../hooks/useInvites';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Copy, Trash2, Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { Role } from '@aizu/shared';
import { useToast } from '../../hooks/use-toast';
import { useConfirm } from '../../hooks/use-confirm';

const AdminInvitesPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);

  const { data: invites, isLoading } = useInvites();
  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite();
  const { toast } = useToast();
  const confirm = useConfirm();

  const handleCreateInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const role = formData.get('role') as Role;

    try {
      const invite = await createInvite.mutateAsync({ email, role });
      const inviteUrl = `${window.location.origin}/invite?token=${invite.token}`;
      setGeneratedInvite(inviteUrl);
      toast({
        title: 'Success',
        description: 'Invite created successfully',
      });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create invite',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    const confirmed = await confirm({
      title: "Revoke Invite",
      description: "Are you sure you want to revoke this invite?",
      confirmText: "Revoke",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    try {
      await revokeInvite.mutateAsync(inviteId);
      toast({
        title: 'Success',
        description: 'Invite revoked successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to revoke invite',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: 'Invite link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (invite: any) => {
    if (invite.usedAt) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Used
        </Badge>
      );
    }
    if (new Date() > new Date(invite.expiresAt)) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Clock className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
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
          <h1 className="text-3xl font-bold">Invite Management</h1>
          <p className="text-muted-foreground">Generate and manage invite links</p>
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Invite Management</h1>
          <p className="text-muted-foreground">Generate and manage invite links</p>
        </div>
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) setGeneratedInvite(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Invite Link</DialogTitle>
              <DialogDescription>
                Generate a unique invite link for a new user
              </DialogDescription>
            </DialogHeader>
            {!generatedInvite ? (
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select name="role" required defaultValue="MEMBER">
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      <SelectItem value="TEAM_ADMIN">Team Admin</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    The role this user will have when they accept the invite
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createInvite.isPending}>
                    {createInvite.isPending ? 'Creating...' : 'Generate Invite'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Invite Link Generated</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={generatedInvite} readOnly className="font-mono text-xs" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedInvite)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Share this link with the user. It will expire in 7 days.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setGeneratedInvite(null);
                    setIsCreateOpen(false);
                  }}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invites?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invites?.filter(
                (i) => !i.usedAt && new Date() <= new Date(i.expiresAt)
              ).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invites?.filter((i) => i.usedAt).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invites List */}
      {invites && invites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invites yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first invite to add users to the system
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Invite
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invites?.map((invite) => {
            const inviteUrl = `${window.location.origin}/invite?token=${invite.token}`;
            const isActive = !invite.usedAt && new Date() <= new Date(invite.expiresAt);

            return (
              <Card key={invite.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{invite.email}</h3>
                        {getStatusBadge(invite)}
                        <Badge variant={getRoleBadgeVariant(invite.role)}>
                          {invite.role.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Created {new Date(invite.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          Expires {new Date(invite.expiresAt).toLocaleDateString()}
                        </span>
                        {invite.usedAt && (
                          <span>
                            Used {new Date(invite.usedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(inviteUrl)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Link
                        </Button>
                      )}
                      {!invite.usedAt && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeInvite(invite.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminInvitesPage;
