import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/features/FilterBar';
import { PromptCardGrid } from '@/components/features/PromptCardGrid';
import { PromptCardList } from '@/components/features/PromptCardList';
import { PromptDetailModal } from '@/components/features/PromptDetailModal';
import { NoPrompts } from '@/components/shared/NoPrompts';
import { NoSearchResults } from '@/components/shared/NoSearchResults';
import { usePrompts } from '@/hooks/usePrompts';
import { useDeletePrompt } from '@/hooks/useDeletePrompt';
import { useFavoritePrompt } from '@/hooks/useFavoritePrompt';
import { useForkPrompt } from '@/hooks/useForkPrompt';
import { useAddToCollection } from '@/hooks/useAddToCollection';
import { useConfirm } from '@/hooks/use-confirm';
import { useToast } from '@/hooks/use-toast';
import { useUserPinnedPrompts } from '@/hooks/useUserPinnedPrompts';
import { usePinPromptToHome } from '@/hooks/usePinPromptToHome';
import { useUnpinPromptFromHome } from '@/hooks/useUnpinPromptFromHome';
import { useFilters } from '@/hooks/useFilters';
import { useViewMode } from '@/hooks/useViewMode';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { promptsApi } from '@/services/api/prompts';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Prompt, PromptSort } from '@aizu/shared';

export const MyPromptsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  const { viewMode, setViewMode } = useViewMode();
  const {
    search,
    setSearch,
    platform,
    setPlatform,
    visibility,
    setVisibility,
    filters: baseFilters,
    clearFilters,
  } = useFilters();

  const [sort, setSort] = useState<PromptSort>({
    field: 'createdAt',
    order: 'desc',
  });
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  // Add authorId to filters to show only user's prompts
  const filters = {
    ...baseFilters,
    search: debouncedSearch,
    authorId: user?.id,
  };

  const { data, isLoading, error } = usePrompts(filters, sort);
  const deleteMutation = useDeletePrompt();
  const favoriteMutation = useFavoritePrompt();
  const forkMutation = useForkPrompt();
  const addToCollectionMutation = useAddToCollection();
  const { data: pinnedPrompts } = useUserPinnedPrompts();
  const { mutate: pinToHome } = usePinPromptToHome();
  const { mutate: unpinFromHome } = useUnpinPromptFromHome();

  // Get list of pinned prompt IDs for checking
  const pinnedPromptIds = (pinnedPrompts as Prompt[] | undefined)?.map((p) => p.id) || [];

  const handleCreatePrompt = () => {
    navigate('/prompts/new');
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

  const handleFavoritePrompt = async (promptId: string) => {
    try {
      await favoriteMutation.mutateAsync(promptId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCopyPrompt = async (promptId: string) => {
    const prompt = data?.prompts?.find((p) => p.id === promptId);
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

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSort({ field: field as any, order });
  };

  const handlePromptClick = (promptId: string) => {
    const prompt = prompts.find((p) => p.id === promptId);
    if (prompt) {
      setSelectedPrompt(prompt);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

  const handlePinToHome = (promptId: string) => {
    pinToHome(promptId);
  };

  const handleUnpinFromHome = (promptId: string) => {
    unpinFromHome(promptId);
  };

  const prompts = data?.prompts || [];
  const hasFilters = debouncedSearch || platform || visibility;
  const showEmptyState = !isLoading && prompts.length === 0;

  return (
    <PageContainer>
      <PageHeader
        title="My Prompts"
        description="Manage your personal prompt library"
        actions={
          <Button onClick={handleCreatePrompt}>
            <Plus className="h-4 w-4 mr-2" />
            New Prompt
          </Button>
        }
      />

      <div className="space-y-6">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          platform={platform}
          onPlatformChange={setPlatform}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sort.field}
          sortOrder={sort.order}
          onSortChange={handleSortChange}
        />

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading prompts...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load prompts</p>
          </div>
        )}

        {showEmptyState && !hasFilters && (
          <NoPrompts onCreatePrompt={handleCreatePrompt} />
        )}

        {showEmptyState && hasFilters && (
          <NoSearchResults searchQuery={search} onClearSearch={clearFilters} />
        )}

        {!isLoading && prompts.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <PromptCardGrid
                prompts={prompts}
                onFavorite={handleFavoritePrompt}
                onCopy={handleCopyPrompt}
                onEdit={handleEditPrompt}
                onDelete={handleDeletePrompt}
                onFork={handleForkPrompt}
                onClick={handlePromptClick}
                onAddToCollection={handleAddToCollection}
                currentUserId={user?.id}
                showUserPinAction={true}
                isPinnedToHome={(promptId) => pinnedPromptIds.includes(promptId)}
                onPinToHome={handlePinToHome}
                onUnpinFromHome={handleUnpinFromHome}
              />
            ) : (
              <PromptCardList
                prompts={prompts}
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

        {data && prompts.length > 0 && (
          <div className="flex justify-center items-center gap-4 py-6">
            <p className="text-sm text-muted-foreground">
              Showing {prompts.length} of {data.total} prompts
            </p>
          </div>
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
    </PageContainer>
  );
};

