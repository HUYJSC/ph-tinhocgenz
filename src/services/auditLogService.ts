/**
 * Audit Log Service — TINHOCGENZ LMS
 * Persists security-critical and operational audit trail records.
 */

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName?: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

const AUDIT_LOG_STORAGE_KEY = 'tinhocgenz_audit_trail_v1';

export const AuditLogService = {
  getLogs(): AuditLogEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  log(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    if (typeof window !== 'undefined') {
      try {
        const existing = this.getLogs();
        const updated = [fullEntry, ...existing].slice(0, 500); // retain last 500 records
        localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    return fullEntry;
  },

  clearLogs(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(AUDIT_LOG_STORAGE_KEY);
      } catch {}
    }
  }
};
