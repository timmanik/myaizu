// Prompt type constants

import { PromptType } from '../types/prompt';

export const PROMPT_TYPE_LABELS: Record<PromptType, string> = {
  [PromptType.STANDARD_PROMPT]: 'Standard Prompt',
  [PromptType.CUSTOM_GPT]: 'Custom GPT',
  [PromptType.CLAUDE_PROJECT]: 'Claude Project',
  [PromptType.GEMINI_GEM]: 'Gemini Gem',
  [PromptType.CUSTOM_APP]: 'Custom App',
  [PromptType.OTHER]: 'Other',
};

export const PROMPT_TYPES = Object.values(PromptType);

