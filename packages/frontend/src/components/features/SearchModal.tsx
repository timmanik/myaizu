import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Folder, Users, User } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog';
import { useDebounce } from '../../hooks/useDebounce';
import { useSearch } from '../../hooks/useSearch';
import { Button } from '../ui/button';
import { PlatformBadge } from '../shared/PlatformBadge';
import { VisibilityBadge } from '../shared/VisibilityBadge';
import { EmptyState } from '../shared/EmptyState';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

type TabType = 'all' | 'prompts' | 'collections' | 'teams' | 'users';

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  const { data: results, isLoading } = useSearch(debouncedQuery, open);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveTab('all');
    }
  }, [open]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return (
      results.prompts.length +
      results.collections.length +
      results.teams.length +
      results.users.length
    );
  };

  const getTabCount = (tab: TabType) => {
    if (!results) return 0;
    switch (tab) {
      case 'all':
        return getTotalResults();
      case 'prompts':
        return results.prompts.length;
      case 'collections':
        return results.collections.length;
      case 'teams':
        return results.teams.length;
      case 'users':
        return results.users.length;
      default:
        return 0;
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'prompts', label: 'Prompts', icon: FileText },
    { id: 'collections', label: 'Collections', icon: Folder },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'users', label: 'Users', icon: User },
  ];

  const showResults = debouncedQuery.length >= 2 && results;
  const hasResults = getTotalResults() > 0;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] p-0 gap-0 flex flex-col">
        {/* Search Input */}
        <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                placeholder="Search prompts, collections, teams, users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-12 pl-10 pr-10 rounded-md border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          {showResults && (
            <div className="border-b">
              <div className="flex gap-1 px-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const count = getTabCount(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      {count > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted text-xs">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4">
            {!showResults && (
              <EmptyState
                icon={Search}
                title="Start Searching"
                description="Type at least 2 characters to search"
              />
            )}

            {showResults && isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Searching...
              </div>
            )}

            {showResults && !isLoading && !hasResults && (
              <EmptyState
                icon={Search}
                title="No Results Found"
                description={`No results found for "${debouncedQuery}"`}
              />
            )}

            {showResults && !isLoading && hasResults && (
              <div className="space-y-6">
                {/* Prompts */}
                {(activeTab === 'all' || activeTab === 'prompts') &&
                  results.prompts.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Prompts
                        <span className="text-muted-foreground">({results.prompts.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {results.prompts.map((prompt) => (
                          <button
                            key={prompt.id}
                            onClick={() => handleNavigate(`/prompts/${prompt.id}`)}
                            className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{prompt.title}</h4>
                                {prompt.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {prompt.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <PlatformBadge platform={prompt.platform} />
                                  <VisibilityBadge visibility={prompt.visibility} />
                                  <span className="text-xs text-muted-foreground">
                                    by{' '}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleNavigate(`/users/${prompt.authorId}`);
                                      }}
                                      className="cursor-pointer hover:underline inline text-left p-0 border-0 bg-transparent text-xs text-muted-foreground"
                                    >
                                      {prompt.authorName}
                                    </button>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Collections */}
                {(activeTab === 'all' || activeTab === 'collections') &&
                  results.collections.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        Collections
                        <span className="text-muted-foreground">
                          ({results.collections.length})
                        </span>
                      </h3>
                      <div className="space-y-2">
                        {results.collections.map((collection) => (
                          <button
                            key={collection.id}
                            onClick={() => handleNavigate(`/collections/${collection.id}`)}
                            className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <h4 className="font-medium">{collection.name}</h4>
                            {collection.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {collection.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {collection.promptCount} prompts
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                by{' '}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigate(`/users/${collection.ownerId}`);
                                  }}
                                  className="cursor-pointer hover:underline inline text-left p-0 border-0 bg-transparent text-xs text-muted-foreground"
                                >
                                  {collection.ownerName}
                                </button>
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Teams */}
                {(activeTab === 'all' || activeTab === 'teams') &&
                  results.teams.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Teams
                        <span className="text-muted-foreground">({results.teams.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {results.teams.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => handleNavigate(`/teams/${team.id}`)}
                            className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <h4 className="font-medium">{team.name}</h4>
                            {team.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {team.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {team.memberCount} members
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {team.promptCount} prompts
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Users */}
                {(activeTab === 'all' || activeTab === 'users') &&
                  results.users.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Users
                        <span className="text-muted-foreground">({results.users.length})</span>
                      </h3>
                      <div className="space-y-2">
                        {results.users.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleNavigate(`/users/${user.id}`)}
                            className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="h-full w-full rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{user.name}</h4>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Press ESC to close</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

