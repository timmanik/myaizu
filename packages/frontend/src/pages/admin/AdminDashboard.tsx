import { useAdminStats } from '../../hooks/useAdminStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Users, Briefcase, FileText, Folder, Mail } from 'lucide-react';
import type { Role } from '@aizu/shared';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and statistics</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Failed to load statistics</p>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Total Users',
      value: stats.overview.totalUsers,
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Teams',
      value: stats.overview.totalTeams,
      icon: Briefcase,
      description: 'Active teams',
    },
    {
      title: 'Prompts',
      value: stats.overview.totalPrompts,
      icon: FileText,
      description: 'Total prompts',
    },
    {
      title: 'Collections',
      value: stats.overview.totalCollections,
      icon: Folder,
      description: 'Total collections',
    },
    {
      title: 'Active Invites',
      value: stats.overview.activeInvites,
      icon: Mail,
      description: 'Pending invites',
    },
  ];

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'TEAM_ADMIN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'MEMBER':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and statistics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grid layout for stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Breakdown of user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.usersByRole.map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(
                        item.role
                      )}`}
                    >
                      {item.role.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prompts by Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Prompts by Visibility</CardTitle>
            <CardDescription>Distribution of prompt visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.promptsByVisibility.map((item) => (
                <div key={item.visibility} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      {item.visibility}
                    </span>
                  </div>
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Last 5 registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

