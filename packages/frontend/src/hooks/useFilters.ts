import { useState, useCallback } from 'react';
import type { Platform, PromptVisibility, PromptFilters } from '@aizu/shared';

export const useFilters = () => {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState<Platform | undefined>();
  const [visibility, setVisibility] = useState<PromptVisibility | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  const filters: PromptFilters = {
    search: search || undefined,
    platform,
    visibility,
    tags: tags.length > 0 ? tags : undefined,
    isFavorited: isFavorited || undefined,
  };

  const clearFilters = useCallback(() => {
    setSearch('');
    setPlatform(undefined);
    setVisibility(undefined);
    setTags([]);
    setIsFavorited(false);
  }, []);

  return {
    search,
    setSearch,
    platform,
    setPlatform,
    visibility,
    setVisibility,
    tags,
    setTags,
    isFavorited,
    setIsFavorited,
    filters,
    clearFilters,
  };
};

