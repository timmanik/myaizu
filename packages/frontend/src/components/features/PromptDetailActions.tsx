import type { Prompt } from '@aizu/shared';
import { Button } from '@/components/ui/button';
import { Heart, Copy, GitBranch } from 'lucide-react';

interface PromptDetailActionsProps {
  prompt: Prompt;
  onFavorite: () => void;
  onCopy: () => void;
  onFork?: () => void;
  isOwner?: boolean;
}

export const PromptDetailActions = ({
  prompt,
  onFavorite,
  onCopy,
  onFork,
  isOwner,
}: PromptDetailActionsProps) => {
  return (
    <div className="flex items-center gap-2 pb-4 border-b">
      <Button
        variant={prompt.isFavorited ? 'default' : 'outline'}
        size="sm"
        onClick={onFavorite}
        className="flex items-center gap-2"
      >
        <Heart
          className={`h-4 w-4 ${
            prompt.isFavorited ? 'fill-current' : ''
          }`}
        />
        <span>{prompt.favoriteCount}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onCopy}
        className="flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        Copy ({prompt.copyCount})
      </Button>
      {!isOwner && onFork && (
        <Button
          variant="outline"
          size="sm"
          onClick={onFork}
          className="flex items-center gap-2"
        >
          <GitBranch className="h-4 w-4" />
          Remix
        </Button>
      )}
    </div>
  );
};

