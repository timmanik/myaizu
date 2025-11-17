import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PromptCardGrid } from '@/components/features/PromptCardGrid';
import { PromptDetailModal } from '@/components/features/PromptDetailModal';
import { usePrompts } from '@/hooks/usePrompts';
import { useFavoritePrompt } from '@/hooks/useFavoritePrompt';
import { useForkPrompt } from '@/hooks/useForkPrompt';
import { useDeletePrompt } from '@/hooks/useDeletePrompt';
import { useAddToCollection } from '@/hooks/useAddToCollection';
import { useUserPinnedPrompts } from '@/hooks/useUserPinnedPrompts';
import { usePinPromptToHome } from '@/hooks/usePinPromptToHome';
import { useUnpinPromptFromHome } from '@/hooks/useUnpinPromptFromHome';
import { useConfirm } from '@/hooks/use-confirm';
import { useToast } from '@/hooks/use-toast';
import { promptsApi } from '@/services/api/prompts';
import { FileText, Heart, Layers, Plus, ArrowRight, Pin } from 'lucide-react';
import type { Prompt } from '@aizu/shared';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user's prompts for stats
  const { data: myPromptsData } = usePrompts({ authorId: user?.id }, undefined, 1, 5);
  const { data: favoritesData } = usePrompts({ isFavorited: true }, undefined, 1, 5);
  const { data: pinnedPrompts, isLoading: loadingPinned } = useUserPinnedPrompts();
  const favoriteMutation = useFavoritePrompt();
  const forkMutation = useForkPrompt();
  const deleteMutation = useDeletePrompt();
  const addToCollectionMutation = useAddToCollection();
  const { mutate: pinToHome } = usePinPromptToHome();
  const { mutate: unpinFromHome } = useUnpinPromptFromHome();

  const myPrompts = myPromptsData?.prompts || [];
  const recentPrompts = myPrompts.slice(0, 5);
  const totalPrompts = myPromptsData?.total || 0;
  const totalFavorites = favoritesData?.total || 0;

  // Get list of pinned prompt IDs for checking
  const pinnedPromptIds = (pinnedPrompts as Prompt[] | undefined)?.map((p) => p.id) || [];

  const handleCreatePrompt = () => {
    navigate('/prompts/new');
  };

  const handleViewAllPrompts = () => {
    navigate('/prompts');
  };

  const handleFavoritePrompt = async (promptId: string) => {
    try {
      await favoriteMutation.mutateAsync(promptId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCopyPrompt = async (promptId: string) => {
    // Look for prompt in both myPrompts and pinnedPrompts
    const allPrompts = [...myPrompts, ...(pinnedPrompts as Prompt[] || [])];
    const prompt = allPrompts.find((p) => p.id === promptId);
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

  const handlePromptClick = (promptId: string) => {
    // Look for prompt in both myPrompts and pinnedPrompts
    const allPrompts = [...myPrompts, ...(pinnedPrompts as Prompt[] || [])];
    const prompt = allPrompts.find((p) => p.id === promptId);
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

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}!`}
        description="The best way to organize your AI conversations."
      />

      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalPrompts}</div>
                <div className="text-sm text-muted-foreground">My Prompts</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalFavorites}</div>
                <div className="text-sm text-muted-foreground">Favorites</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Collections</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Pinned Prompts Section */}
        {pinnedPrompts && pinnedPrompts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Pin className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold">Pinned Prompts</h2>
              <span className="text-sm text-muted-foreground">
                ({pinnedPrompts.length}/3)
              </span>
            </div>
            {loadingPinned ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading pinned prompts...</div>
              </div>
            ) : (
              <PromptCardGrid
                prompts={pinnedPrompts}
                onFavorite={handleFavoritePrompt}
                onCopy={handleCopyPrompt}
                onFork={handleForkPrompt}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={handlePromptClick}
                onAddToCollection={handleAddToCollection}
                currentUserId={user?.id}
                showUserPinAction={true}
                isPinnedToHome={(promptId) => pinnedPromptIds.includes(promptId)}
                onPinToHome={handlePinToHome}
                onUnpinFromHome={handleUnpinFromHome}
              />
            )}
          </div>
        )}

        {/* Recent Prompts */}
        {recentPrompts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Prompts</h2>
              <Button variant="ghost" onClick={handleViewAllPrompts}>
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <PromptCardGrid
              prompts={recentPrompts}
              onFavorite={handleFavoritePrompt}
              onCopy={handleCopyPrompt}
              onFork={handleForkPrompt}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={handlePromptClick}
              onAddToCollection={handleAddToCollection}
              currentUserId={user?.id}
              showUserPinAction={true}
              isPinnedToHome={(promptId) => pinnedPromptIds.includes(promptId)}
              onPinToHome={handlePinToHome}
              onUnpinFromHome={handleUnpinFromHome}
            />
          </div>
        )}

        {/* Empty State */}
        {totalPrompts === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  No prompts yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your first prompt to get started with organizing your AI conversations.
                </p>
                <Button onClick={handleCreatePrompt} size="default" className="h-10">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Prompt
                </Button>
              </div>
            </div>
          </Card>
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

