import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useTeams } from '../../hooks/useTeams';
import { Users, Search } from 'lucide-react';

export default function AllTeamsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: teams, isLoading } = useTeams({
    search: searchQuery || undefined,
  });

  const filteredTeams = teams || [];

  return (
    <PageContainer>
      <PageHeader
        title="All Teams"
        description="Browse all teams in your organization"
        icon={<Users className="h-6 w-6" />}
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading teams...</div>
        </div>
      ) : filteredTeams.length === 0 && !searchQuery ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Users className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground">
            You are not a member of any teams yet
          </p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground">No teams found matching your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card
              key={team.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-semibold">{team.name}</h3>
                </div>
              </div>
              {team.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {team.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {team._count?.members || 0} member{team._count?.members !== 1 ? 's' : ''}
                </span>
                <span>
                  {team._count?.prompts || 0} prompt{team._count?.prompts !== 1 ? 's' : ''}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

