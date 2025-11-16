import { useState, useRef, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useUserSearch } from '../../hooks/useUserSearch';
import type { SearchUser } from '../../services/api/search';
import { Input } from '../ui/input';
import { Avatar } from '../ui/avatar';
import { cn } from '../../lib/utils';

interface UserSearchInputProps {
  value: SearchUser | null;
  onSelect: (user: SearchUser | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  excludeUserIds?: string[];
}

export function UserSearchInput({
  value,
  onSelect,
  placeholder = 'Search by name or email...',
  disabled = false,
  className,
  excludeUserIds = [],
}: UserSearchInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { data: users, isLoading } = useUserSearch(debouncedQuery, isOpen && !value);

  // Filter out excluded users
  const filteredUsers = users?.filter((user) => !excludeUserIds.includes(user.id)) || [];

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredUsers.length]);

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

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredUsers.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredUsers.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredUsers[highlightedIndex]) {
          handleSelectUser(filteredUsers[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectUser = (user: SearchUser) => {
    onSelect(user);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (!value && query.length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        {value ? (
          // Selected User Display
          <div className="flex items-center gap-3 px-3 py-2 border rounded-md bg-background">
            <Avatar className="h-8 w-8">
              {value.avatarUrl ? (
                <img src={value.avatarUrl} alt={value.name} className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{value.name}</p>
              <p className="text-xs text-muted-foreground truncate">{value.email}</p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          // Search Input
          <>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="pl-9"
            />
          </>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && !value && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-[300px] overflow-y-auto z-50">
          {query.length < 2 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search
            </div>
          ) : isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center">
              <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredUsers.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                    highlightedIndex === index
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  )}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

