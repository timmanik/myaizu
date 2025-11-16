import type { Platform, PromptVisibility } from '@aizu/shared';
import { PLATFORMS, PLATFORM_LABELS } from '@aizu/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface SortOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  platform?: Platform;
  onPlatformChange?: (value: Platform | undefined) => void;
  visibility?: PromptVisibility;
  onVisibilityChange?: (value: PromptVisibility | undefined) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
  sortOptions?: SortOption[];
}

const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'title', label: 'Title' },
  { value: 'favoriteCount', label: 'Favorites' },
  { value: 'copyCount', label: 'Copies' },
];

export const FilterBar = ({
  search = '',
  onSearchChange,
  platform,
  onPlatformChange,
  visibility,
  onVisibilityChange,
  viewMode = 'grid',
  onViewModeChange,
  sortField = 'createdAt',
  sortOrder = 'desc',
  onSortChange,
  sortOptions = DEFAULT_SORT_OPTIONS,
}: FilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      {/* Top row: Search and View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>

        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange?.('grid')}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange?.('list')}
            className="rounded-l-none border-l"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-gray-50">
          {/* Platform Filter - only show if handler is provided */}
          {onPlatformChange && (
            <div className="w-full md:w-[280px]">
              <label className="text-sm font-medium mb-2 block">Platform</label>
              <select
                value={platform || ''}
                onChange={(e) =>
                  onPlatformChange?.(e.target.value ? (e.target.value as Platform) : undefined)
                }
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Platforms</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Visibility Filter */}
          <div className="w-full md:w-[280px]">
            <label className="text-sm font-medium mb-2 block">Visibility</label>
            <select
              value={visibility || ''}
              onChange={(e) =>
                onVisibilityChange?.(
                  e.target.value ? (e.target.value as PromptVisibility) : undefined
                )
              }
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">All Visibility</option>
              <option value="PUBLIC">Public</option>
              <option value="TEAM">Team</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          {/* Sort */}
          <div className="w-full md:w-[280px]">
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <div className="flex gap-2">
              <select
                value={sortField}
                onChange={(e) => onSortChange?.(e.target.value, sortOrder)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onSortChange?.(sortField, sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

