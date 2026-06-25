import { STORAGE_KEYS } from './constants';

const now = () => new Date().toISOString();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function createSeedTickets() {
  return [
    {
      id: 'HD-2025-000001',
      title: 'VPN connection failing on remote login',
      description:
        'Unable to connect to corporate VPN since Monday morning. Error code 619 appears after authentication.',
      category: 'Network',
      priority: 'High',
      status: 'In Progress',
      readiness: 'Ready',
      requester: 'Alex Employee',
      assignee: 'Sam Agent',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
      isBlocked: false,
      blockerReason: '',
      statusBeforeBlock: null,
      resolutionNotes: '',
      inSprint: true,
      comments: [
        {
          id: 'c1',
          author: 'Sam Agent',
          type: 'public',
          content: 'Please try restarting the VPN client and clearing cached credentials.',
          createdAt: daysAgo(4),
        },
        {
          id: 'c2',
          author: 'Sam Agent',
          type: 'internal',
          content: 'Checked firewall logs — likely certificate expiry on user device.',
          createdAt: daysAgo(3),
        },
      ],
      history: [
        { id: 'h1', action: 'Created', actor: 'Alex Employee', metadata: {}, createdAt: daysAgo(5) },
        {
          id: 'h2',
          action: 'Assigned',
          actor: 'Morgan Manager',
          metadata: { assignee: 'Sam Agent' },
          createdAt: daysAgo(4),
        },
        {
          id: 'h3',
          action: 'Status Changed',
          actor: 'Sam Agent',
          metadata: { from: 'Assigned', to: 'In Progress' },
          createdAt: daysAgo(3),
        },
      ],
    },
    {
      id: 'HD-2025-000002',
      title: 'Request new laptop for design team',
      description: 'Current laptop is 5 years old and cannot run Figma smoothly.',
      category: 'Hardware',
      priority: 'Medium',
      status: 'Assigned',
      readiness: 'Partial',
      requester: 'Alex Employee',
      assignee: 'Jordan Agent',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2),
      isBlocked: false,
      blockerReason: '',
      statusBeforeBlock: null,
      resolutionNotes: '',
      inSprint: false,
      comments: [],
      history: [
        { id: 'h4', action: 'Created', actor: 'Alex Employee', metadata: {}, createdAt: daysAgo(3) },
        {
          id: 'h5',
          action: 'Assigned',
          actor: 'Morgan Manager',
          metadata: { assignee: 'Jordan Agent' },
          createdAt: daysAgo(2),
        },
      ],
    },
    {
      id: 'HD-2025-000003',
      title: 'Payroll portal access denied',
      description: 'Getting 403 error when accessing payroll portal after role change.',
      category: 'HR',
      priority: 'Critical',
      status: 'Blocked',
      readiness: 'Blocked',
      requester: 'Alex Employee',
      assignee: 'Sam Agent',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(0),
      isBlocked: true,
      blockerReason: 'Waiting for HR system admin to restore permissions',
      statusBeforeBlock: 'In Progress',
      resolutionNotes: '',
      inSprint: true,
      comments: [
        {
          id: 'c3',
          author: 'Sam Agent',
          type: 'public',
          content: 'Escalated to HR IT. Will update once permissions are restored.',
          createdAt: daysAgo(1),
        },
      ],
      history: [
        { id: 'h6', action: 'Created', actor: 'Alex Employee', metadata: {}, createdAt: daysAgo(2) },
        {
          id: 'h7',
          action: 'Assigned',
          actor: 'Sam Agent',
          metadata: { assignee: 'Sam Agent' },
          createdAt: daysAgo(2),
        },
        {
          id: 'h8',
          action: 'Status Changed',
          actor: 'Sam Agent',
          metadata: { from: 'Assigned', to: 'In Progress' },
          createdAt: daysAgo(1),
        },
        {
          id: 'h9',
          action: 'Blocked',
          actor: 'Sam Agent',
          metadata: { reason: 'Waiting for HR system admin to restore permissions' },
          createdAt: daysAgo(0),
        },
      ],
    },
    {
      id: 'HD-2025-000004',
      title: 'Office AC not working — Floor 3',
      description: 'Temperature above 28°C in open workspace area.',
      category: 'Facilities',
      priority: 'High',
      status: 'New',
      readiness: 'Not Ready',
      requester: 'Alex Employee',
      assignee: '',
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0),
      isBlocked: false,
      blockerReason: '',
      statusBeforeBlock: null,
      resolutionNotes: '',
      inSprint: false,
      comments: [],
      history: [
        { id: 'h10', action: 'Created', actor: 'Alex Employee', metadata: {}, createdAt: daysAgo(0) },
      ],
    },
    {
      id: 'HD-2025-000005',
      title: 'Slack integration webhook failing',
      description: 'Alert webhooks stopped firing for deployment notifications.',
      category: 'Software',
      priority: 'Medium',
      status: 'Resolved',
      readiness: 'Ready',
      requester: 'Alex Employee',
      assignee: 'Taylor Agent',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(7),
      isBlocked: false,
      blockerReason: '',
      statusBeforeBlock: null,
      resolutionNotes: 'Regenerated webhook secret and updated CI pipeline configuration.',
      inSprint: false,
      comments: [],
      history: [
        { id: 'h11', action: 'Created', actor: 'Alex Employee', metadata: {}, createdAt: daysAgo(10) },
        {
          id: 'h12',
          action: 'Resolved',
          actor: 'Taylor Agent',
          metadata: { summary: 'Regenerated webhook secret and updated CI pipeline configuration.' },
          createdAt: daysAgo(7),
        },
      ],
    },
    {
      id: 'HD-2025-000006',
      title: 'Email sync issues on mobile',
      description: 'Corporate email not syncing on iOS since last update.',
      category: 'IT Support',
      priority: 'Low',
      status: 'Closed',
      readiness: 'Ready',
      requester: 'Alex Employee',
      assignee: 'Jordan Agent',
      createdAt: daysAgo(20),
      updatedAt: daysAgo(15),
      isBlocked: false,
      blockerReason: '',
      statusBeforeBlock: null,
      resolutionNotes: 'Reconfigured Exchange profile on device.',
      inSprint: false,
      comments: [],
      history: [
        { id: 'h13', action: 'Created', actor: 'Alex Employee', metadata: {}, createdAt: daysAgo(20) },
        {
          id: 'h14',
          action: 'Closed',
          actor: 'Jordan Agent',
          metadata: {},
          createdAt: daysAgo(15),
        },
      ],
    },
  ];
}

