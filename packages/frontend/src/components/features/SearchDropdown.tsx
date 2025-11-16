import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Folder, Users, User } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useSearch } from '../../hooks/useSearch';
import { PlatformBadge } from '../shared/PlatformBadge';
import { VisibilityBadge } from '../shared/VisibilityBadge';

type TabType = 'all' | 'prompts' | 'collections' | 'teams' | 'users';

export function SearchDropdown() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isLoading } = useSearch(debouncedQuery, isOpen && query.length >= 2);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
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

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search prompts, collections, teams, users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full h-10 pl-10 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.length >= 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-[600px] flex flex-col z-50">
          {query.length < 2 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search
            </div>
          ) : (
            <>
              {/* Tabs */}
              {showResults && (
                <div className="border-b">
                  <div className="flex gap-1 px-2 pt-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const count = getTabCount(tab.id);
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t border-b-2 transition-colors ${
                            activeTab === tab.id
                              ? 'border-primary text-foreground bg-muted/50'
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                          }`}
                        >
                          <Icon className="h-3 w-3" />
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
              <div className="flex-1 overflow-y-auto p-3 max-h-[500px]">
                {isLoading && (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    Searching...
                  </div>
                )}

                {!isLoading && !showResults && debouncedQuery.length >= 2 && (
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-muted-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try a different search term
                    </p>
                  </div>
                )}

                {!isLoading && showResults && !hasResults && (
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-muted-foreground">No results found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No results found for "{debouncedQuery}"
                    </p>
                  </div>
                )}

                {!isLoading && showResults && hasResults && (
                  <div className="space-y-4">
                    {/* Prompts */}
                    {(activeTab === 'all' || activeTab === 'prompts') &&
                      results.prompts.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold mb-2 flex items-center gap-2 px-2 text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            Prompts
                            <span>({results.prompts.length})</span>
                          </h3>
                          <div className="space-y-1">
                            {results.prompts.map((prompt) => (
                              <button
                                key={prompt.id}
                                onClick={() => handleNavigate(`/prompts/${prompt.id}`)}
                                className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium truncate">{prompt.title}</h4>
                                    {prompt.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                        {prompt.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <PlatformBadge platform={prompt.platform} />
                                      <VisibilityBadge visibility={prompt.visibility} />
                                      <span className="text-xs text-muted-foreground">
                                        by {prompt.authorName}
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
                          <h3 className="text-xs font-semibold mb-2 flex items-center gap-2 px-2 text-muted-foreground">
                            <Folder className="h-3 w-3" />
                            Collections
                            <span>({results.collections.length})</span>
                          </h3>
                          <div className="space-y-1">
                            {results.collections.map((collection) => (
                              <button
                                key={collection.id}
                                onClick={() => handleNavigate(`/collections/${collection.id}`)}
                                className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
                              >
                                <h4 className="text-sm font-medium">{collection.name}</h4>
                                {collection.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                    {collection.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span>{collection.promptCount} prompts</span>
                                  <span>•</span>
                                  <span>by {collection.ownerName}</span>
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
                          <h3 className="text-xs font-semibold mb-2 flex items-center gap-2 px-2 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            Teams
                            <span>({results.teams.length})</span>
                          </h3>
                          <div className="space-y-1">
                            {results.teams.map((team) => (
                              <button
                                key={team.id}
                                onClick={() => handleNavigate(`/teams/${team.id}`)}
                                className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
                              >
                                <h4 className="text-sm font-medium">{team.name}</h4>
                                {team.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                    {team.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span>{team.memberCount} members</span>
                                  <span>•</span>
                                  <span>{team.promptCount} prompts</span>
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
                          <h3 className="text-xs font-semibold mb-2 flex items-center gap-2 px-2 text-muted-foreground">
                            <User className="h-3 w-3" />
                            Users
                            <span>({results.users.length})</span>
                          </h3>
                          <div className="space-y-1">
                            {results.users.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => handleNavigate(`/profile/${user.id}`)}
                                className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    {user.avatarUrl ? (
                                      <img
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        className="h-full w-full rounded-full object-cover"
                                      />
                                    ) : (
                                      <User className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium truncate">{user.name}</h4>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
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

              {/* Footer hint */}
              {showResults && (
                <div className="border-t px-3 py-2 bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    Press ESC to close • Click outside to dismiss
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

