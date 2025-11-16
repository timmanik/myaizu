import { getTagColor } from '@aizu/shared';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
}

export const TagBadge = ({ tag, onRemove, className }: TagBadgeProps) => {
  const colorClass = getTagColor(tag);

  return (
    <Badge
      variant="outline"
      className={`${colorClass} ${className || ''} ${onRemove ? 'pr-1' : ''}`}
    >
      <span>{tag}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
          aria-label={`Remove ${tag} tag`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
};

