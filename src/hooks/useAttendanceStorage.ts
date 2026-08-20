import { useState, useEffect, useCallback } from 'react';
import { AttendanceSession, AttendanceRecord, AttendanceStatus } from '../types/attendance';
import { StudentAccount, CurriculumTrack } from '../types/auth';

const ATTENDANCE_SESSIONS_KEY = 'phtinhocgenz_attendance_sessions_v1';

export function useAttendanceStorage(studentAccounts: StudentAccount[]) {
  const [sessions, setSessions] = useState<AttendanceSession[]>(() => {
    try {
      const saved = localStorage.getItem(ATTENDANCE_SESSIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load attendance sessions', e);
    }
    return [];
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ATTENDANCE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save attendance sessions', e);
    }
  }, [sessions]);

  // Generate 6-digit PIN (e.g. "839102")
  const generatePin = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  };

  // Generate a random token
  const generateToken = () => {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  };

  // Create a new attendance session for a class track
  const createSession = useCallback((
    track: CurriculumTrack,
    className: string,
    teacherId: string,
    teacherName: string
  ): AttendanceSession => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    // Filter students enrolled in this track
    const enrolledStudents = studentAccounts.filter(s =>
      s.programTrack === track || (s.enrolledTracks && s.enrolledTracks.includes(track))
    );

    const initialRecords: AttendanceRecord[] = enrolledStudents.map(student => ({
      studentId: student.id,
      studentCode: student.studentCode,
      studentName: student.name,
      schoolOrClass: student.schoolOrClass,
      status: 'absent' as AttendanceStatus,
      checkInMethod: 'manual',
      note: ''
    }));

    const newSession: AttendanceSession = {
      id: `session-${Date.now()}`,
      date: dateStr,
      startTime: timeStr,
      endTime: '',
      track,
      className,
      teacherId,
      teacherName,
      qrToken: generateToken(),
      qrExpiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes countdown
      qrPinCode: generatePin(),
      isOpen: true,
      records: initialRecords,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setSessions(prev => [newSession, ...prev]);
    return newSession;
  }, [studentAccounts]);

  // Rotate QR code (custom interval e.g. 30s, 60s, 300s)
  const rotateSessionQR = useCallback((sessionId: string, intervalSeconds: number = 300) => {
    const newToken = generateToken();
    const newPin = generatePin();
    const newExpiresAt = Date.now() + intervalSeconds * 1000;

    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            qrToken: newToken,
            qrPinCode: newPin,
            qrExpiresAt: newExpiresAt,
            isOpen: true, // re-open when rotating
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      })
    );

    return { token: newToken, pinCode: newPin, expiresAt: newExpiresAt };
  }, []);

  // Toggle Session Open / Locked (Bật / Tắt Điểm Danh)
  const toggleSessionOpen = useCallback((sessionId: string) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const nextState = s.isOpen === false ? true : false;
          return {
            ...s,
            isOpen: nextState,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      })
    );
  }, []);

  // Update a student's attendance status in a session
  const updateStudentStatus = useCallback((
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    note?: string,
    method: 'manual' | 'qr_scan' | 'pin_code' = 'manual'
  ) => {
    const nowTime = new Date().toTimeString().slice(0, 8);

    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s;

        const updatedRecords = s.records.map(rec => {
          if (rec.studentId === studentId) {
            return {
              ...rec,
              status,
              checkInTime: status === 'present' || status === 'late' ? (rec.checkInTime || nowTime) : undefined,
              checkInMethod: method,
              note: note !== undefined ? note : rec.note
            };
          }
          return rec;
        });

        return {
          ...s,
          records: updatedRecords,
          updatedAt: new Date().toISOString()
        };
      })
    );
  }, []);

  // Mark all students as present
  const markAllPresent = useCallback((sessionId: string) => {
    const nowTime = new Date().toTimeString().slice(0, 8);

    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s;

        const updatedRecords = s.records.map(rec => ({
          ...rec,
          status: 'present' as AttendanceStatus,
          checkInTime: rec.checkInTime || nowTime,
          checkInMethod: 'manual' as const
        }));

        return {
          ...s,
          records: updatedRecords,
          updatedAt: new Date().toISOString()
        };
      })
    );
  }, []);

  // Student check-in via PIN or QR Token
  const studentCheckIn = useCallback((
    studentCode: string,
    studentName: string,
    pinOrToken: string,
    track: CurriculumTrack
  ): { success: boolean; message: string; session?: AttendanceSession } => {
    const now = Date.now();

    // Find active session with matching PIN or Token
    const session = sessions.find(s =>
      s.track === track &&
      (s.qrPinCode === pinOrToken.trim() || s.qrToken === pinOrToken.trim())
    );

    if (!session) {
      return { success: false, message: 'Mã điểm danh không hợp lệ hoặc lớp học chưa mở phiên điểm danh!' };
    }

    if (session.isOpen === false) {
      return { success: false, message: '🔒 Giáo viên đã ĐÓNG / KHÓA phiên điểm danh của lớp này!' };
    }

    if (session.qrExpiresAt && now > session.qrExpiresAt) {
      return { success: false, message: 'Mã QR / PIN điểm danh đã hết hạn. Vui lòng yêu cầu giáo viên làm mới mã!' };
    }

    const nowTime = new Date().toTimeString().slice(0, 8);
    let isFound = false;

    const updatedRecords = session.records.map(rec => {
      if (rec.studentCode.trim().toLowerCase() === studentCode.trim().toLowerCase()) {
        isFound = true;
        return {
          ...rec,
          status: 'present' as AttendanceStatus,
          checkInTime: nowTime,
          checkInMethod: 'qr_scan' as const
        };
      }
      return rec;
    });

    // If student was not already in the record list, add them dynamically
    if (!isFound) {
      updatedRecords.push({
        studentId: `student-${studentCode}`,
        studentCode,
        studentName,
        status: 'present',
        checkInTime: nowTime,
        checkInMethod: 'qr_scan',
        note: 'Điểm danh qua QR'
      });
    }

    setSessions(prev =>
      prev.map(s => (s.id === session.id ? { ...s, records: updatedRecords, updatedAt: new Date().toISOString() } : s))
    );

    return {
      success: true,
      message: `Điểm danh thành công cho học viên ${studentName} lúc ${nowTime}!`,
      session
    };
  }, [sessions]);

  // Save session (complete it)
  const saveSession = useCallback((sessionToSave: AttendanceSession) => {
    setSessions(prev =>
      prev.map(s => (s.id === sessionToSave.id ? { ...sessionToSave, updatedAt: new Date().toISOString() } : s))
    );
  }, []);

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  return {
    sessions,
    createSession,
    rotateSessionQR,
    toggleSessionOpen,
    updateStudentStatus,
    markAllPresent,
    studentCheckIn,
    saveSession,
    deleteSession
  };
}
