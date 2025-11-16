import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ShieldAlert } from 'lucide-react';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-muted-foreground mx-auto" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to access this page. Please contact your administrator if you
          believe this is a mistake.
        </p>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    </div>
  );
}

