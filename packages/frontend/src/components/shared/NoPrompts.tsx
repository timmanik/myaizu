import type { LucideIcon } from 'lucide-react';
import { FileText, Plus } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface NoPromptsProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  showButton?: boolean;
  onCreatePrompt?: () => void;
}

export const NoPrompts = ({
  title = 'No prompts yet',
  description = 'Create your first prompt to get started. Prompts help you organize and reuse AI conversations.',
  icon = FileText,
  showButton = true,
  onCreatePrompt,
}: NoPromptsProps) => {
  const shouldShowAction = showButton && !!onCreatePrompt;

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      actionLabel={shouldShowAction ? 'Create Prompt' : undefined}
      actionIcon={shouldShowAction ? Plus : undefined}
      onAction={shouldShowAction ? onCreatePrompt : undefined}
    />
  );
};