export function createSeedVerificationRecords() {
  return [
    {
      id: 'vr-001',
      featureName: 'AI Email Classifier v2',
      reviewStatus: 'Needs Revision',
      verificationStatus: 'Pending',
      reviewer: 'Morgan Manager',
      notes: 'Pending load test results before production rollout.',
      date: daysAgo(2),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(2),
    },
    {
      id: 'vr-002',
      featureName: 'Smart Ticket Routing Assistant',
      reviewStatus: 'Accepted',
      verificationStatus: 'Verified',
      reviewer: 'Morgan Manager',
      notes: 'All integration tests passed. Documentation complete.',
      date: daysAgo(10),
      createdAt: daysAgo(14),
      updatedAt: daysAgo(10),
    },
    {
      id: 'vr-003',
      featureName: 'Auto-Reply Sentiment Engine',
      reviewStatus: 'Rejected',
      verificationStatus: 'Failed',
      reviewer: 'Morgan Manager',
      notes: 'High false-positive rate in pilot. Rolled back from staging.',
      date: daysAgo(3),
      createdAt: daysAgo(8),
      updatedAt: daysAgo(3),
    },
  ];
}

export function getDefaultSettings() {
  return {
    role: 'employee',
    theme: 'light',
  };
}

export function initializeStorage() {
  if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    return;
  }

  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(createSeedTickets()));
  localStorage.setItem(
    STORAGE_KEYS.VERIFICATION,
    JSON.stringify(createSeedVerificationRecords())
  );
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(getDefaultSettings()));
  localStorage.setItem(
    STORAGE_KEYS.SPRINT,
    JSON.stringify({ id: 'sprint-1', name: 'Sprint 1', ticketIds: ['HD-2025-000001', 'HD-2025-000003'] })
  );
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

export { now };
