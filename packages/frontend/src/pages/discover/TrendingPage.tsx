import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { PromptCardGrid } from '@/components/features/PromptCardGrid';
import { PromptDetailModal } from '@/components/features/PromptDetailModal';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavoritePrompt } from '@/hooks/useFavoritePrompt';
import { useForkPrompt } from '@/hooks/useForkPrompt';
import { useDeletePrompt } from '@/hooks/useDeletePrompt';
import { useAddToCollection } from '@/hooks/useAddToCollection';
import { useConfirm } from '@/hooks/use-confirm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { promptsApi } from '@/services/api/prompts';
import {
  useMostFavorited,
  useFastRising,
  useNewPrompts,
} from '@/hooks/useTrending';
import { TrendingUp, Zap, Sparkles } from 'lucide-react';
import type { Prompt } from '@aizu/shared';

type TrendingTab = 'most-favorited' | 'fast-rising' | 'new';

export const TrendingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState<TrendingTab>('most-favorited');
  const [days, setDays] = useState(7);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data for each tab
  const mostFavoritedQuery = useMostFavorited(days, 20);
  const fastRisingQuery = useFastRising(days, 20);
  const newPromptsQuery = useNewPrompts(20);

  const favoriteMutation = useFavoritePrompt();
  const forkMutation = useForkPrompt();
  const deleteMutation = useDeletePrompt();
  const addToCollectionMutation = useAddToCollection();

  // Determine which data to show based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'most-favorited':
        return mostFavoritedQuery;
      case 'fast-rising':
        return fastRisingQuery;
      case 'new':
        return newPromptsQuery;
    }
  };

  const currentQuery = getCurrentData();
  const prompts = currentQuery.data || [];

  const handleFavorite = async (promptId: string) => {
    try {
      await favoriteMutation.mutateAsync(promptId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCopy = async (promptId: string) => {
    const prompt = prompts.find((p) => p.id === promptId);
    if (prompt) {
      try {
        await navigator.clipboard.writeText(prompt.content);
        // Increment the copy count on the backend
        await promptsApi.incrementCopy(promptId);
        toast({
          title: "Success",
          description: "Copied to clipboard!",
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

  const handleFork = async (promptId: string) => {
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

  const handleEdit = (promptId: string) => {
    navigate(`/prompts/${promptId}/edit`);
  };

  const handleDelete = async (promptId: string) => {
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

  const tabs = [
    {
      id: 'most-favorited' as TrendingTab,
      label: 'Most Favorited',
      icon: TrendingUp,
      description: `Most favorited in the last ${days} days`,
    },
    {
      id: 'fast-rising' as TrendingTab,
      label: 'Fast Rising',
      icon: Zap,
      description: 'Gaining favorites quickly',
    },
    {
      id: 'new' as TrendingTab,
      label: 'New',
      icon: Sparkles,
      description: 'Recently created prompts',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Trending"
        description="Discover popular and rising prompts from the community"
      />

      {/* Time Range Selector (for most-favorited and fast-rising) */}
      {(activeTab === 'most-favorited' || activeTab === 'fast-rising') && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time range:</span>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                variant={days === d ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDays(d)}
              >
                {d} days
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Description */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {tabs.find((t) => t.id === activeTab)?.description}
        </p>
      </div>

      {/* Content */}
      {currentQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      ) : currentQuery.error ? (
        <EmptyState
          icon={TrendingUp}
          title="Error Loading Trending Prompts"
          description="There was an error loading trending prompts. Please try again."
        >
          <Button onClick={() => currentQuery.refetch()}>Retry</Button>
        </EmptyState>
      ) : prompts.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No Trending Prompts Yet"
          description="Check back later for trending prompts from the community."
        >
          <Button onClick={() => navigate('/prompts/new')}>
            Create a Prompt
          </Button>
        </EmptyState>
      ) : (
        <PromptCardGrid
          prompts={prompts}
          onFavorite={handleFavorite}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onFork={handleFork}
          onClick={handlePromptClick}
          onAddToCollection={handleAddToCollection}
          currentUserId={user?.id}
        />
      )}

      <PromptDetailModal
        prompt={selectedPrompt}
        open={isModalOpen}
        onClose={handleCloseModal}
        onFavorite={handleFavorite}
        onCopy={handleCopy}
        onFork={handleFork}
        isOwner={selectedPrompt?.authorId === user?.id}
      />
    </PageContainer>
  );
};

