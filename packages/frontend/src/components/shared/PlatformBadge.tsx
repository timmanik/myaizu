import type { Platform } from '@aizu/shared';
import { PLATFORM_LABELS, PLATFORM_COLORS } from '@aizu/shared';
import { Badge } from '@/components/ui/badge';

interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
}

export const PlatformBadge = ({ platform, className }: PlatformBadgeProps) => {
  const label = PLATFORM_LABELS[platform];
  const colorClass = PLATFORM_COLORS[platform];

  return (
    <Badge
      variant="outline"
      className={`${colorClass} ${className || ''}`}
    >
      {label}
    </Badge>
  );
};

