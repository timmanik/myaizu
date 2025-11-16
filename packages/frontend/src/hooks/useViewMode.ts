import { useState, useCallback } from 'react';

export type ViewMode = 'grid' | 'list';

export const useViewMode = (defaultMode: ViewMode = 'grid') => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  }, []);

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    isGrid: viewMode === 'grid',
    isList: viewMode === 'list',
  };
};

