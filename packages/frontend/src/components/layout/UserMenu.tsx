import * as React from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [showContent, setShowContent] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle open/close animation lifecycle
  React.useEffect(() => {
    if (isOpen) {
      // Opening: render with opacity-0, then animate to opacity-100
      setShouldRender(true);
      // Use requestAnimationFrame to ensure the element is in DOM before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShowContent(true);
        });
      });
    } else {
      // Closing: animate out first
      setShowContent(false);
      // Then unmount after animation completes
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, 200); // Match the transition duration
    }

    // Cleanup timeout on unmount or state change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </button>

      {shouldRender && (
        <>
          {/* Overlay with fade animation */}
          <div 
            className={`fixed inset-0 z-10 transition-opacity duration-200 ${
              showContent ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
          />
          {/* Dropdown with fade + scale animation */}
          <div 
            className={`absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 shadow-lg z-20 transition-all duration-200 origin-top-right ${
              showContent 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-95'
            }`}
          >
            <div className="px-2 py-1.5 text-sm">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
              <div className="text-xs text-muted-foreground mt-1">{user.role.replace('_', ' ')}</div>
            </div>
            <div className="h-px bg-border my-1" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                handleClose();
                navigate(`/users/${user.id}`);
              }}
            >
              <User className="h-4 w-4" />
              View Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                handleClose();
                navigate('/settings');
              }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

