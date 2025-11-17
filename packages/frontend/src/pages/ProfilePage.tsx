import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { useUserPublicPrompts } from '../hooks/useUserPublicPrompts';
import { useUserPublicCollections } from '../hooks/useUserPublicCollections';
import { PromptCard } from '../components/features/PromptCard';
import { PromptDetailModal } from '../components/features/PromptDetailModal';
import { EmptyState } from '../components/shared/EmptyState';
import { useFavoritePrompt } from '../hooks/useFavoritePrompt';
import { useForkPrompt } from '../hooks/useForkPrompt';
import { useAddToCollection } from '../hooks/useAddToCollection';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { promptsApi } from '../services/api/prompts';
import { User, Loader2, ArrowLeft, FileText, Users, Layers, Folder } from 'lucide-react';
import { useState } from 'react';
import type { Prompt } from '@aizu/shared';

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [promptsPage, setPromptsPage] = useState(1);
  const [collectionsPage, setCollectionsPage] = useState(1);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: profile, isLoading: profileLoading } = usePublicProfile(id!);
  const { data: promptsData, isLoading: promptsLoading } = useUserPublicPrompts(id!, promptsPage);
  const { data: collectionsData, isLoading: collectionsLoading } = useUserPublicCollections(id!, collectionsPage);
  const favoriteMutation = useFavoritePrompt();
  const forkMutation = useForkPrompt();
  const addToCollectionMutation = useAddToCollection();

  if (profileLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer>
        <EmptyState
          icon={User}
          title="User not found"
          description="This user profile could not be found."
          action={
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const handleFavoritePrompt = async (promptId: string) => {
    try {
      await favoriteMutation.mutateAsync(promptId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCopyPrompt = async (promptId: string) => {
    const prompt = promptsData?.prompts.find((p) => p.id === promptId);
    if (prompt) {
      try {
        await navigator.clipboard.writeText(prompt.content);
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

  const handleCreateCollection = () => {
    // Navigate to collections page with create modal open
    navigate('/collections?create=true');
  };

  const handlePromptClick = (promptId: string) => {
    const prompt = promptsData?.prompts.find((p) => p.id === promptId);
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
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
            
            {/* Role Badge */}
            <div className="mb-2">
              <Badge variant="secondary" className="text-xs">
                {profile.role}
              </Badge>
            </div>

            {/* Teams */}
            {profile.teams && profile.teams.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Member of:</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.teams.map((team) => (
                      <Link
                        key={team.id}
                        to={`/teams/${team.id}`}
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {team.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-4">
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>

            {/* Stats */}
            <div className="flex gap-6 pt-4 border-t border-gray-200">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {profile.publicPromptsCount}
                </div>
                <div className="text-sm text-gray-600">Public Prompts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {profile.publicCollectionsCount}
                </div>
                <div className="text-sm text-gray-600">Public Collections</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Public Prompts Section */}
      <div className="mb-6">
        <PageHeader
          title="Public Prompts"
          description={`Prompts shared publicly by ${profile.name}`}
        />
      </div>

      {promptsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : promptsData?.prompts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No public prompts"
          description={`${profile.name} hasn't shared any public prompts yet.`}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promptsData?.prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onFavorite={handleFavoritePrompt}
                onCopy={handleCopyPrompt}
                onFork={handleForkPrompt}
                onAddToCollection={handleAddToCollection}
                onCreateCollection={handleCreateCollection}
                onClick={handlePromptClick}
                isOwner={user?.id === prompt.authorId}
              />
            ))}
          </div>

          {/* Pagination */}
          {promptsData && promptsData.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPromptsPage((p) => Math.max(1, p - 1))}
                disabled={promptsPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm text-gray-600">
                  Page {promptsPage} of {promptsData.pagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setPromptsPage((p) => p + 1)}
                disabled={promptsPage === promptsData.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Public Collections Section */}
      <div className="mt-12 mb-6">
        <PageHeader
          title="Public Collections"
          description={`Collections shared publicly by ${profile.name}`}
        />
      </div>

      {collectionsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : collectionsData?.collections.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No public collections"
          description={`${profile.name} hasn't shared any public collections yet.`}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectionsData?.collections.map((collection) => (
              <Card
                key={collection.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/collections/${collection.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Layers className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-semibold">{collection.name}</h3>
                  </div>
                </div>
                {collection.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {collection._count?.collectionPrompts || 0} prompt
                    {collection._count?.collectionPrompts !== 1 ? 's' : ''}
                  </span>
                  {collection.team && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {collection.team.name}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {collectionsData && collectionsData.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCollectionsPage((p) => Math.max(1, p - 1))}
                disabled={collectionsPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm text-gray-600">
                  Page {collectionsPage} of {collectionsData.pagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setCollectionsPage((p) => p + 1)}
                disabled={collectionsPage === collectionsData.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

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

