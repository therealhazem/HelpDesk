import { STORAGE_KEYS } from '../data/constants';
import { initializeStorage } from '../data/seedData';

export function loadFromStorage(key, fallback) {
  try {
    initializeStorage();
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadTickets() {
  return loadFromStorage(STORAGE_KEYS.TICKETS, []);
}

export function saveTickets(tickets) {
  saveToStorage(STORAGE_KEYS.TICKETS, tickets);
}

export function loadVerificationRecords() {
  return loadFromStorage(STORAGE_KEYS.VERIFICATION, []);
}

export function saveVerificationRecords(records) {
  saveToStorage(STORAGE_KEYS.VERIFICATION, records);
}

export function loadSettings() {
  return loadFromStorage(STORAGE_KEYS.SETTINGS, { role: 'employee', theme: 'light' });
}

export function saveSettings(settings) {
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
}

export function loadSprint() {
  return loadFromStorage(STORAGE_KEYS.SPRINT, {
    id: 'sprint-1',
    name: 'Sprint 1',
    ticketIds: [],
  });
}

export function saveSprint(sprint) {
  saveToStorage(STORAGE_KEYS.SPRINT, sprint);
}

export function resetAllData() {
  localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  initializeStorage();
}
