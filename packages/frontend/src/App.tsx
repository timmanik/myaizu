import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { RoleProtectedRoute } from './components/shared/RoleProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { Toaster } from './components/ui/toaster';
import { ConfirmProvider } from './hooks/use-confirm';
import { UserRole } from '@aizu/shared';
import { LoginPage } from './pages/auth/LoginPage';
import { InviteAcceptPage } from './pages/auth/InviteAcceptPage';
import { HomePage } from './pages/HomePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { MyPromptsPage } from './pages/prompts/MyPromptsPage';
import { PromptBuilderPage } from './pages/prompts/PromptBuilderPage';
import FavoritesPage from './pages/prompts/FavoritesPage';
import CollectionsPage from './pages/collections/CollectionsPage';
import CollectionDetailPage from './pages/collections/CollectionDetailPage';
import AllTeamsPage from './pages/teams/AllTeamsPage';
import TeamPage from './pages/teams/TeamPage';
import TeamMembersPage from './pages/teams/TeamMembersPage';
import TeamPromptsPage from './pages/teams/TeamPromptsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTeamsPage from './pages/admin/AdminTeamsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminInvitesPage from './pages/admin/AdminInvitesPage';
import AdminOrganizationPage from './pages/admin/AdminOrganizationPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { TrendingPage } from './pages/discover/TrendingPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <OrganizationProvider>
            <ConfirmProvider>
              <Toaster />
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/invite" element={<InviteAcceptPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="prompts" element={<MyPromptsPage />} />
              <Route path="prompts/new" element={<PromptBuilderPage />} />
              <Route path="prompts/:id/edit" element={<PromptBuilderPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="collections/:id" element={<CollectionDetailPage />} />
              <Route path="trending" element={<TrendingPage />} />
              <Route path="teams" element={<AllTeamsPage />} />
              <Route path="teams/:id" element={<TeamPage />} />
              <Route path="teams/:id/members" element={<TeamMembersPage />} />
              <Route path="teams/:id/prompts" element={<TeamPromptsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users/:id" element={<ProfilePage />} />
              
              {/* Admin routes - Super Admin only */}
              <Route
                path="admin"
                element={
                  <RoleProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="admin/teams"
                element={
                  <RoleProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
                    <AdminTeamsPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <RoleProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
                    <AdminUsersPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="admin/invites"
                element={
                  <RoleProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
                    <AdminInvitesPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="admin/organization"
                element={
                  <RoleProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
                    <AdminOrganizationPage />
                  </RoleProtectedRoute>
                }
              />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
            </ConfirmProvider>
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
