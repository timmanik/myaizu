// Prompt-related types

export enum Platform {
  CHATGPT = 'CHATGPT',
  CLAUDE = 'CLAUDE',
  GEMINI = 'GEMINI',
  COPILOT = 'COPILOT',
  MIDJOURNEY = 'MIDJOURNEY',
  STABLE_DIFFUSION = 'STABLE_DIFFUSION',
  OTHER = 'OTHER',
}

export enum PromptVisibility {
  PUBLIC = 'PUBLIC',
  TEAM = 'TEAM',
  PRIVATE = 'PRIVATE',
}

export enum PromptType {
  STANDARD_PROMPT = 'STANDARD_PROMPT',
  CUSTOM_GPT = 'CUSTOM_GPT',
  CLAUDE_PROJECT = 'CLAUDE_PROJECT',
  GEMINI_GEM = 'GEMINI_GEM',
  CUSTOM_APP = 'CUSTOM_APP',
  OTHER = 'OTHER',
}

export interface PromptConfig {
  useWebSearch: boolean;
  useDeepResearch: boolean;
}

export interface PromptVariable {
  name: string;
  description?: string;
  defaultValue?: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  variables?: PromptVariable[];
  platform: Platform;
  visibility: PromptVisibility;
  tags: string[];
  
  // Prompt type and configuration
  promptType: PromptType;
  additionalInstructions?: string;
  config: PromptConfig;
  
  // Ownership
  authorId: string;
  authorName?: string;
  teamId?: string;
  
  // Stats
  copyCount: number;
  favoriteCount: number;
  
  // User-specific data (if applicable)
  isFavorited?: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptDto {
  title: string;
  content: string;
  description?: string;
  variables?: PromptVariable[];
  platform: Platform;
  visibility: PromptVisibility;
  tags?: string[];
  teamId?: string;
  promptType: PromptType;
  additionalInstructions?: string;
  config: PromptConfig;
}

export interface UpdatePromptDto {
  title?: string;
  content?: string;
  description?: string;
  variables?: PromptVariable[];
  platform?: Platform;
  visibility?: PromptVisibility;
  tags?: string[];
  teamId?: string;
  promptType?: PromptType;
  additionalInstructions?: string;
  config?: PromptConfig;
}

export interface PromptFilters {
  platform?: Platform;
  visibility?: PromptVisibility;
  tags?: string[];
  authorId?: string;
  teamId?: string;
  search?: string;
  isFavorited?: boolean;
}

export interface PromptSort {
  field: 'createdAt' | 'updatedAt' | 'title' | 'favoriteCount' | 'copyCount';
  order: 'asc' | 'desc';
}

export interface PromptListResponse {
  prompts: Prompt[];
  total: number;
  page: number;
  limit: number;
}

