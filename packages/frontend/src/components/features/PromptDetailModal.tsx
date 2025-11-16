import { useState } from 'react';
import type { Prompt } from '@aizu/shared';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformBadge } from '@/components/shared/PlatformBadge';
import { VisibilityBadge } from '@/components/shared/VisibilityBadge';
import { TagBadge } from '@/components/shared/TagBadge';
import {
  Heart,
  Copy,
  GitBranch,
  Eye,
  History,
  BarChart3,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [activeTab, setActiveTab] = useState('preview');
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );

  if (!prompt) return null;

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

  // Substitute variables in content for preview
  const getPreviewContent = () => {
    let content = prompt.content;
    const values = getVariableValues();

    Object.entries(values).forEach(([name, value]) => {
      const regex = new RegExp(`{{\\s*${name}\\s*}}`, 'g');
      content = content.replace(regex, value || `{{${name}}}`);
    });

    return content;
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

  const handleCopy = () => {
    if (onCopy) {
      onCopy(prompt.id);
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
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <DialogTitle className="text-2xl mb-2">
                {prompt.title}
              </DialogTitle>
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
                by {prompt.authorName || 'Unknown'}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pb-4 border-b">
          <Button
            variant={prompt.isFavorited ? 'default' : 'outline'}
            size="sm"
            onClick={handleFavorite}
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
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy ({prompt.copyCount})
          </Button>
          {!isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFork}
              className="flex items-center gap-2"
            >
              <GitBranch className="h-4 w-4" />
              Remix
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Version History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="preview" className="space-y-4 mt-0">
              {/* Variables Section */}
              {prompt.variables && prompt.variables.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Variables</h3>
                  <div className="space-y-3">
                    {prompt.variables.map((variable) => (
                      <div key={variable.name}>
                        <Label htmlFor={variable.name} className="text-xs">
                          {variable.name}
                          {variable.description && (
                            <span className="text-muted-foreground ml-1">
                              ({variable.description})
                            </span>
                          )}
                        </Label>
                        <Input
                          id={variable.name}
                          value={
                            getVariableValues()[variable.name] ||
                            variable.defaultValue ||
                            ''
                          }
                          onChange={(e) =>
                            handleVariableChange(variable.name, e.target.value)
                          }
                          placeholder={
                            variable.defaultValue || `Enter ${variable.name}`
                          }
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Preview Section */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">
                  Prompt Content Preview
                </h3>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {getPreviewContent()}
                  </pre>
                </div>
              </Card>

              {/* Additional Instructions */}
              {prompt.additionalInstructions && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">
                    Additional Instructions
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {prompt.additionalInstructions}
                  </p>
                </Card>
              )}

              {/* Prompt Type Info */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-2">Prompt Type</h3>
                <p className="text-sm text-muted-foreground">
                  {prompt.promptType === 'STANDARD_PROMPT'
                    ? 'Standard Prompt'
                    : prompt.promptType === 'CUSTOM_GPT'
                    ? 'Custom GPT'
                    : prompt.promptType === 'CLAUDE_PROJECT'
                    ? 'Claude Project'
                    : prompt.promptType === 'GEMINI_GEM'
                    ? 'Gemini Gem'
                    : prompt.promptType === 'CUSTOM_APP'
                    ? 'Custom App'
                    : 'Other'}
                </p>
                {prompt.config && (
                  <div className="mt-2 space-y-1">
                    {prompt.config.useWebSearch && (
                      <p className="text-xs text-muted-foreground">
                        • Uses web search
                      </p>
                    )}
                    {prompt.config.useDeepResearch && (
                      <p className="text-xs text-muted-foreground">
                        • Uses deep research
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <Card className="p-6 text-center">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Version History Coming Soon
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track changes and view previous versions of this prompt.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-6">
                  <div className="text-center">
                    <Copy className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-3xl font-bold mb-1">
                      {prompt.copyCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Copies
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-center">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <div className="text-3xl font-bold mb-1">
                      {prompt.favoriteCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Favorites
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-center">
                    <GitBranch className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-3xl font-bold mb-1">
                      {prompt.copyCount || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Remixes</div>
                  </div>
                </Card>
              </div>

              <Card className="p-6 mt-4">
                <h3 className="text-lg font-semibold mb-4">Usage Over Time</h3>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Detailed analytics coming soon
                  </p>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

