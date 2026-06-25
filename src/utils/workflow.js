const TRANSITIONS = {
  New: ['Assigned'],
  Assigned: ['In Progress', 'Blocked'],
  'In Progress': ['Resolved', 'Blocked', 'Waiting For Requester'],
  Blocked: ['Assigned', 'In Progress'],
  'Waiting For Requester': ['In Progress'],
  Resolved: ['Closed'],
  Closed: [],
};

export function canTransition(fromStatus, toStatus) {
  if (fromStatus === toStatus) return true;
  const allowed = TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

export function getTransitionError(fromStatus, toStatus) {
  if (fromStatus === toStatus) return null;
  if (!canTransition(fromStatus, toStatus)) {
    return `Cannot move from "${fromStatus}" to "${toStatus}".`;
  }
  return null;
}

export function isOpenStatus(status) {
  return !['Resolved', 'Closed'].includes(status);
}

export function isTerminalStatus(status) {
  return status === 'Closed';
}

export function statusRequiresAssignee(status) {
  return ['Assigned', 'In Progress', 'Blocked', 'Waiting For Requester', 'Resolved', 'Closed'].includes(
    status
  );
}

export function statusRequiresResolution(status) {
  return status === 'Resolved' || status === 'Closed';
}
