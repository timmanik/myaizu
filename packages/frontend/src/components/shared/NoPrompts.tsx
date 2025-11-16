import { FileText, Plus } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface NoPromptsProps {
  onCreatePrompt?: () => void;
}

export const NoPrompts = ({ onCreatePrompt }: NoPromptsProps) => {
  return (
    <EmptyState
      icon={FileText}
      title="No prompts yet"
      description="Create your first prompt to get started. Prompts help you organize and reuse AI conversations."
      actionLabel={onCreatePrompt ? 'Create Prompt' : undefined}
      actionIcon={Plus}
      onAction={onCreatePrompt}
    />
  );
};

