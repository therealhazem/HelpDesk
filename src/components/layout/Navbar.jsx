import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, Menu, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_LABELS } from '../../data/constants';
import { useDebounce } from '../../hooks/useLocalStorage';

export function Navbar({ onMenuClick, sidebarCollapsed, onSearch }) {
  const { currentUser, currentRole, settings, toggleTheme } = useApp();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(debouncedSearch);
    navigate(`/tickets?search=${encodeURIComponent(debouncedSearch)}`);
  };

  return (
    <header
      className={`sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 lg:px-6 ${
        sidebarCollapsed ? 'lg:pl-[88px]' : 'lg:pl-[272px]'
      }`}
    >
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
      >
        <Menu size={20} />
      </button>

      <form onSubmit={handleSearchSubmit} className="relative hidden flex-1 md:block md:max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search tickets by ID, title, assignee..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (onSearch) onSearch(e.target.value);
          }}
          className="input-field pl-9"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Toggle theme"
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell size={18} />
        </button>

        <div className="hidden items-center gap-3 rounded-lg border border-slate-200 px-3 py-1.5 sm:flex dark:border-slate-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            {currentUser.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium leading-none">{currentUser}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[currentRole]}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
