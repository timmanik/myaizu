// Platform constants

import { Platform } from '../types/prompt';

export const PLATFORM_LABELS: Record<Platform, string> = {
  [Platform.CHATGPT]: 'ChatGPT',
  [Platform.CLAUDE]: 'Claude',
  [Platform.GEMINI]: 'Gemini',
  [Platform.COPILOT]: 'GitHub Copilot',
  [Platform.MIDJOURNEY]: 'Midjourney',
  [Platform.STABLE_DIFFUSION]: 'Stable Diffusion',
  [Platform.OTHER]: 'Other',
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  [Platform.CHATGPT]: 'bg-green-100 text-green-800 border-green-300',
  [Platform.CLAUDE]: 'bg-purple-100 text-purple-800 border-purple-300',
  [Platform.GEMINI]: 'bg-blue-100 text-blue-800 border-blue-300',
  [Platform.COPILOT]: 'bg-gray-100 text-gray-800 border-gray-300',
  [Platform.MIDJOURNEY]: 'bg-pink-100 text-pink-800 border-pink-300',
  [Platform.STABLE_DIFFUSION]: 'bg-orange-100 text-orange-800 border-orange-300',
  [Platform.OTHER]: 'bg-slate-100 text-slate-800 border-slate-300',
};

export const PLATFORMS = Object.values(Platform);

