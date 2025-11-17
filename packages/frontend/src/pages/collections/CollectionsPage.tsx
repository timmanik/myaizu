import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { useCollections } from '../../hooks/useCollections';
import { useDeleteCollection } from '../../hooks/useDeleteCollection';
import { useUpdateCollection } from '../../hooks/useUpdateCollection';
import { useTeams } from '../../hooks/useTeams';
import { CreateCollectionModal } from '../../components/features/CreateCollectionModal';
import { RenameCollectionDialog } from '../../components/features/RenameCollectionDialog';
import { CollectionCard } from '../../components/features/CollectionCard';
import { FilterBar } from '../../components/features/FilterBar';
import { useViewMode } from '../../hooks/useViewMode';
import { useDebounce } from '../../hooks/useDebounce';
import { useConfirm } from '../../hooks/use-confirm';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Layers, Plus, ArrowLeft } from 'lucide-react';
import type { Collection, CollectionVisibility, TeamMemberRole } from '@aizu/shared';

const COLLECTION_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'name', label: 'Name' },
];

interface CollectionsPageProps {
  mode?: 'user' | 'team';
  teamId?: string;
  teamName?: string;
}

export const CollectionsListPage = ({ mode = 'user', teamId, teamName }: CollectionsPageProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibility, setVisibility] = useState<CollectionVisibility | undefined>();
  const [sortField, setSortField] = useState<'createdAt' | 'updatedAt' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const { viewMode, setViewMode } = useViewMode();

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Build filters based on mode
  const filters = mode === 'team'
    ? {
        search: debouncedSearch || undefined,
        visibility,
        sortField,
        sortOrder,
        teamId,
      }
    : {
        search: debouncedSearch || undefined,
        visibility,
        sortField,
        sortOrder,
      };

  const { data: collections, isLoading } = useCollections(filters);

  const { data: allTeams = [] } = useTeams(
    user ? { memberUserId: user.id } : undefined
  );

  const deleteCollectionMutation = useDeleteCollection();
  const updateCollectionMutation = useUpdateCollection();

  const filteredCollections = collections || [];

  // Build a map of team IDs to user's role in that team
  const userTeamRoles = useMemo(() => {
    const roleMap = new Map<string, TeamMemberRole>();
    if (!user) return roleMap;

    allTeams.forEach((team) => {
      const membership = team.members?.find((m) => m.userId === user.id);
      if (membership) {
        roleMap.set(team.id, membership.role);
      }
    });

    return roleMap;
  }, [allTeams, user]);

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortField(field as 'createdAt' | 'updatedAt' | 'name');
    setSortOrder(order);
  };

  const handleRename = (collection: Collection) => {
    setSelectedCollection(collection);
    setIsRenameDialogOpen(true);
  };

  const handleRenameSubmit = async (id: string, name: string, description?: string) => {
    try {
      await updateCollectionMutation.mutateAsync({
        id,
        data: { name, description },
      });
      toast({
        title: 'Success',
        description: 'Collection renamed successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Failed to rename collection',
      });
    }
  };

  const handleDelete = async (collection: Collection) => {
    const confirmed = await confirm({
      title: 'Delete Collection',
      description: `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive',
    });

    if (confirmed) {
      try {
        await deleteCollectionMutation.mutateAsync(collection.id);
        toast({
          title: 'Success',
          description: 'Collection deleted successfully',
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error?.message || 'Failed to delete collection',
        });
      }
    }
  };

  return (
    <PageContainer>
      {mode === 'team' && (
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/teams/${teamId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team
          </Button>
        </div>
      )}
      
      <PageHeader
        title={mode === 'team' ? `${teamName} Collections` : 'Collections'}
        description={mode === 'team' ? 'Team collections' : 'Organize your prompts into collections'}
        icon={<Layers className="h-6 w-6" />}
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        }
      />

      <div className="space-y-6">
        <FilterBar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          visibility={visibility as any}
          onVisibilityChange={setVisibility as any}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          sortOptions={COLLECTION_SORT_OPTIONS}
        />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading collections...</div>
        </div>
        ) : filteredCollections.length === 0 && !debouncedSearch ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Layers className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first collection to organize your prompts
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground">No collections found matching your search</p>
        </div>
      ) : (
          <>
            {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onClick={() => navigate(`/collections/${collection.id}`)}
              onRename={handleRename}
              onDelete={handleDelete}
              currentUserId={user?.id}
              userTeamRoles={userTeamRoles}
              viewMode="grid"
            />
          ))}
        </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onClick={() => navigate(`/collections/${collection.id}`)}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    currentUserId={user?.id}
                    userTeamRoles={userTeamRoles}
                    viewMode="list"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CreateCollectionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        defaultTeamId={mode === 'team' ? teamId : undefined}
      />

      <RenameCollectionDialog
        collection={selectedCollection}
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        onRename={handleRenameSubmit}
        isPending={updateCollectionMutation.isPending}
      />
    </PageContainer>
  );
};

// Default export for backward compatibility
export default function CollectionsPage() {
  return <CollectionsListPage mode="user" />;
}
