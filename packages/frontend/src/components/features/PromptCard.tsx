import type { Prompt } from '@aizu/shared';
import { Card } from '@/components/ui/card';
import { PlatformBadge } from '@/components/shared/PlatformBadge';
import { TagBadge } from '@/components/shared/TagBadge';
import { VisibilityBadge } from '@/components/shared/VisibilityBadge';
import { CollectionPicker } from '@/components/features/CollectionPicker';
import {
  Heart,
  Copy,
  MoreVertical,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  GitBranch,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';

interface PromptCardProps {
  prompt: Prompt;
  onFavorite?: (promptId: string) => void;
  onCopy?: (promptId: string) => void;
  onEdit?: (promptId: string) => void;
  onDelete?: (promptId: string) => void;
  onClick?: (promptId: string) => void;
  // Team pinning (existing)
  onPin?: (promptId: string) => void;
  onUnpin?: (promptId: string) => void;
  isPinned?: boolean;
  showPinAction?: boolean;
  // User/Home pinning (new)
  onPinToHome?: (promptId: string) => void;
  onUnpinFromHome?: (promptId: string) => void;
  isPinnedToHome?: boolean;
  showUserPinAction?: boolean;
  // Other actions
  onFork?: (promptId: string) => void;
  onAddToCollection?: (promptId: string, collectionId: string) => void;
  onCreateCollection?: () => void;
  showActions?: boolean;
  isOwner?: boolean;
  showForkAction?: boolean;
}

export const PromptCard = ({
  prompt,
  onFavorite,
  onCopy,
  onEdit,
  onDelete,
  onClick,
  onPin,
  onUnpin,
  onPinToHome,
  onUnpinFromHome,
  onFork,
  onAddToCollection,
  onCreateCollection,
  showActions = true,
  isOwner = false,
  isPinned = false,
  showPinAction = false,
  isPinnedToHome = false,
  showUserPinAction = false,
  showForkAction = true,
}: PromptCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<'left' | 'right'>('right');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isClickingMenu = menuRef.current?.contains(target);
      const isClickingCollectionPicker = target.closest('[data-collection-picker]');
      
      // Close everything if clicking outside both menu and picker
      if (!isClickingMenu && !isClickingCollectionPicker) {
        setShowMenu(false);
        setShowCollectionPicker(false);
      }
    };

    if (showMenu || showCollectionPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showCollectionPicker]);

  const handleCardClick = () => {
    if (onClick) {
      onClick(prompt.id);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(prompt.id);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(prompt.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onEdit) {
      onEdit(prompt.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      onDelete(prompt.id);
    }
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPin) {
      onPin(prompt.id);
    }
  };

  const handleUnpin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnpin) {
      onUnpin(prompt.id);
    }
  };

  const handleFork = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFork) {
      onFork(prompt.id);
    }
  };

  const handlePinToHome = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPinToHome) {
      onPinToHome(prompt.id);
    }
  };

  const handleUnpinFromHome = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnpinFromHome) {
      onUnpinFromHome(prompt.id);
    }
  };

  const handleAddToCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Determine position based on available space
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.right;
      const neededSpace = 280; // Width of collection picker (264px + some padding)
      
      if (spaceOnRight < neededSpace) {
        setPickerPosition('left');
      } else {
        setPickerPosition('right');
      }
    }
    
    setShowCollectionPicker(true);
  };

  const handleCollectionSelect = async (collectionId: string) => {
    if (onAddToCollection) {
      await onAddToCollection(prompt.id, collectionId);
      // Close both picker and menu after successful add
      setShowCollectionPicker(false);
      setShowMenu(false);
    }
  };

  const handleCloseCollectionPicker = () => {
    setShowCollectionPicker(false);
  };

  return (
    <Card
      className={`p-4 hover:shadow-lg transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate mb-1">{prompt.title}</h3>
          <p className="text-sm text-muted-foreground">
            by {prompt.authorName || 'Unknown'}
          </p>
        </div>
        {showActions && isOwner && (
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10">
                <div className="relative">
                  <button
                    onClick={handleAddToCollection}
                    onMouseEnter={handleAddToCollection}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-3 w-3" />
                      Add to collection
                    </div>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  {showCollectionPicker && (
                    <CollectionPicker
                      isOpen={showCollectionPicker}
                      onClose={handleCloseCollectionPicker}
                      onSelect={handleCollectionSelect}
                      onCreateNew={onCreateCollection}
                      position={pickerPosition}
                    />
                  )}
                </div>
                <button
                  onClick={handleEdit}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {prompt.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {prompt.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <PlatformBadge platform={prompt.platform} />
        <VisibilityBadge visibility={prompt.visibility} />
        {prompt.tags.slice(0, 3).map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
        {prompt.tags.length > 3 && (
          <span className="text-xs text-muted-foreground self-center">
            +{prompt.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Stats and Actions */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{prompt.favoriteCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Copy className="h-4 w-4" />
            <span>{prompt.copyCount}</span>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            {/* User/Home Pin Action (orange) */}
            {showUserPinAction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={isPinnedToHome ? handleUnpinFromHome : handlePinToHome}
                className="h-8 px-2"
                title={isPinnedToHome ? 'Unpin from my Home' : 'Pin to my Home'}
              >
                {isPinnedToHome ? (
                  <Pin className="h-4 w-4 text-orange-500 fill-orange-500" />
                ) : (
                  <Pin className="h-4 w-4 text-orange-500" />
                )}
              </Button>
            )}
            {/* Team Pin Action (blue) */}
            {showPinAction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={isPinned ? handleUnpin : handlePin}
                className="h-8 px-2"
                title={isPinned ? 'Unpin from Team' : 'Pin to Team'}
              >
                {isPinned ? (
                  <PinOff className="h-4 w-4 text-blue-500" />
                ) : (
                  <Pin className="h-4 w-4 text-blue-500" />
                )}
              </Button>
            )}
            {showForkAction && !isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFork}
                className="h-8 px-2"
                title="Remix this prompt"
              >
                <GitBranch className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              className="h-8 px-2"
            >
              <Heart
                className={`h-4 w-4 ${
                  prompt.isFavorited ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

