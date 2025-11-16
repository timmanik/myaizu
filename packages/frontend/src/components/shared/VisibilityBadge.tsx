import type { PromptVisibility } from '@aizu/shared';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, Lock } from 'lucide-react';

interface VisibilityBadgeProps {
  visibility: PromptVisibility;
  className?: string;
}

const VISIBILITY_CONFIG = {
  PUBLIC: {
    label: 'Public',
    icon: Globe,
    colorClass: 'bg-green-100 text-green-800 border-green-300',
  },
  TEAM: {
    label: 'Team',
    icon: Users,
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  PRIVATE: {
    label: 'Private',
    icon: Lock,
    colorClass: 'bg-gray-100 text-gray-800 border-gray-300',
  },
};

export const VisibilityBadge = ({
  visibility,
  className,
}: VisibilityBadgeProps) => {
  const config = VISIBILITY_CONFIG[visibility];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.colorClass} ${className || ''} flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

