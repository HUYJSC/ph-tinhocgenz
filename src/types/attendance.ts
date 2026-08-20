import { CurriculumTrack } from './auth';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  studentId: string;
  studentCode: string;
  studentName: string;
  schoolOrClass?: string;
  status: AttendanceStatus;
  checkInTime?: string; // e.g. "08:15:30"
  checkInMethod: 'qr_scan' | 'manual' | 'pin_code';
  note?: string;
}

export interface AttendanceSession {
  id: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  track: CurriculumTrack;
  className: string;
  teacherId: string;
  teacherName: string;
  qrToken?: string;
  qrExpiresAt?: number; // timestamp in ms
  qrPinCode?: string;   // 6-digit code e.g. "492-108"
  isOpen?: boolean;     // true = active, false = closed/locked
  records: AttendanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface DynamicQRCodePayload {
  sessionId: string;
  track: CurriculumTrack;
  token: string;
  pinCode: string;
  expiresAt: number;
}
