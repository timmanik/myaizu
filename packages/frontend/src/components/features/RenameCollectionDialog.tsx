import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import type { Collection } from '@aizu/shared';

interface RenameCollectionDialogProps {
  collection: Collection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (id: string, name: string, description?: string) => Promise<void>;
  isPending?: boolean;
}

export function RenameCollectionDialog({
  collection,
  open,
  onOpenChange,
  onRename,
  isPending = false,
}: RenameCollectionDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (collection && open) {
      setName(collection.name);
      setDescription(collection.description || '');
    }
  }, [collection, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!collection || !name.trim()) {
      return;
    }

    try {
      await onRename(collection.id, name.trim(), description.trim() || undefined);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to rename collection:', error);
    }
  };

  const handleCancel = () => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description || '');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Collection</DialogTitle>
            <DialogDescription>
              Update the name and description of your collection.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
            >
              {isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

