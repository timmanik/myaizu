import { Search } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface NoSearchResultsProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const NoSearchResults = ({
  searchQuery,
  onClearSearch,
}: NoSearchResultsProps) => {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        searchQuery
          ? `No prompts match "${searchQuery}". Try adjusting your search or filters.`
          : 'No prompts match your current filters. Try adjusting your filters.'
      }
      actionLabel={onClearSearch ? 'Clear Search' : undefined}
      onAction={onClearSearch}
    />
  );
};

