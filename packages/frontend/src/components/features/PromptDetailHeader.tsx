import type { Prompt } from '@aizu/shared';
import { useNavigate } from 'react-router-dom';
import { PlatformBadge } from '@/components/shared/PlatformBadge';
import { VisibilityBadge } from '@/components/shared/VisibilityBadge';
import { TagBadge } from '@/components/shared/TagBadge';

interface PromptDetailHeaderProps {
  prompt: Prompt;
  onTitleClick?: () => void;
  showClickableTitle?: boolean;
}

export const PromptDetailHeader = ({
  prompt,
  onTitleClick,
  showClickableTitle = false,
}: PromptDetailHeaderProps) => {
  const navigate = useNavigate();

  const handleAuthorClick = () => {
    if (prompt.authorId) {
      navigate(`/users/${prompt.authorId}`);
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0 pr-4">
        {showClickableTitle ? (
          <h2
            onClick={onTitleClick}
            className="text-2xl font-bold mb-2 cursor-pointer hover:underline"
          >
            {prompt.title}
          </h2>
        ) : (
          <h2 className="text-2xl font-bold mb-2">{prompt.title}</h2>
        )}
        {prompt.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {prompt.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mb-3">
          <PlatformBadge platform={prompt.platform} />
          <VisibilityBadge visibility={prompt.visibility} />
          {prompt.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          by{' '}
          <button
            onClick={handleAuthorClick}
            className="cursor-pointer hover:underline inline text-left p-0 border-0 bg-transparent"
          >
            {prompt.authorName || 'Unknown'}
          </button>
        </p>
      </div>
    </div>
  );
};

