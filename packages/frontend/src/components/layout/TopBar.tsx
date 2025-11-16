import { UserMenu } from './UserMenu';
import { SearchDropdown } from '../features/SearchDropdown';
import { NewItemDropdown } from './NewItemDropdown';

export function TopBar() {
  return (
    <header className="h-14 bg-muted/40 flex items-center gap-4 pr-4">
      <div className="flex items-center gap-2 font-bold text-3xl leading-none px-10">
        <span title="The home to your favorite prompts.">AIZU</span>
      </div>

      <div className="flex-1 max-w-2xl mx-auto flex items-center gap-3">
        <SearchDropdown />
        <NewItemDropdown />
      </div>

      <UserMenu />
    </header>
  );
}

