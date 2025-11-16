import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { FilterBar } from '../../components/features/FilterBar';
import { PromptCardGrid } from '../../components/features/PromptCardGrid';
import { PromptCardList } from '../../components/features/PromptCardList';
import { PromptDetailModal } from '../../components/features/PromptDetailModal';
import { NoPrompts } from '../../components/shared/NoPrompts';
import { NoSearchResults } from '../../components/shared/NoSearchResults';
import { usePrompts } from '../../hooks/usePrompts';
import { useFavoritePrompt } from '../../hooks/useFavoritePrompt';
import { useForkPrompt } from '../../hooks/useForkPrompt';
import { useDeletePrompt } from '../../hooks/useDeletePrompt';
import { useAddToCollection } from '../../hooks/useAddToCollection';
import { useConfirm } from '../../hooks/use-confirm';
import { useToast } from '../../hooks/use-toast';
import { useViewMode } from '../../hooks/useViewMode';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../contexts/AuthContext';
import { promptsApi } from '../../services/api/prompts';
import { Heart } from 'lucide-react';
import type { Prompt, PromptSort, Platform, PromptVisibility } from '@aizu/shared';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  const { viewMode, setViewMode } = useViewMode();
  
  // Individual filter states
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState<Platform | undefined>(undefined);
  const [visibility, setVisibility] = useState<PromptVisibility | undefined>(undefined);
  const [sort, setSort] = useState<PromptSort>({
    field: 'createdAt',
    order: 'desc',
  });
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const favoriteMutation = useFavoritePrompt();
  const forkMutation = useForkPrompt();
  const deleteMutation = useDeletePrompt();
  const addToCollectionMutation = useAddToCollection();

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  // Build filters for API
  const filters = {
    search: debouncedSearch,
    platform,
    visibility,
    isFavorited: true, // Always filter for favorites
  };

  const { data, isLoading } = usePrompts(filters, sort);

  const prompts = data?.prompts || [];
  const hasPrompts = prompts && prompts.length > 0;
  const hasFilters = debouncedSearch || platform || visibility;

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSort({ field: field as any, order });
  };

  const clearFilters = () => {
    setSearch('');
    setPlatform(undefined);
    setVisibility(undefined);
  };

  const handleFavoritePrompt = async (promptId: string) => {
    try {
      await favoriteMutation.mutateAsync(promptId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCopyPrompt = async (promptId: string) => {
    const prompt = prompts.find((p) => p.id === promptId);
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

  return (
    <PageContainer>
      <PageHeader
        title="Favorites"
        description="Your favorited prompts"
        icon={<Heart className="h-6 w-6" />}
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

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading favorites...</div>
          </div>
        ) : !hasPrompts && !hasFilters ? (
          <NoPrompts
            title="No favorites yet"
            description="Start favoriting prompts to see them here"
            showButton={false}
          />
        ) : !hasPrompts && hasFilters ? (
          <NoSearchResults searchQuery={search} onClearSearch={clearFilters} />
        ) : viewMode === 'grid' ? (
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
}

