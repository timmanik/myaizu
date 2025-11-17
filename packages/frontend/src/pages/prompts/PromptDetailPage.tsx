import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePrompt } from '@/hooks/usePrompt';
import { useFavoritePrompt } from '@/hooks/useFavoritePrompt';
import { useForkPrompt } from '@/hooks/useForkPrompt';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { promptsApi } from '@/services/api/prompts';
import { PromptDetailHeader } from '@/components/features/PromptDetailHeader';
import { PromptDetailActions } from '@/components/features/PromptDetailActions';
import { PromptDetailContent } from '@/components/features/PromptDetailContent';

export const PromptDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );

  const { data: response, isLoading, error } = usePrompt(id);
  const favoriteMutation = useFavoritePrompt();
  const forkMutation = useForkPrompt();

  const prompt = response?.data;

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFavorite = async () => {
    if (!prompt) return;
    try {
      await favoriteMutation.mutateAsync(prompt.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;
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
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy prompt to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleFork = async () => {
    if (!prompt) return;
    try {
      await forkMutation.mutateAsync(prompt.id);
    } catch (error) {
      console.error('Failed to fork prompt:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading prompt...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !prompt) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load prompt</p>
          <Button onClick={handleBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isOwner = prompt.authorId === user?.id;

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        <PromptDetailHeader prompt={prompt} />

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
      </div>
    </PageContainer>
  );
};

export default PromptDetailPage;

