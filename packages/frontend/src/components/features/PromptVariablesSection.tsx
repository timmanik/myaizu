import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
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
  const [newVariableName, setNewVariableName] = useState('');
  const [newVariableDescription, setNewVariableDescription] = useState('');
  const [newVariableDefaultValue, setNewVariableDefaultValue] = useState('');

  // Extract variable names from prompt content (looking for {variable_name} pattern)
  const extractedVariables = Array.from(
    promptContent.matchAll(/\{(\w+)\}/g),
    (match) => match[1]
  );
  const uniqueExtractedVars = [...new Set(extractedVariables)];

  const handleAddVariable = () => {
    if (!newVariableName.trim()) return;

    const newVariable: PromptVariable = {
      name: newVariableName.trim(),
      description: newVariableDescription.trim() || undefined,
      defaultValue: newVariableDefaultValue.trim() || undefined,
    };

    onChange([...variables, newVariable]);
    setNewVariableName('');
    setNewVariableDescription('');
    setNewVariableDefaultValue('');
  };

  const handleRemoveVariable = (index: number) => {
    onChange(variables.filter((_, i) => i !== index));
  };

  const handleUpdateVariable = (index: number, field: keyof PromptVariable, value: string) => {
    const updated = [...variables];
    updated[index] = {
      ...updated[index],
      [field]: value || undefined,
    };
    onChange(updated);
  };

  const generatePreview = () => {
    let preview = promptContent;
    variables.forEach((variable) => {
      const regex = new RegExp(`\\{${variable.name}\\}`, 'g');
      preview = preview.replace(
        regex,
        variable.defaultValue || `{${variable.name}}`
      );
    });
    return preview;
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

        {/* Detected Variables Info */}
        {uniqueExtractedVars.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Variables detected in prompt:
            </p>
            <div className="flex flex-wrap gap-2">
              {uniqueExtractedVars.map((varName) => (
                <Badge key={varName} variant="secondary">
                  {'{' + varName + '}'}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Existing Variables */}
        <div className="space-y-3 mb-4">
          {variables.map((variable, index) => (
            <Card key={index} className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label className="text-xs">Variable Name</Label>
                      <Input
                        value={variable.name}
                        onChange={(e) =>
                          handleUpdateVariable(index, 'name', e.target.value)
                        }
                        placeholder="variable_name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Description (Optional)</Label>
                      <Input
                        value={variable.description || ''}
                        onChange={(e) =>
                          handleUpdateVariable(index, 'description', e.target.value)
                        }
                        placeholder="Describe this variable"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Default Value (Optional)</Label>
                      <Input
                        value={variable.defaultValue || ''}
                        onChange={(e) =>
                          handleUpdateVariable(index, 'defaultValue', e.target.value)
                        }
                        placeholder="Default value for preview"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveVariable(index)}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add New Variable */}
        <Card className="p-3 bg-gray-50">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Add New Variable</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                value={newVariableName}
                onChange={(e) => setNewVariableName(e.target.value)}
                placeholder="Variable name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddVariable();
                  }
                }}
              />
              <Input
                value={newVariableDescription}
                onChange={(e) => setNewVariableDescription(e.target.value)}
                placeholder="Description (optional)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddVariable();
                  }
                }}
              />
              <Input
                value={newVariableDefaultValue}
                onChange={(e) => setNewVariableDefaultValue(e.target.value)}
                placeholder="Default value (optional)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddVariable();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVariable}
              disabled={!newVariableName.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          </div>
        </Card>
      </Card>

      {/* Preview Section */}
      {showPreview && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Preview with Default Values</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <pre className="whitespace-pre-wrap text-sm font-mono">{generatePreview()}</pre>
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

