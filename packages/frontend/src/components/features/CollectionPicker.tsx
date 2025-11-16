import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { collectionsApi } from '@/services/api/collections';
import type { Collection } from '@aizu/shared';
import { Input } from '@/components/ui/input';

interface CollectionPickerProps {
  onSelect: (collectionId: string) => void;
  onCreateNew?: () => void;
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
}

export const CollectionPicker = ({
  onSelect,
  onCreateNew,
  isOpen,
  onClose,
  position = 'right',
}: CollectionPickerProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentCollections, setRecentCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const pickerRef = useRef<HTMLDivElement>(null);

  // Fetch recent collections on mount
  useEffect(() => {
    if (isOpen) {
      fetchRecentCollections();
    }
  }, [isOpen]);

  // Fetch collections based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchCollections(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setCollections([]);
    }
  }, [searchQuery]);

  const fetchRecentCollections = async () => {
    try {
      setIsLoading(true);
      const allCollections = await collectionsApi.getCollections({
        sortField: 'updatedAt',
        sortOrder: 'desc',
      });
      // Get only user's own collections (where they are the owner)
      const userCollections = allCollections.filter((c) => c.owner);
      setRecentCollections(userCollections.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch recent collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchCollections = async (query: string) => {
    try {
      setIsLoading(true);
      const results = await collectionsApi.getCollections({
        search: query,
        sortField: 'name',
        sortOrder: 'asc',
      });
      // Filter to only user's own collections
      const userCollections = results.filter((c) => c.owner);
      setCollections(userCollections);
    } catch (error) {
      console.error('Failed to search collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCollection = async (collectionId: string) => {
    // Optimistically update UI
    setSelectedCollections((prev) => new Set(prev).add(collectionId));
    
    try {
      await onSelect(collectionId);
    } catch (error) {
      // Remove checkmark on error
      setSelectedCollections((prev) => {
        const next = new Set(prev);
        next.delete(collectionId);
        return next;
      });
      console.error('Failed to add to collection:', error);
    }
  };

  const displayCollections = searchQuery.trim() ? collections : recentCollections;

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      data-collection-picker
      className={`absolute top-0 ${
        position === 'right' ? 'left-full ml-1' : 'right-full mr-1'
      } w-64 bg-white border rounded-md shadow-lg z-20 py-2`}
    >
      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Find a collection"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
            autoFocus
          />
        </div>
      </div>

      {/* Create New Collection Button */}
      {onCreateNew && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateNew();
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">New collection</span>
          </button>
          <div className="border-t my-2" />
        </>
      )}

      {/* Collections List */}
      <div className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
        ) : displayCollections.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500">
            {searchQuery.trim() ? 'No collections found' : 'No recent collections'}
          </div>
        ) : (
          displayCollections.map((collection) => (
            <button
              key={collection.id}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectCollection(collection.id);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between group"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{collection.name}</div>
                {collection._count && (
                  <div className="text-xs text-gray-500">
                    {collection._count.collectionPrompts} prompts
                  </div>
                )}
              </div>
              {selectedCollections.has(collection.id) && (
                <Check className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Helper text */}
      {!searchQuery.trim() && recentCollections.length > 0 && (
        <div className="px-3 pt-2 border-t mt-2">
          <div className="text-xs text-gray-500">Recently updated collections</div>
        </div>
      )}
    </div>
  );
};
