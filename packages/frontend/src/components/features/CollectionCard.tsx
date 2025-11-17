import { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Layers, MoreVertical, Pencil, Trash2, Users } from 'lucide-react';
import type { Collection, TeamMemberRole } from '@aizu/shared';

interface CollectionCardProps {
  collection: Collection;
  onClick: () => void;
  onRename?: (collection: Collection) => void;
  onDelete?: (collection: Collection) => void;
  currentUserId?: string;
  userTeamRoles?: Map<string, TeamMemberRole>;
  viewMode?: 'grid' | 'list';
}

export function CollectionCard({
  collection,
  onClick,
  onRename,
  onDelete,
  currentUserId,
  userTeamRoles,
  viewMode = 'grid',
}: CollectionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Check if user can modify this collection
  const canModify = (() => {
    if (!currentUserId) return false;
    
    // Owner can always modify
    if (collection.ownerId === currentUserId) return true;
    
    // If it's a team collection, check if user is a team admin
    if (collection.teamId && userTeamRoles) {
      const role = userTeamRoles.get(collection.teamId);
      return role === 'ADMIN';
    }
    
    return false;
  })();

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onRename) {
      onRename(collection);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      onDelete(collection);
    }
  };

  if (viewMode === 'list') {
    return (
      <Card
        className="p-6 hover:shadow-lg transition-shadow cursor-pointer relative"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Layers className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{collection.name}</h3>
                {collection.teamId && collection.team && (
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {collection.team.name}
                  </Badge>
                )}
              </div>
              {collection.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>
              {collection._count?.collectionPrompts || 0} prompt
              {collection._count?.collectionPrompts !== 1 ? 's' : ''}
            </span>
            <span className="capitalize min-w-[80px] text-right">
              {collection.visibility.toLowerCase()}
            </span>
            {canModify && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={handleMenuToggle}
                  className="p-1 hover:bg-accent rounded-md transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-md shadow-lg z-50">
                    <button
                      onClick={handleRename}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Rename
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer relative"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1 min-w-0">
          <Layers className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{collection.name}</h3>
              {collection.teamId && collection.team && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {collection.team.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {canModify && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={handleMenuToggle}
              className="p-1 hover:bg-accent rounded-md transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-md shadow-lg z-50">
                <button
                  onClick={handleRename}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Rename
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {collection.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {collection.description}
        </p>
      )}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {collection._count?.collectionPrompts || 0} prompt
          {collection._count?.collectionPrompts !== 1 ? 's' : ''}
        </span>
        <span className="capitalize">{collection.visibility.toLowerCase()}</span>
      </div>
    </Card>
  );
}

