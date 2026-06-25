export const ROLES = {
  EMPLOYEE: 'employee',
  AGENT: 'agent',
  MANAGER: 'manager',
};

export const ROLE_LABELS = {
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.AGENT]: 'Support Agent',
  [ROLES.MANAGER]: 'Manager',
};

export const ROLE_USERS = {
  [ROLES.EMPLOYEE]: 'Alex Employee',
  [ROLES.AGENT]: 'Sam Agent',
  [ROLES.MANAGER]: 'Morgan Manager',
};

export const AGENTS = ['Sam Agent', 'Jordan Agent', 'Taylor Agent'];

export const CATEGORIES = [
  'IT Support',
  'Hardware',
  'Software',
  'Network',
  'HR',
  'Facilities',
  'Other',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const STATUSES = [
  'New',
  'Assigned',
  'In Progress',
  'Blocked',
  'Waiting For Requester',
  'Resolved',
  'Closed',
];

export const READINESS = ['Ready', 'Partial', 'Blocked', 'Not Ready'];

export const REVIEW_STATUSES = [
  'Accepted',
  'Needs Revision',
  'Rejected',
  'Rolled Back',
];

export const VERIFICATION_STATUSES = ['Pending', 'Verified', 'Failed'];

export const HISTORY_ACTIONS = {
  CREATED: 'Created',
  ASSIGNED: 'Assigned',
  REASSIGNED: 'Reassigned',
  STATUS_CHANGED: 'Status Changed',
  PRIORITY_CHANGED: 'Priority Changed',
  BLOCKED: 'Blocked',
  UNBLOCKED: 'Unblocked',
  COMMENT_ADDED: 'Comment Added',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  UPDATED: 'Updated',
  READINESS_CHANGED: 'Readiness Changed',
  DELETED: 'Deleted',
};

export const STORAGE_KEYS = {
  TICKETS: 'helpdesk_lite_tickets',
  VERIFICATION: 'helpdesk_lite_verification',
  SETTINGS: 'helpdesk_lite_settings',
  SPRINT: 'helpdesk_lite_sprint',
  INITIALIZED: 'helpdesk_lite_initialized',
};

export const SPRINT_ID = 'sprint-1';
export const SPRINT_NAME = 'Sprint 1';

export const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export const READINESS_COLORS = {
  Ready: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Partial: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Blocked: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  'Not Ready': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const PRIORITY_COLORS = {
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 ring-2 ring-red-500/50',
};

export const STATUS_COLORS = {
  New: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  Assigned: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  'In Progress': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  Blocked: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  'Waiting For Requester': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export const REVIEW_STATUS_COLORS = {
  Accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Needs Revision': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  'Rolled Back': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
};
