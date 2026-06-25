import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Columns3,
  ListTodo,
  Rocket,
  Shield,
  Plus,
  ChevronLeft,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_LABELS } from '../../data/constants';
import { cn } from '../../utils/ticketHelpers';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['employee', 'agent', 'manager'] },
  { to: '/tickets', label: 'Tickets', icon: Ticket, roles: ['employee', 'agent', 'manager'] },
  { to: '/tickets/new', label: 'New Ticket', icon: Plus, roles: ['employee', 'agent', 'manager'] },
  { to: '/board', label: 'Kanban Board', icon: Columns3, roles: ['employee', 'agent', 'manager'] },
  { to: '/backlog', label: 'Backlog', icon: ListTodo, roles: ['agent', 'manager'] },
  { to: '/sprint', label: 'Sprint 1', icon: Rocket, roles: ['agent', 'manager'] },
  { to: '/governance', label: 'AI Governance', icon: Shield, roles: ['manager'] },
];

export function Sidebar({ collapsed, mobileOpen, onToggle }) {
  const { currentRole, setRole } = useApp();
  const navigate = useNavigate();

  const visibleNav = navItems.filter((item) => item.roles.includes(currentRole));

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setRole(role);
    navigate('/dashboard');
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900',
        collapsed ? 'w-[72px]' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Headphones size={18} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold">HelpDesk Lite</p>
            <p className="text-xs text-slate-500">Internal Support</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Demo Role</label>
          <select
            value={currentRole}
            onChange={handleRoleChange}
            className="input-field text-sm"
          >
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center border-t border-slate-200 text-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
