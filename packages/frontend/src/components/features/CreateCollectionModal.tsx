import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useCreateCollection } from '../../hooks/useCreateCollection';
import { CollectionVisibility, TeamMemberRole } from '@aizu/shared';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTeams } from '../../hooks/useTeams';

interface CreateCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTeamId?: string;
}

export function CreateCollectionModal({
  open,
  onOpenChange,
  defaultTeamId,
}: CreateCollectionModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>(defaultTeamId || 'personal');
  const [visibility, setVisibility] = useState<CollectionVisibility>(
    defaultTeamId ? CollectionVisibility.TEAM : CollectionVisibility.PRIVATE
  );

  const createCollection = useCreateCollection();
  
  // Fetch user's teams
  const { data: allTeams = [], isLoading: teamsLoading } = useTeams(
    user ? { memberUserId: user.id } : undefined
  );
  
  // Update selected author and visibility when defaultTeamId changes
  useEffect(() => {
    if (open) {
      setSelectedAuthor(defaultTeamId || 'personal');
      setVisibility(defaultTeamId ? CollectionVisibility.TEAM : CollectionVisibility.PRIVATE);
    }
  }, [open, defaultTeamId]);

  // Filter to only teams where user is an ADMIN
  const adminTeams = useMemo(() => {
    if (!user || !allTeams) return [];
    
    return allTeams.filter((team) => {
      const membership = team.members?.find((m) => m.userId === user.id);
      return membership?.role === TeamMemberRole.ADMIN;
    });
  }, [allTeams, user]);

  // Update visibility when author changes
  useEffect(() => {
    if (selectedAuthor === 'personal') {
      // Personal collections default to PRIVATE
      setVisibility(CollectionVisibility.PRIVATE);
    } else {
      // Team collections default to TEAM (cannot be PRIVATE)
      setVisibility(CollectionVisibility.TEAM);
    }
  }, [selectedAuthor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      const teamId = selectedAuthor !== 'personal' ? selectedAuthor : undefined;
      
      await createCollection.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
        teamId,
      });

      // Reset form and close modal
      setName('');
      setDescription('');
      setSelectedAuthor(defaultTeamId || 'personal');
      setVisibility(defaultTeamId ? CollectionVisibility.TEAM : CollectionVisibility.PRIVATE);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setSelectedAuthor(defaultTeamId || 'personal');
    setVisibility(defaultTeamId ? CollectionVisibility.TEAM : CollectionVisibility.PRIVATE);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Create a collection to organize your prompts. You can add prompts to
              collections later.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Marketing Prompts"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createCollection.isPending}
                required
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this collection is for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createCollection.isPending}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="author">Author</Label>
              <Select
                value={selectedAuthor}
                onValueChange={setSelectedAuthor}
                disabled={createCollection.isPending || teamsLoading}
              >
                <SelectTrigger id="author">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  {adminTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} Team
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={(value) =>
                  setVisibility(value as CollectionVisibility)
                }
                disabled={createCollection.isPending}
              >
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedAuthor === 'personal' && (
                    <SelectItem value={CollectionVisibility.PRIVATE}>
                      Private - Only you can see
                    </SelectItem>
                  )}
                  <SelectItem value={CollectionVisibility.TEAM}>
                    Team - Your team members can see
                  </SelectItem>
                  <SelectItem value={CollectionVisibility.PUBLIC}>
                    Public - Everyone can see
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createCollection.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createCollection.isPending}
            >
              {createCollection.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create Collection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

