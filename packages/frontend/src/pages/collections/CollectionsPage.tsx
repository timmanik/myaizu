import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useCollections } from '../../hooks/useCollections';
import { CreateCollectionModal } from '../../components/features/CreateCollectionModal';
import { FilterBar } from '../../components/features/FilterBar';
import { useViewMode } from '../../hooks/useViewMode';
import { useDebounce } from '../../hooks/useDebounce';
import { Layers, Plus } from 'lucide-react';
import type { CollectionVisibility } from '@aizu/shared';

const COLLECTION_SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'name', label: 'Name' },
];

export default function CollectionsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibility, setVisibility] = useState<CollectionVisibility | undefined>();
  const [sortField, setSortField] = useState<'createdAt' | 'updatedAt' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { viewMode, setViewMode } = useViewMode();

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: collections, isLoading } = useCollections({
    search: debouncedSearch || undefined,
    visibility,
    sortField,
    sortOrder,
  });

  const filteredCollections = collections || [];

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortField(field as 'createdAt' | 'updatedAt' | 'name');
    setSortOrder(order);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Collections"
        description="Organize your prompts into collections"
        icon={<Layers className="h-6 w-6" />}
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        }
      />

      <div className="space-y-6">
        <FilterBar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          visibility={visibility as any}
          onVisibilityChange={setVisibility as any}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          sortOptions={COLLECTION_SORT_OPTIONS}
        />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading collections...</div>
        </div>
        ) : filteredCollections.length === 0 && !debouncedSearch ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Layers className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first collection to organize your prompts
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground">No collections found matching your search</p>
        </div>
      ) : (
          <>
            {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <Card
              key={collection.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/collections/${collection.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Layers className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-semibold">{collection.name}</h3>
                </div>
              </div>
              {collection.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {collection.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {collection._count?.collectionPrompts || 0} prompt
                  {collection._count?.collectionPrompts !== 1 ? 's' : ''}
                </span>
                <span className="capitalize">{collection.visibility.toLowerCase()}</span>
              </div>
            </Card>
          ))}
        </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredCollections.map((collection) => (
                  <Card
                    key={collection.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/collections/${collection.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Layers className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{collection.name}</h3>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {collection.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>
                          {collection._count?.collectionPrompts || 0} prompt
                          {collection._count?.collectionPrompts !== 1 ? 's' : ''}
                        </span>
                        <span className="capitalize min-w-[80px] text-right">
                          {collection.visibility.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CreateCollectionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </PageContainer>
  );
}

