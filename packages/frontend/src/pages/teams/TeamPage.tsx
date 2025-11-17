import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { PromptCard } from '../../components/features/PromptCard';
import { PromptDetailModal } from '../../components/features/PromptDetailModal';
import { CollectionCard } from '../../components/features/CollectionCard';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { useTeam } from '../../hooks/useTeam';
import { useTeams } from '../../hooks/useTeams';
import { useTeamPrompts } from '../../hooks/useTeamPrompts';
import { useCollections } from '../../hooks/useCollections';
import { useFavoritePrompt } from '../../hooks/useFavoritePrompt';
import { useForkPrompt } from '../../hooks/useForkPrompt';
import { useAddToCollection } from '../../hooks/useAddToCollection';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { promptsApi } from '../../services/api/prompts';
import { type Prompt, type TeamMemberRole } from '@aizu/shared';
import { ArrowLeft, Users, Eye, FileText, Layers } from 'lucide-react';

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
  
  // Fetch prompts with view mode
  const { data: prompts, isLoading: loadingPrompts } = useTeamPrompts(id!, { viewAsPublic });
  
  // Fetch team collections
  const { data: allCollections, isLoading: loadingCollections } = useCollections({ teamId: id });
  
  // Fetch all teams for role mapping
  const { data: allTeams = [] } = useTeams(
    user ? { memberUserId: user.id } : undefined
  );
  
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
  
  // Show only first 6 collections for preview
  const previewCollections = allCollections?.slice(0, 6) || [];
  
  const favoriteMutation = useFavoritePrompt();
  const forkMutation = useForkPrompt();
  const addToCollectionMutation = useAddToCollection();

  const handleFavoritePrompt = async (promptId: string) => {
    try {
      await favoriteMutation.mutateAsync(promptId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCopyPrompt = async (promptId: string) => {
    const prompt = prompts?.find((p: any) => p.id === promptId);
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
    const prompt = prompts?.find((p: any) => p.id === promptId);
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
          <div className="flex items-center gap-3 mt-2 bg-muted px-4 py-2 rounded-lg">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="view-toggle" className="text-sm font-medium cursor-pointer">
              {viewAsPublic ? "Public View" : "Member View"}
            </Label>
            <Switch
              id="view-toggle"
              checked={viewAsPublic}
              onCheckedChange={setViewAsPublic}
            />
          </div>
        )}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card 
          className="p-6 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => navigate(`/teams/${id}/members`)}
        >
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{team._count?.members || 0}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
          </div>
        </Card>
        <Card 
          className="p-6 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => navigate(`/teams/${id}/prompts`)}
        >
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{team._count?.prompts || 0}</div>
              <div className="text-sm text-muted-foreground">Prompts</div>
            </div>
          </div>
        </Card>
        <Card 
          className="p-6 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => navigate(`/teams/${id}/collections`)}
        >
          <div className="flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{team._count?.collections || 0}</div>
              <div className="text-sm text-muted-foreground">Collections</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Collections */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Team Collections</h2>
          {allCollections && allCollections.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/teams/${id}/collections`)}
            >
              View All Collections
            </Button>
          )}
        </div>
        {loadingCollections ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading collections...</div>
          </div>
        ) : !previewCollections || previewCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Layers className="h-12 w-12 text-muted-foreground/20 mb-2" />
            <p className="text-muted-foreground">No collections in this team yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => navigate(`/collections/${collection.id}`)}
                currentUserId={user?.id}
                userTeamRoles={userTeamRoles}
                viewMode="grid"
              />
            ))}
          </div>
        )}
      </div>

      {/* Team Prompts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Team Prompts</h2>
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

