/**
 * DỊCH VỤ SAO LƯU, KHÔI PHỤC & GIÁM SÁT DỮ LIỆU TOÀN DIỆN
 * Chuẩn Hệ Thống Vận Hành Thật (Production Enterprise Real-World Grade)
 * PH DIGITAL EDUCATION — TIN HỌC GEN Z
 */

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'BACKUP_EXPORT' | 'BACKUP_RESTORE' | 'SYNC';
  targetEntity: 'QUIZ' | 'QUESTION' | 'STUDENT' | 'TEACHER' | 'SCHEDULE' | 'RESOURCE' | 'SYSTEM';
  description: string;
  actor: string;
}

export interface SystemStorageMetrics {
  totalBytesUsed: number;
  formattedSize: string;
  quotaBytes: number;
  percentageUsed: number;
  totalStudents: number;
  totalTeachers: number;
  totalQuizzes: number;
  totalQuestions: number;
  totalSchedules: number;
  totalResources: number;
  lastBackupAt: string | null;
  lastSyncAt: string;
  persistenceHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface SystemBackupPayload {
  version: string;
  exportedAt: string;
  exportedBy: string;
  appName: string;
  checksum: string;
  data: {
    studentAccounts: any[];
    teacherAccounts: any[];
    customQuizzes: any[];
    quizOverrides: Record<string, any>;
    deletedQuizIds: string[];
    schedules: any[];
    assignments: any[];
    submissions: any[];
    googleDriveConfig: any;
    learningSources: any[];
    learningResources: any[];
    internalMaterials: any[];
    auditLogs: SystemAuditLog[];
  };
}

const STORAGE_KEYS = {
  STUDENTS: 'phtinhocgenz_student_accounts_v1',
  TEACHERS: 'phtinhocgenz_teacher_accounts_v1',
  CUSTOM_QUIZZES: 'phtinhocgenz_custom_quizzes_v2',
  QUIZ_OVERRIDES: 'phtinhocgenz_quiz_overrides_v1',
  DELETED_QUIZZES: 'phtinhocgenz_deleted_quizzes_v1',
  SCHEDULES: 'phtinhocgenz_admin_schedules_v1',
  ASSIGNMENTS: 'phtinhocgenz_assignments_v1',
  SUBMISSIONS: 'phtinhocgenz_submissions_v1',
  GDRIVE: 'phtinhocgenz_gdrive_config_v1',
  LEARNING_SOURCES: 'phtinhocgenz_learning_sources_v1',
  LEARNING_RESOURCES: 'phtinhocgenz_learning_resources_v1',
  INTERNAL_MATERIALS: 'phtinhocgenz_internal_materials_v1',
  AUDIT_LOGS: 'phtinhocgenz_admin_audit_logs_v1',
  LAST_BACKUP: 'phtinhocgenz_last_backup_timestamp_v1'
};

// Cross-tab broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('phtinhocgenz_sync_channel');
  } catch (e) {
    console.warn('BroadcastChannel not supported or restricted', e);
  }
}

