import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import type { PromptVariable } from '@aizu/shared';

interface PromptVariablesSectionProps {
  variables: PromptVariable[];
  onChange: (variables: PromptVariable[]) => void;
  promptContent: string;
}

export const PromptVariablesSection = ({
  variables,
  onChange,
  promptContent,
}: PromptVariablesSectionProps) => {
  const [showPreview, setShowPreview] = useState(false);

  // Extract variable names from prompt content (looking for {{variable name}} pattern)
  const extractedVariables = Array.from(
    promptContent.matchAll(/\{\{(.+?)\}\}/g),
    (match) => match[1].trim()
  );
  const uniqueExtractedVars = [...new Set(extractedVariables)];

  // Sync variables with detected ones in prompt content
  useEffect(() => {
    // Create a map of existing variables by name for quick lookup
    const existingVarsMap = new Map(
      variables.map((v) => [v.name, v])
    );

    // Build new variables array based on detected variables
    const syncedVariables: PromptVariable[] = uniqueExtractedVars.map((varName) => {
      // If variable already exists, keep its description and default value
      const existing = existingVarsMap.get(varName);
      if (existing) {
        return existing;
      }
      // Otherwise, create a new variable with just the name
      return {
        name: varName,
        description: undefined,
        defaultValue: undefined,
      };
    });

    // Only update if the variables have actually changed
    const hasChanged =
      syncedVariables.length !== variables.length ||
      syncedVariables.some((v, i) => v.name !== variables[i]?.name);

    if (hasChanged) {
      onChange(syncedVariables);
    }
  }, [uniqueExtractedVars.join(',')]); // Depend on the detected variable names

  const handleUpdateVariable = (varName: string, field: keyof PromptVariable, value: string) => {
    const updated = variables.map((v) =>
      v.name === varName
        ? {
            ...v,
            [field]: value || undefined,
          }
        : v
    );
    onChange(updated);
  };

  const generatePreview = () => {
    let preview = promptContent;
    variables.forEach((variable) => {
      const escapedName = variable.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\{\\{\\s*${escapedName}\\s*\\}\\}`, 'g');
      preview = preview.replace(
        regex,
        variable.defaultValue || `{{${variable.name}}}`
      );
    });
    return preview;
  };

  // Render preview with highlighted variables
  const renderPreviewWithHighlightedVariables = () => {
    const preview = generatePreview();
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Match all variable patterns (both filled and unfilled)
    const variableRegex = /\{\{[^}]+\}\}/g;
    let match;
    
    while ((match = variableRegex.exec(preview)) !== null) {
      // Add text before the variable
      if (match.index > lastIndex) {
        parts.push(preview.substring(lastIndex, match.index));
      }
      // Add the variable with purple highlight
      parts.push(<span key={match.index} className="bg-purple-200 text-purple-800 rounded">{match[0]}</span>);
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < preview.length) {
      parts.push(preview.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : preview;
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Variables</h3>
            <p className="text-sm text-muted-foreground">
              Define variables for your prompt template
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>
        </div>

        {/* Variables List */}
        {variables.length > 0 ? (
          <div className="space-y-3">
            {variables.map((variable) => (
              <Card key={variable.name} className="p-3 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Variable name</Label>
                    <Input
                      value={variable.name}
                      disabled
                      className="mt-1 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description (optional)</Label>
                    <Input
                      value={variable.description || ''}
                      onChange={(e) =>
                        handleUpdateVariable(variable.name, 'description', e.target.value)
                      }
                      placeholder="Describe this variable"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Default value (optional)</Label>
                    <Input
                      value={variable.defaultValue || ''}
                      onChange={(e) =>
                        handleUpdateVariable(variable.name, 'defaultValue', e.target.value)
                      }
                      placeholder="Default value for preview"
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No variables detected. Use {'{{variable name}}'} syntax in your prompt content to add variables.
          </div>
        )}
      </Card>

      {/* Preview Section */}
      {showPreview && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Preview with Default Values</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <pre className="whitespace-pre-wrap text-sm font-mono">{renderPreviewWithHighlightedVariables()}</pre>
          </div>
          {variables.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Add variables to see how they will be substituted in the preview.
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

