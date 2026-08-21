import { CurriculumTrack } from './auth';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'makeup';

export interface AttendanceRecord {
  studentId: string;
  studentCode: string;
  studentName: string;
  classCode?: string;      // e.g. "K26-WE01", "K26-CC02", "K26-AI03"
  schoolOrClass?: string;
  status: AttendanceStatus;
  isMakeup?: boolean;      // True if attending makeup class (vắng bù)
  originalAbsentDate?: string; // Date of original absence if makeup
  checkInTime?: string;    // e.g. "08:15:30"
  checkInMethod: 'qr_scan' | 'manual' | 'pin_code';
  clientIp?: string;       // IP address recorded during check-in
  deviceFp?: string;       // Device fingerprint to prevent proxy check-in
  distanceMeters?: number; // Distance to classroom if GPS enabled
  note?: string;
}

export interface AttendanceSession {
  id: string;
  date: string;            // "YYYY-MM-DD"
  startTime: string;       // "HH:mm"
  endTime: string;         // "HH:mm"
  track: CurriculumTrack;
  classCode: string;       // e.g. "K26-WE01", "K26-CC01"
  className: string;
  teacherId: string;
  teacherName: string;
  qrToken?: string;
  qrExpiresAt?: number;    // timestamp in ms
  qrPinCode?: string;      // 6-digit code e.g. "492108"
  intervalSeconds?: number; // Rotation interval (default 120s = 2 minutes)
  isOpen?: boolean;        // true = active, false = closed/locked
  
  // Anti-fraud security settings
  requireSameIp?: boolean;      // Only allow check-in if student is on same WiFi / public IP
  teacherIp?: string;           // Teacher/Classroom IP address
  requireLocation?: boolean;    // Only allow check-in within classroom GPS radius
  classroomLat?: number;        // Classroom Latitude
  classroomLng?: number;        // Classroom Longitude
  allowedRadiusMeters?: number; // Allowed distance in meters (e.g. 150m)
  preventMultiCheckIn?: boolean;// Prevent 1 device from checking in multiple students

  records: AttendanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface DynamicQRCodePayload {
  sessionId: string;
  track: CurriculumTrack;
  classCode: string;
  token: string;
  pinCode: string;
  expiresAt: number;
}

export interface MakeupAttendanceReport {
  id: string;
  studentCode: string;
  studentName: string;
  originalClassCode: string;
  makeupClassCode: string;
  track: CurriculumTrack;
  teacherName: string;
  sessionDate: string;
  checkInTime: string;
  reason?: string;
  reportedToAdminAt: string;
}