export class SystemBackupService {
  /**
   * Tính toán chỉ số dung lượng & sức khỏe lưu trữ hệ thống
   */
  static getStorageMetrics(): SystemStorageMetrics {
    if (typeof window === 'undefined') {
      return {
        totalBytesUsed: 0,
        formattedSize: '0 KB',
        quotaBytes: 5 * 1024 * 1024,
        percentageUsed: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalQuizzes: 0,
        totalQuestions: 0,
        totalSchedules: 0,
        totalResources: 0,
        lastBackupAt: null,
        lastSyncAt: new Date().toISOString(),
        persistenceHealth: 'HEALTHY'
      };
    }

    let totalBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2; // UTF-16 approx
        }
      }
    } catch (e) {
      console.error('Error calculating storage size', e);
    }

    const quotaBytes = 5 * 1024 * 1024; // Standard 5MB limit
    const percentageUsed = Math.min(100, Math.round((totalBytes / quotaBytes) * 100));

    // Entity counts
    const getSafeArray = (key: string) => {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : [];
      } catch {
        return [];
      }
    };

    const students = getSafeArray(STORAGE_KEYS.STUDENTS);
    const teachers = getSafeArray(STORAGE_KEYS.TEACHERS);
    const customQuizzes = getSafeArray(STORAGE_KEYS.CUSTOM_QUIZZES);
    const schedules = getSafeArray(STORAGE_KEYS.SCHEDULES);
    const resources = getSafeArray(STORAGE_KEYS.LEARNING_RESOURCES);
    const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);

    // Formatted size
    const kb = (totalBytes / 1024).toFixed(1);
    const formattedSize = totalBytes > 1024 * 1024 ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB` : `${kb} KB`;

    let health: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    if (percentageUsed > 85) health = 'CRITICAL';
    else if (percentageUsed > 60) health = 'WARNING';

    return {
      totalBytesUsed: totalBytes,
      formattedSize,
      quotaBytes,
      percentageUsed,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalQuizzes: 10 + customQuizzes.length, // 10 default tracks + custom
      totalQuestions: 28 + customQuizzes.reduce((acc: number, q: any) => acc + (q.questions?.length || 0), 0),
      totalSchedules: schedules.length,
      totalResources: resources.length,
      lastBackupAt: lastBackup,
      lastSyncAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      persistenceHealth: health
    };
  }

  /**
   * Ghi nhận Audit Log quản trị
   */
  static recordAuditLog(
    action: SystemAuditLog['action'],
    targetEntity: SystemAuditLog['targetEntity'],
    description: string,
    actor: string = 'Super Admin'
  ): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const logs: SystemAuditLog[] = stored ? JSON.parse(stored) : [];
      const newLog: SystemAuditLog = {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        action,
        targetEntity,
        description,
        actor
      };
      logs.unshift(newLog);
      // Keep max 100 logs
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
      this.broadcastEvent('AUDIT_LOG', newLog);
    } catch (e) {
      console.error('Failed to record audit log', e);
    }
  }

  /**
   * Lấy danh sách Audit Logs
   */
  static getAuditLogs(limit: number = 50): SystemAuditLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const logs: SystemAuditLog[] = stored ? JSON.parse(stored) : [];
      return logs.slice(0, limit);
    } catch {
      return [];
    }
  }

  /**
   * Xuất toàn bộ CSDL ra JSON Snapshot 1-Click
   */
  static exportFullBackup(actor: string = 'Super Admin'): SystemBackupPayload {
    if (typeof window === 'undefined') {
      throw new Error('Chỉ hỗ trợ xuất sao lưu trên môi trường trình duyệt');
    }

    const getSafeData = (key: string, defaultVal: any = []) => {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : defaultVal;
      } catch {
        return defaultVal;
      }
    };

    const payload: SystemBackupPayload = {
      version: '2026.1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: actor,
      appName: 'TIN HỌC GEN Z - ECOSYSTEM LMS & ADMIN MASTER',
      checksum: `THGZ-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      data: {
        studentAccounts: getSafeData(STORAGE_KEYS.STUDENTS, []),
        teacherAccounts: getSafeData(STORAGE_KEYS.TEACHERS, []),
        customQuizzes: getSafeData(STORAGE_KEYS.CUSTOM_QUIZZES, []),
        quizOverrides: getSafeData(STORAGE_KEYS.QUIZ_OVERRIDES, {}),
        deletedQuizIds: getSafeData(STORAGE_KEYS.DELETED_QUIZZES, []),
        schedules: getSafeData(STORAGE_KEYS.SCHEDULES, []),
        assignments: getSafeData(STORAGE_KEYS.ASSIGNMENTS, []),
        submissions: getSafeData(STORAGE_KEYS.SUBMISSIONS, []),
        googleDriveConfig: getSafeData(STORAGE_KEYS.GDRIVE, null),
        learningSources: getSafeData(STORAGE_KEYS.LEARNING_SOURCES, []),
        learningResources: getSafeData(STORAGE_KEYS.LEARNING_RESOURCES, []),
        internalMaterials: getSafeData(STORAGE_KEYS.INTERNAL_MATERIALS, []),
        auditLogs: getSafeData(STORAGE_KEYS.AUDIT_LOGS, [])
      }
    };

    // Save timestamp of last backup
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
    } catch {}

    this.recordAuditLog(
      'BACKUP_EXPORT',
      'SYSTEM',
      `Đã xuất bản sao lưu hệ thống toàn diện (${payload.checksum})`,
      actor
    );

    return payload;
  }

  /**
   * Tải tệp sao lưu JSON trực tiếp về máy tính người dùng
   */
  static downloadBackupFile(actor: string = 'Super Admin'): void {
    const payload = this.exportFullBackup(actor);
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.setAttribute('download', `CSDL_PH_TINHOCGENZ_BACKUP_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Nạp và khôi phục CSDL từ file JSON Backup
   */
  static restoreFromBackup(
    jsonString: string,
    actor: string = 'Super Admin'
  ): { success: boolean; message: string; restoredCounts?: Record<string, number> } {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Chỉ có thể khôi phục trên trình duyệt' };
    }

    try {
      const parsed: SystemBackupPayload = JSON.parse(jsonString);

      if (!parsed.data || typeof parsed.data !== 'object') {
        return { success: false, message: 'Định dạng file sao lưu không hợp lệ (thiếu khối data)' };
      }

      const { data } = parsed;
      const counts: Record<string, number> = {};

      if (Array.isArray(data.studentAccounts)) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.studentAccounts));
        counts.students = data.studentAccounts.length;
      }
      if (Array.isArray(data.teacherAccounts)) {
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(data.teacherAccounts));
        counts.teachers = data.teacherAccounts.length;
      }
      if (Array.isArray(data.customQuizzes)) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_QUIZZES, JSON.stringify(data.customQuizzes));
        counts.customQuizzes = data.customQuizzes.length;
      }
      if (data.quizOverrides && typeof data.quizOverrides === 'object') {
        localStorage.setItem(STORAGE_KEYS.QUIZ_OVERRIDES, JSON.stringify(data.quizOverrides));
        counts.quizOverrides = Object.keys(data.quizOverrides).length;
      }
      if (Array.isArray(data.deletedQuizIds)) {
        localStorage.setItem(STORAGE_KEYS.DELETED_QUIZZES, JSON.stringify(data.deletedQuizIds));
      }
      if (Array.isArray(data.schedules)) {
        localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(data.schedules));
        counts.schedules = data.schedules.length;
      }
      if (Array.isArray(data.assignments)) {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(data.assignments));
        counts.assignments = data.assignments.length;
      }
      if (Array.isArray(data.submissions)) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data.submissions));
      }
      if (data.googleDriveConfig) {
        localStorage.setItem(STORAGE_KEYS.GDRIVE, JSON.stringify(data.googleDriveConfig));
      }
      if (Array.isArray(data.learningSources)) {
        localStorage.setItem(STORAGE_KEYS.LEARNING_SOURCES, JSON.stringify(data.learningSources));
        counts.learningSources = data.learningSources.length;
      }
      if (Array.isArray(data.learningResources)) {
        localStorage.setItem(STORAGE_KEYS.LEARNING_RESOURCES, JSON.stringify(data.learningResources));
        counts.learningResources = data.learningResources.length;
      }
      if (Array.isArray(data.internalMaterials)) {
        localStorage.setItem(STORAGE_KEYS.INTERNAL_MATERIALS, JSON.stringify(data.internalMaterials));
        counts.internalMaterials = data.internalMaterials.length;
      }

      this.recordAuditLog(
        'BACKUP_RESTORE',
        'SYSTEM',
        `Đã khôi phục thành công toàn bộ CSDL từ bản sao lưu [${parsed.checksum || 'N/A'}]`,
        actor
      );

      // Notify other tabs
      this.broadcastEvent('SYSTEM_RESTORE', { checksum: parsed.checksum });

      return {
        success: true,
        message: `Khôi phục thành công! Đã nạp ${counts.students || 0} học viên, ${counts.teachers || 0} giảng viên, ${counts.customQuizzes || 0} đề thi, ${counts.schedules || 0} lịch học.`,
        restoredCounts: counts
      };
    } catch (e: any) {
      console.error('Error parsing or restoring backup', e);
      return { success: false, message: `Lỗi đọc file sao lưu: ${e.message || 'Cấu trúc JSON không hợp lệ'}` };
    }
  }

  /**
   * Phát tín hiệu đồng bộ qua BroadcastChannel và StorageEvent
   */
  static broadcastEvent(eventType: string, payload: any = {}): void {
    if (typeof window === 'undefined') return;

    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: eventType, payload, timestamp: Date.now() });
      } catch (e) {
        console.warn('BroadcastChannel postMessage failed', e);
      }
    }

    try {
      window.dispatchEvent(new CustomEvent('phtinhocgenz_storage_sync', { detail: { type: eventType, payload } }));
    } catch (e) {
      console.warn('Dispatch CustomEvent failed', e);
    }
  }

  /**
   * Lắng nghe tín hiệu đồng bộ từ các tab khác
   */
  static onSync(callback: (event: { type: string; payload: any }) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleBroadcast = (e: MessageEvent) => {
      if (e.data && e.data.type) {
        callback({ type: e.data.type, payload: e.data.payload });
      }
    };

    const handleCustom = (e: any) => {
      if (e.detail) {
        callback(e.detail);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }
    window.addEventListener('phtinhocgenz_storage_sync', handleCustom);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('phtinhocgenz_storage_sync', handleCustom);
    };
  }
}

