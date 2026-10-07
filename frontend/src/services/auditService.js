import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';

export const logAuditEvent = (action, description, userId = 'SYSTEM', userName = 'System') => {
  try {
    const logs = getItem(STORAGE_KEYS.AUDIT_LOGS, []);
    const newLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      description,
      userId,
      userName,
      ipAddress: '127.0.0.1 (Local)',
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  } catch (e) {
    console.error('Audit logging failed:', e);
  }
};

export const auditService = {
  getLogs() {
    return getItem(STORAGE_KEYS.AUDIT_LOGS, []);
  },
  clearLogs() {
    setItem(STORAGE_KEYS.AUDIT_LOGS, []);
  }
};
