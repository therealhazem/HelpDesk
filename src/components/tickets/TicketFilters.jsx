import { CATEGORIES, PRIORITIES, STATUSES, READINESS } from '../../data/constants';
import { Select, Input } from '../ui/Card';

export function TicketFilters({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="card flex flex-wrap gap-3 p-4">
      <div className="min-w-[200px] flex-1">
        <Input
          placeholder="Search ID, title, assignee..."
          value={filters.search || ''}
          onChange={(e) => update('search', e.target.value)}
        />
      </div>
      <Select
        value={filters.status || 'all'}
        onChange={(e) => update('status', e.target.value)}
        options={[{ value: 'all', label: 'All Statuses' }, ...STATUSES.map((s) => ({ value: s, label: s }))]}
        className="w-40"
      />
      <Select
        value={filters.priority || 'all'}
        onChange={(e) => update('priority', e.target.value)}
        options={[{ value: 'all', label: 'All Priorities' }, ...PRIORITIES.map((p) => ({ value: p, label: p }))]}
        className="w-40"
      />
      <Select
        value={filters.category || 'all'}
        onChange={(e) => update('category', e.target.value)}
        options={[{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
        className="w-40"
      />
      <Select
        value={filters.readiness || 'all'}
        onChange={(e) => update('readiness', e.target.value)}
        options={[{ value: 'all', label: 'All Readiness' }, ...READINESS.map((r) => ({ value: r, label: r }))]}
        className="w-40"
      />
      <Select
        value={filters.blocked || 'all'}
        onChange={(e) => update('blocked', e.target.value)}
        options={[
          { value: 'all', label: 'Blocked: All' },
          { value: 'yes', label: 'Blocked Only' },
          { value: 'no', label: 'Not Blocked' },
        ]}
        className="w-36"
      />
    </div>
  );
}

export const defaultFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  category: 'all',
  readiness: 'all',
  blocked: 'all',
};
