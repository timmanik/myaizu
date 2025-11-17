import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { TagBadge } from '@/components/shared/TagBadge';
import { PromptVariablesSection } from '@/components/features/PromptVariablesSection';
import { usePrompt } from '@/hooks/usePrompt';
import { useCreatePrompt } from '@/hooks/useCreatePrompt';
import { useUpdatePrompt } from '@/hooks/useUpdatePrompt';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/use-confirm';
import type { Platform, PromptVisibility, CreatePromptDto, PromptVariable, PromptType, PromptConfig } from '@aizu/shared';
import { PLATFORMS, PLATFORM_LABELS, PROMPT_TYPES, PROMPT_TYPE_LABELS } from '@aizu/shared';
import { ArrowLeft, Save, X } from 'lucide-react';

export const PromptBuilderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useConfirm();
  const isEditing = !!id;

  // Fetch prompt if editing
  const { data: promptData } = usePrompt(id);
  const createMutation = useCreatePrompt();
  const updateMutation = useUpdatePrompt();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<Platform>('CHATGPT' as Platform);
  const [visibility, setVisibility] = useState<PromptVisibility>('PRIVATE' as PromptVisibility);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [variables, setVariables] = useState<PromptVariable[]>([]);
  const [promptType, setPromptType] = useState<PromptType>('STANDARD_PROMPT' as PromptType);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [config, setConfig] = useState<PromptConfig>({
    useWebSearch: false,
    useDeepResearch: false,
  });

  // Render content with highlighted variables for overlay
  const renderContentWithHighlightedVariables = () => {
    if (!content) return '';
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const variableRegex = /\{\{[^}]+\}\}/g;
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      parts.push(
        <span key={match.index} className="bg-purple-200 text-purple-800 rounded">
          {match[0]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    return parts;
  };

  // Load prompt data when editing
  useEffect(() => {
    if (promptData?.data) {
      const prompt = promptData.data;
      setTitle(prompt.title);
      setContent(prompt.content);
      setDescription(prompt.description || '');
      setPlatform(prompt.platform);
      setVisibility(prompt.visibility);
      setTags(prompt.tags);
      setVariables(prompt.variables || []);
      setPromptType(prompt.promptType || 'STANDARD_PROMPT');
      setAdditionalInstructions(prompt.additionalInstructions || '');
      setConfig({
        useWebSearch: prompt.config?.useWebSearch || false,
        useDeepResearch: prompt.config?.useDeepResearch || false,
      });
    }
  }, [promptData]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and content are required",
      });
      return;
    }

    const promptData: CreatePromptDto = {
      title: title.trim(),
      content: content.trim(),
      description: description.trim() || undefined,
      platform,
      visibility,
      tags,
      variables: variables.length > 0 ? variables : undefined,
      promptType,
      additionalInstructions: additionalInstructions.trim() || undefined,
      config: {
        useWebSearch: config.useWebSearch,
        useDeepResearch: config.useDeepResearch,
      },
    };

    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, data: promptData });
      } else {
        await createMutation.mutateAsync(promptData);
      }
      navigate(-1);
    } catch (error) {
      console.error('Failed to save prompt:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save prompt",
      });
    }
  };

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: "Discard Changes",
      description: "Are you sure you want to discard your changes?",
      confirmText: "Discard",
      variant: "destructive",
    });

    if (confirmed) {
      navigate(-1);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <PageContainer>
      <PageHeader
        title={isEditing ? 'Edit Prompt' : 'Create Prompt'}
        description={
          isEditing
            ? 'Update your prompt details'
            : 'Create a new prompt for your library'
        }
      >
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter prompt title..."
                maxLength={200}
                required
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {title.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this prompt does..."
                maxLength={500}
                rows={2}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/500 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">
                Prompt Content <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                {/* Formatted text overlay - shows the highlighted variables */}
                <div
                  className="absolute inset-0 pointer-events-none px-3 py-2 whitespace-pre-wrap break-words font-mono text-sm overflow-hidden rounded-md"
                  aria-hidden="true"
                  style={{
                    lineHeight: '1.5',
                    color: 'black',
                  }}
                >
                  {renderContentWithHighlightedVariables()}
                </div>
                {/* Actual textarea - invisible but captures input */}
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your prompt content here..."
                required
                rows={10}
                  className="font-mono relative bg-transparent"
                  style={{
                    color: 'transparent',
                    caretColor: 'black',
                    resize: 'vertical',
                    WebkitTextFillColor: 'transparent',
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Use variables like {'{{variable name}}'} in your prompt
              </p>
            </div>

            {/* Platform and Prompt Type - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Platform */}
              <div>
                <Label htmlFor="platform">
                  Platform <span className="text-red-500">*</span>
                </Label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  className="w-full px-3 py-2 border rounded-md mt-2"
                  required
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {PLATFORM_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prompt Type */}
              <div>
                <Label htmlFor="promptType">
                  Prompt Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="promptType"
                  value={promptType}
                  onChange={(e) => setPromptType(e.target.value as PromptType)}
                  className="w-full px-3 py-2 border rounded-md mt-2"
                  required
                >
                  {PROMPT_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {PROMPT_TYPE_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Instructions */}
            <div>
              <Label htmlFor="additionalInstructions">
                Additional Instructions{' '}
                <span className="text-xs text-muted-foreground font-normal">
                  (Optional)
                </span>
              </Label>
              <Textarea
                id="additionalInstructions"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="Any additional context, files, or platform-specific settings..."
                maxLength={500}
                rows={3}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mention if there are additional files or platform-specific configs enabled
              </p>
            </div>

            {/* Feature Flags */}
            <div>
              <Label>Additional Features</Label>
              <div className="space-y-3 mt-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.useWebSearch}
                    onChange={(e) =>
                      setConfig({ ...config, useWebSearch: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Use web search (when available)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.useDeepResearch}
                    onChange={(e) =>
                      setConfig({ ...config, useDeepResearch: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Enable deep research (when available)</span>
                </label>
              </div>
            </div>

            {/* Visibility */}
            <div className="max-w-md">
              <Label htmlFor="visibility">
                Visibility <span className="text-red-500">*</span>
              </Label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as PromptVisibility)
                }
                className="w-full px-3 py-2 border rounded-md mt-2"
                required
              >
                <option value="PRIVATE">
                  Private - Only you can see this
                </option>
                <option value="PUBLIC">
                  Public - Everyone in the organization can see this
                </option>
                <option value="TEAM">
                  Team - Only team members can see this
                </option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tags..."
                  disabled={tags.length >= 10}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 10}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <TagBadge
                      key={tag}
                      tag={tag}
                      onRemove={() => handleRemoveTag(tag)}
                    />
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {tags.length}/10 tags
              </p>
            </div>
          </div>
        </Card>

        {/* Variables Section */}
        <PromptVariablesSection
          variables={variables}
          onChange={setVariables}
          promptContent={content}
        />

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving
              ? 'Saving...'
              : isEditing
              ? 'Update Prompt'
              : 'Create Prompt'}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
};

