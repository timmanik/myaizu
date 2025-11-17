import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { CollectionsListPage } from '../collections/CollectionsPage';
import { useTeam } from '../../hooks/useTeam';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TeamCollectionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: team, isLoading: loadingTeam } = useTeam(id!);

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

  return <CollectionsListPage mode="team" teamId={id!} teamName={team.name} />;
}

