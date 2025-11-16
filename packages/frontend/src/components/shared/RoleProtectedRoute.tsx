import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '@aizu/shared';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export const RoleProtectedRoute = ({ children, requiredRole }: RoleProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  // For now, simple role check (Super Admin has all access)
  const hasAccess = () => {
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    if (requiredRole === UserRole.TEAM_ADMIN && user.role === UserRole.TEAM_ADMIN) {
      return true;
    }
    
    if (requiredRole === UserRole.MEMBER) {
      return true;
    }
    
    return false;
  };

  if (!hasAccess()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
