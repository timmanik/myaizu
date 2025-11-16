// Suggested tags for prompts

export const SUGGESTED_TAGS = [
  // General categories
  'Writing',
  'Coding',
  'Analysis',
  'Creative',
  'Research',
  'Translation',
  'Summarization',
  'Brainstorming',
  
  // Technical
  'Debugging',
  'Code Review',
  'Documentation',
  'Testing',
  'Architecture',
  'API',
  'Frontend',
  'Backend',
  'DevOps',
  
  // Content creation
  'Blog Post',
  'Social Media',
  'Marketing',
  'Email',
  'Script',
  'Story',
  'Poetry',
  'Technical Writing',
  
  // Professional
  'Business',
  'Strategy',
  'Planning',
  'Presentation',
  'Report',
  'Proposal',
  'Meeting',
  
  // Data & AI
  'Data Analysis',
  'Machine Learning',
  'SQL',
  'Visualization',
  'AI Training',
  
  // Design & Art
  'Image Generation',
  'Logo Design',
  'UI Design',
  'Art Direction',
  'Character Design',
  'Illustration',
  
  // Education
  'Tutorial',
  'Explanation',
  'Learning',
  'Teaching',
  'Quiz',
  'Study Guide',
  
  // Productivity
  'Task Management',
  'Time Management',
  'Organization',
  'Automation',
  'Workflow',
  
  // Communication
  'Customer Service',
  'Feedback',
  'Interview',
  'Collaboration',
  'Negotiation',
] as const;

export type SuggestedTag = typeof SUGGESTED_TAGS[number];

// Tag colors for display
export const TAG_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-300',
  'bg-green-100 text-green-800 border-green-300',
  'bg-yellow-100 text-yellow-800 border-yellow-300',
  'bg-red-100 text-red-800 border-red-300',
  'bg-purple-100 text-purple-800 border-purple-300',
  'bg-pink-100 text-pink-800 border-pink-300',
  'bg-indigo-100 text-indigo-800 border-indigo-300',
  'bg-teal-100 text-teal-800 border-teal-300',
];

// Get consistent color for a tag based on hash
export const getTagColor = (tag: string): string => {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
};

