import type { Prompt } from '@aizu/shared';
import { PromptCard } from './PromptCard';

interface PromptCardGridProps {
  prompts: Prompt[];
  onFavorite?: (promptId: string) => void;
  onCopy?: (promptId: string) => void;
  onEdit?: (promptId: string) => void;
  onDelete?: (promptId: string) => void;
  onClick?: (promptId: string) => void;
  onFork?: (promptId: string) => void;
  onAddToCollection?: (promptId: string, collectionId: string) => void;
  onCreateCollection?: () => void;
  currentUserId?: string;
  // User/Home pinning
  showUserPinAction?: boolean;
  isPinnedToHome?: (promptId: string) => boolean;
  onPinToHome?: (promptId: string) => void;
  onUnpinFromHome?: (promptId: string) => void;
  // Team pinning
  showPinAction?: boolean;
  isPinned?: (promptId: string) => boolean;
  onPin?: (promptId: string) => void;
  onUnpin?: (promptId: string) => void;
}

export const PromptCardGrid = ({
  prompts,
  onFavorite,
  onCopy,
  onEdit,
  onDelete,
  onClick,
  onFork,
  onAddToCollection,
  onCreateCollection,
  currentUserId,
  showUserPinAction,
  isPinnedToHome,
  onPinToHome,
  onUnpinFromHome,
  showPinAction,
  isPinned,
  onPin,
  onUnpin,
}: PromptCardGridProps) => {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onFavorite={onFavorite}
          onCopy={onCopy}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
          onFork={onFork}
          onAddToCollection={onAddToCollection}
          onCreateCollection={onCreateCollection}
          isOwner={currentUserId === prompt.authorId}
          showUserPinAction={showUserPinAction}
          isPinnedToHome={isPinnedToHome ? isPinnedToHome(prompt.id) : false}
          onPinToHome={onPinToHome}
          onUnpinFromHome={onUnpinFromHome}
          showPinAction={showPinAction}
          isPinned={isPinned ? isPinned(prompt.id) : false}
          onPin={onPin}
          onUnpin={onUnpin}
        />
      ))}
    </div>
  );
};

