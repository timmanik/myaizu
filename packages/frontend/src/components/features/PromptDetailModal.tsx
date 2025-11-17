import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Prompt } from '@aizu/shared';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { promptsApi } from '@/services/api/prompts';
import { PromptDetailHeader } from './PromptDetailHeader';
import { PromptDetailActions } from './PromptDetailActions';
import { PromptDetailContent } from './PromptDetailContent';

interface PromptDetailModalProps {
  prompt: Prompt | null;
  open: boolean;
  onClose: () => void;
  onFavorite?: (promptId: string) => void;
  onCopy?: (promptId: string) => void;
  onFork?: (promptId: string) => void;
  isOwner?: boolean;
}

export const PromptDetailModal = ({
  prompt,
  open,
  onClose,
  onFavorite,
  onCopy,
  onFork,
  isOwner,
}: PromptDetailModalProps) => {
  const navigate = useNavigate();
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
  const { toast } = useToast();

  if (!prompt) return null;

  // Handle navigation to detail page
  const handleTitleClick = () => {
    navigate(`/prompts/${prompt.id}`);
    onClose();
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite(prompt.id);
    }
  };

  const handleCopy = async () => {
    try {
      // Replace variables in content with their values
      let contentToCopy = prompt.content;

      // Initialize variable values with defaults
      const initializeVariables = () => {
        if (prompt.variables) {
          const defaults: Record<string, string> = {};
          prompt.variables.forEach((v) => {
            defaults[v.name] = v.defaultValue || '';
          });
          return defaults;
        }
        return {};
      };

      // Get variable values with defaults
      const getVariableValues = () => {
        if (Object.keys(variableValues).length === 0 && prompt.variables) {
          return initializeVariables();
        }
        return variableValues;
      };

      const values = getVariableValues();
      
      // Replace all {{variable}} with their values
      Object.keys(values).forEach((varName) => {
        const value = values[varName];
        if (value) {
          // Replace all instances of {{varName}} with the value
          const regex = new RegExp(`\\{\\{\\s*${varName}\\s*\\}\\}`, 'g');
          contentToCopy = contentToCopy.replace(regex, value);
        }
      });
      
      // Copy to clipboard
      await navigator.clipboard.writeText(contentToCopy);
      
      // Increment the copy count on the backend
      await promptsApi.incrementCopy(prompt.id);
      
      toast({
        title: 'Success',
        description: 'Prompt copied to clipboard with your variable values!',
      });
      onCopy?.(prompt.id);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy prompt to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleFork = () => {
    if (onFork) {
      onFork(prompt.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <PromptDetailHeader
            prompt={prompt}
            onTitleClick={handleTitleClick}
            showClickableTitle={true}
          />
        </DialogHeader>

        <PromptDetailActions
          prompt={prompt}
          onFavorite={handleFavorite}
          onCopy={handleCopy}
          onFork={handleFork}
          isOwner={isOwner}
        />

        <PromptDetailContent
          prompt={prompt}
          variableValues={variableValues}
          onVariableChange={handleVariableChange}
        />
      </DialogContent>
    </Dialog>
  );
};
