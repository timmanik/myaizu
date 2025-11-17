import { useState } from 'react';
import type { Prompt } from '@aizu/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye,
  History,
  BarChart3,
  Copy,
  Heart,
  GitBranch,
} from 'lucide-react';

interface PromptDetailContentProps {
  prompt: Prompt;
  variableValues: Record<string, string>;
  onVariableChange: (name: string, value: string) => void;
}

export const PromptDetailContent = ({
  prompt,
  variableValues,
  onVariableChange,
}: PromptDetailContentProps) => {
  const [activeTab, setActiveTab] = useState('preview');

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

  // Render preview with highlighted variables and values
  const renderPreviewWithHighlightedVariables = () => {
    const values = getVariableValues();
    const parts: React.ReactNode[] = [];
    let keyIndex = 0;

    // Create a map to track which parts should be highlighted
    const replacements: {
      index: number;
      length: number;
      value: string;
      isVariable: boolean;
    }[] = [];

    // Find all variable positions in original content
    const variableRegex = /\{\{[^}]+\}\}/g;
    let match;

    while ((match = variableRegex.exec(prompt.content)) !== null) {
      const varName = match[0].replace(/^\{\{\s*|\s*\}\}$/g, '').trim();
      const value = values[varName];

      if (value) {
        // Variable has a value - mark the replacement for highlighting
        replacements.push({
          index: match.index,
          length: match[0].length,
          value: value,
          isVariable: true,
        });
      } else {
        // Variable is empty - mark the placeholder for highlighting
        replacements.push({
          index: match.index,
          length: match[0].length,
          value: match[0],
          isVariable: true,
        });
      }
    }

    // Sort replacements by index
    replacements.sort((a, b) => a.index - b.index);

    // Build the final content with highlights
    let currentIndex = 0;
    replacements.forEach((replacement) => {
      // Add text before this replacement
      if (replacement.index > currentIndex) {
        parts.push(prompt.content.substring(currentIndex, replacement.index));
      }

      // Add the highlighted replacement
      parts.push(
        <span key={keyIndex++} className="bg-purple-200 text-purple-800 rounded">
          {replacement.value}
        </span>
      );

      currentIndex = replacement.index + replacement.length;
    });

    // Add remaining text
    if (currentIndex < prompt.content.length) {
      parts.push(prompt.content.substring(currentIndex));
    }

    return parts.length > 0 ? parts : prompt.content;
  };

  return (
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
          {/* Preview Section */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">
              Prompt Content Preview
            </h3>
            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {renderPreviewWithHighlightedVariables()}
              </pre>
            </div>
          </Card>

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
                        onVariableChange(variable.name, e.target.value)
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
                <div className="text-sm text-muted-foreground">Favorites</div>
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
  );
};

