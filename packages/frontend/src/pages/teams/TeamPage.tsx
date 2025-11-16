import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { PromptCard } from '../../components/features/PromptCard';
import { PromptDetailModal } from '../../components/features/PromptDetailModal';
import { TeamMemberManagement } from '../../components/features/TeamMemberManagement';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useTeam } from '../../hooks/useTeam';
import { useTeamPrompts } from '../../hooks/useTeamPrompts';
import { usePinnedPrompts } from '../../hooks/usePinnedPrompts';
import { usePinPrompt } from '../../hooks/usePinPrompt';
import { useUnpinPrompt } from '../../hooks/useUnpinPrompt';
import { useFavoritePrompt } from '../../hooks/useFavoritePrompt';
import { useForkPrompt } from '../../hooks/useForkPrompt';
import { useAddToCollection } from '../../hooks/useAddToCollection';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { promptsApi } from '../../services/api/prompts';
import { TeamMemberRole, type Prompt } from '@aizu/shared';
import { ArrowLeft, Users, Pin, Eye, EyeOff } from 'lucide-react';

export default function TeamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewAsPublic, setViewAsPublic] = useState(false);

  const { data: team, isLoading: loadingTeam } = useTeam(id!);
  
  // Check if current user is a team member
  const currentUserMembership = team?.members?.find((m) => m.userId === user?.id);
  const isTeamMember = !!currentUserMembership;
  const isTeamAdmin = currentUserMembership?.role === TeamMemberRole.ADMIN;
  
  // Fetch prompts and pinned prompts with view mode
  const { data: prompts, isLoading: loadingPrompts } = useTeamPrompts(id!, { viewAsPublic });
  const { data: pinnedPrompts, isLoading: loadingPinnedPrompts } = usePinnedPrompts(id!, viewAsPublic);
  
  const { mutate: pinPrompt } = usePinPrompt();
  const { mutate: unpinPrompt } = useUnpinPrompt();
  const favoriteMutation = useFavoritePrompt();
  const forkMutation = useForkPrompt();
  const addToCollectionMutation = useAddToCollection();
  
  // Get list of pinned prompt IDs for easy checking
  const pinnedPromptIds = team?.pinnedPrompts || [];

  const handlePin = (promptId: string) => {
    if (id) {
      pinPrompt({ teamId: id, promptId });
    }
  };

  const handleUnpin = (promptId: string) => {
    if (id) {
      unpinPrompt({ teamId: id, promptId });
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
    const allPrompts = [...(pinnedPrompts || []), ...(prompts || [])];
    const prompt = allPrompts.find((p: any) => p.id === promptId);
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

  const handlePromptClick = (promptId: string) => {
    const allPrompts = [...(pinnedPrompts || []), ...(prompts || [])];
    const prompt = allPrompts.find((p: any) => p.id === promptId);
    if (prompt) {
      setSelectedPrompt(prompt);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

  if (loadingTeam) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading team...</div>
        </div>
      </PageContainer>
    );
  }

  if (!team) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-lg font-semibold mb-2">Team not found</h3>
          <Button onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/teams')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Teams
        </Button>
      </div>

      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title={team.name}
          description={team.description || undefined}
          icon={<Users className="h-6 w-6" />}
        />
        
        {isTeamMember && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant={viewAsPublic ? "outline" : "default"}
              size="sm"
              onClick={() => setViewAsPublic(false)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Member View
            </Button>
            <Button
              variant={viewAsPublic ? "default" : "outline"}
              size="sm"
              onClick={() => setViewAsPublic(true)}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Public View
            </Button>
          </div>
        )}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{team._count?.members || 0}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{team._count?.prompts || 0}</div>
              <div className="text-sm text-muted-foreground">Prompts</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{team.pinnedPrompts?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Pinned Prompts</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Members */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Team Members</h2>
        <TeamMemberManagement
          teamId={id!}
          members={team.members || []}
          isAdmin={isTeamAdmin}
        />
      </div>

      {/* Pinned Prompts */}
      {pinnedPrompts && pinnedPrompts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Pin className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Pinned Prompts</h2>
          </div>
          {loadingPinnedPrompts ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading pinned prompts...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedPrompts.map((prompt: any) => (
                <div key={prompt.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                    <Pin className="h-3 w-3" />
                  </div>
                  <PromptCard 
                    prompt={prompt}
                    showPinAction={isTeamAdmin}
                    isPinned={true}
                    onPin={handlePin}
                    onUnpin={handleUnpin}
                    onFavorite={handleFavoritePrompt}
                    onCopy={handleCopyPrompt}
                    onFork={handleForkPrompt}
                    onClick={handlePromptClick}
                    onAddToCollection={handleAddToCollection}
                    isOwner={user?.id === prompt.authorId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Team Prompts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Team Prompts</h2>
          {isTeamMember && viewAsPublic && (
            <span className="text-sm text-muted-foreground italic">
              Viewing as public - only PUBLIC prompts visible
            </span>
          )}
        </div>
        {loadingPrompts ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading prompts...</div>
          </div>
        ) : !prompts || prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground">
              {viewAsPublic 
                ? "No public prompts from team members yet"
                : "No prompts in this team yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt: any) => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt}
                showPinAction={isTeamAdmin}
                isPinned={pinnedPromptIds.includes(prompt.id)}
                onPin={handlePin}
                onUnpin={handleUnpin}
                onFavorite={handleFavoritePrompt}
                onCopy={handleCopyPrompt}
                onFork={handleForkPrompt}
                onClick={handlePromptClick}
                onAddToCollection={handleAddToCollection}
                isOwner={user?.id === prompt.authorId}
              />
            ))}
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

