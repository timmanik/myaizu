import type { Prompt } from '@aizu/shared';
import { PromptCard } from './PromptCard';

interface PromptCardListProps {
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
}

export const PromptCardList = ({
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
}: PromptCardListProps) => {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
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
        />
      ))}
    </div>
  );
};

