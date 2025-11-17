import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { TeamMemberManagement } from '../../components/features/TeamMemberManagement';
import { useTeam } from '../../hooks/useTeam';
import { useAuth } from '../../contexts/AuthContext';
import { TeamMemberRole, UserRole } from '@aizu/shared';
import { ArrowLeft, Users } from 'lucide-react';

export default function TeamMembersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: team, isLoading: loadingTeam } = useTeam(id!);

  // Check if current user is a team member
  const currentUserMembership = team?.members?.find((m) => m.userId === user?.id);
  const isTeamAdmin = currentUserMembership?.role === TeamMemberRole.ADMIN;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  
  // Super admins and team admins get full management access
  const canManage = isSuperAdmin || isTeamAdmin;

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
        <Button variant="ghost" size="sm" onClick={() => navigate(`/teams/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {team.name}
        </Button>
      </div>

      <div className="mb-6">
        <PageHeader
          title={`${team.name} Members`}
          description={`Manage and view all members of ${team.name}`}
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      <TeamMemberManagement
        teamId={id!}
        members={team.members || []}
        isAdmin={canManage}
        readOnly={!canManage}
      />
    </PageContainer>
  );
}

