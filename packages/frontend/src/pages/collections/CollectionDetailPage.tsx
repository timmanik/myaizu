import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { PromptCardGrid } from '../../components/features/PromptCardGrid';
import { PromptCardList } from '../../components/features/PromptCardList';
import { PromptDetailModal } from '../../components/features/PromptDetailModal';
import { RenameCollectionDialog } from '../../components/features/RenameCollectionDialog';
import { FilterBar } from '../../components/features/FilterBar';
import { Button } from '../../components/ui/button';
import { useCollection } from '../../hooks/useCollection';
import { useDeleteCollection } from '../../hooks/useDeleteCollection';
import { useUpdateCollection } from '../../hooks/useUpdateCollection';
import { useTeams } from '../../hooks/useTeams';
import { useFavoritePrompt } from '../../hooks/useFavoritePrompt';
import { useForkPrompt } from '../../hooks/useForkPrompt';
import { useDeletePrompt } from '../../hooks/useDeletePrompt';
import { useAddToCollection } from '../../hooks/useAddToCollection';
import { useConfirm } from '../../hooks/use-confirm';
import { useToast } from '../../hooks/use-toast';
import { useViewMode } from '../../hooks/useViewMode';
import { useAuth } from '../../contexts/AuthContext';
import { promptsApi } from '../../services/api/prompts';
import { ArrowLeft, Layers, Pencil, Trash2 } from 'lucide-react';
import type { Prompt, PromptVisibility, TeamMemberRole } from '@aizu/shared';

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  const { viewMode, setViewMode } = useViewMode();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibility, setVisibility] = useState<PromptVisibility | undefined>();
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: collection, isLoading } = useCollection(id!);
  const { data: allTeams = [] } = useTeams(
    user ? { memberUserId: user.id } : undefined
  );
  const favoriteMutation = useFavoritePrompt();
  const forkMutation = useForkPrompt();
  const deleteMutation = useDeletePrompt();
  const addToCollectionMutation = useAddToCollection();
  const deleteCollectionMutation = useDeleteCollection();
  const updateCollectionMutation = useUpdateCollection();

  // Extract prompts before any conditional returns to avoid hooks order issues
  const allPrompts = useMemo(() => {
    const prompts = collection?.collectionPrompts?.map((cp) => cp.prompt).filter((p) => p) || [];
    // Map to ensure all required Prompt fields are present with defaults
    return prompts.map((p) => {
      if (!p) return null;
      return {
        ...p,
        authorName: (p as any).author?.name || p.authorName,
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
        updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
        promptType: 'STANDARD_PROMPT' as const,
        config: { useWebSearch: false, useDeepResearch: false },
      } as Prompt;
    }).filter((p): p is Prompt => p !== null);
  }, [collection]);

  // Filter and sort prompts
  const filteredPrompts = useMemo(() => {
    let filtered = [...allPrompts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
      );
    }

    // Apply visibility filter
    if (visibility) {
      filtered = filtered.filter((p) => p.visibility === visibility);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortField) {
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'favoriteCount':
          compareValue = a.favoriteCount - b.favoriteCount;
          break;
        case 'copyCount':
          compareValue = a.copyCount - b.copyCount;
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [allPrompts, searchQuery, visibility, sortField, sortOrder]);

  // Check if user can modify this collection
  const canModifyCollection = useMemo(() => {
    if (!user || !collection) return false;
    
    // Owner can always modify
    if (collection.ownerId === user.id) return true;
    
    // If it's a team collection, check if user is a team admin
    if (collection.teamId) {
      const team = allTeams.find((t) => t.id === collection.teamId);
      if (team) {
        const membership = team.members?.find((m) => m.userId === user.id);
        return membership?.role === 'ADMIN';
      }
    }
    
    return false;
  }, [user, collection, allTeams]);

  const handleRenameCollection = () => {
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
        description: 'Collection updated successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Failed to update collection',
      });
    }
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;

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
        navigate('/collections');
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error?.message || 'Failed to delete collection',
        });
      }
    }
  };

  const handleFavoritePrompt = async (promptId: string) => {
    try {
      await favoriteMutation.mutateAsync(promptId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCopyPrompt = async (promptId: string) => {
    const prompt = filteredPrompts.find((p) => p.id === promptId);
    if (prompt) {
      try {
        await navigator.clipboard.writeText(prompt.content);
        // Increment the copy count on the backend
        await promptsApi.incrementCopy(promptId);
        toast({
          title: "Success",
          description: "Prompt copied to clipboard!",
        });
      } catch (error) {
        console.error('Failed to copy prompt:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy prompt",
        });
      }
    }
  };

  const handleForkPrompt = async (promptId: string) => {
    try {
      await forkMutation.mutateAsync(promptId);
    } catch (error) {
      console.error('Failed to fork prompt:', error);
    }
  };

  const handleAddToCollection = async (promptId: string, collectionId: string) => {
    try {
      await addToCollectionMutation.mutateAsync({ promptId, collectionId });
    } catch (error) {
      console.error('Failed to add to collection:', error);
    }
  };

  const handleEditPrompt = (promptId: string) => {
    navigate(`/prompts/${promptId}/edit`);
  };

  const handleDeletePrompt = async (promptId: string) => {
    const confirmed = await confirm({
      title: "Delete Prompt",
      description: "Are you sure you want to delete this prompt?",
      confirmText: "Delete",
      variant: "destructive",
    });

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(promptId);
      } catch (error) {
        console.error('Failed to delete prompt:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete prompt",
        });
      }
    }
  };

  const handlePromptClick = (promptId: string) => {
    const prompt = filteredPrompts.find((p) => p.id === promptId);
    if (prompt) {
      setSelectedPrompt(prompt);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(order);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading collection...</div>
        </div>
      </PageContainer>
    );
  }

  if (!collection) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-lg font-semibold mb-2">Collection not found</h3>
          <Button onClick={() => navigate('/collections')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/collections')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>
      </div>

      <PageHeader
        title={collection.name}
        description={collection.description || undefined}
        actions={
          canModifyCollection ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRenameCollection}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeleteCollection}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{allPrompts.length} prompts</span>
        <span className="capitalize">{collection.visibility.toLowerCase()}</span>
        {collection.owner && (
          <span>
            by{' '}
            <button
              onClick={() => navigate(`/users/${collection.ownerId}`)}
              className="cursor-pointer hover:underline inline text-left p-0 border-0 bg-transparent text-sm text-muted-foreground"
            >
              {collection.owner.name}
            </button>
          </span>
        )}
      </div>

      <div className="space-y-6">
        <FilterBar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        {allPrompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Layers className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No prompts in this collection</h3>
          <p className="text-muted-foreground">
            Add prompts to this collection from the prompt details page
          </p>
        </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground">No prompts found matching your filters</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <PromptCardGrid
                prompts={filteredPrompts}
                onFavorite={handleFavoritePrompt}
                onCopy={handleCopyPrompt}
                onEdit={handleEditPrompt}
                onDelete={handleDeletePrompt}
                onFork={handleForkPrompt}
                onClick={handlePromptClick}
                onAddToCollection={handleAddToCollection}
                currentUserId={user?.id}
              />
            ) : (
              <PromptCardList
                prompts={filteredPrompts}
                onFavorite={handleFavoritePrompt}
                onCopy={handleCopyPrompt}
                onEdit={handleEditPrompt}
                onDelete={handleDeletePrompt}
                onFork={handleForkPrompt}
                onClick={handlePromptClick}
                onAddToCollection={handleAddToCollection}
                currentUserId={user?.id}
              />
            )}
          </>
        )}
        </div>

      <PromptDetailModal
        prompt={selectedPrompt}
        open={isModalOpen}
        onClose={handleCloseModal}
        onFavorite={handleFavoritePrompt}
        onCopy={handleCopyPrompt}
        onFork={handleForkPrompt}
        isOwner={selectedPrompt?.authorId === user?.id}
      />

      <RenameCollectionDialog
        collection={collection || null}
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        onRename={handleRenameSubmit}
        isPending={updateCollectionMutation.isPending}
      />
    </PageContainer>
  );
}

