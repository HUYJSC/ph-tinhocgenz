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

  // Student check-in via PIN or QR Token with Strict Enrollment Validation
  const studentCheckIn = useCallback((
    studentCode: string,
    studentName: string,
    pinOrToken: string,
    track: CurriculumTrack
  ): { success: boolean; message: string; session?: AttendanceSession } => {
    const now = Date.now();

    // 1. Find active session with matching PIN or Token
    const session = sessions.find(s =>
      s.track === track &&
      (s.qrPinCode === pinOrToken.trim() || s.qrToken === pinOrToken.trim())
    );

    if (!session) {
      return {
        success: false,
        message: 'Mã điểm danh không hợp lệ hoặc lớp học chưa mở phiên điểm danh!'
      };
    }

    // 2. Check if session is closed/locked by teacher
    if (session.isOpen === false) {
      return {
        success: false,
        message: '🔒 Giáo viên đã ĐÓNG / KHÓA phiên điểm danh của lớp này!'
      };
    }

    // 3. Check expiration
    if (session.qrExpiresAt && now > session.qrExpiresAt) {
      return {
        success: false,
        message: 'Mã QR / PIN điểm danh đã hết hạn. Vui lòng yêu cầu giáo viên làm mới mã!'
      };
    }

    // 4. Strict Enrollment Validation (Chỉ học viên đúng môn, đúng lớp của giáo viên mới quét được)
    const matchedStudentAccount = studentAccounts.find(
      s => s.studentCode.trim().toLowerCase() === studentCode.trim().toLowerCase()
    );

    const isEnrolledInTrack = matchedStudentAccount && (
      matchedStudentAccount.programTrack === track ||
      (matchedStudentAccount.enrolledTracks && matchedStudentAccount.enrolledTracks.includes(track))
    );

    // If student is not registered in this track / class
    if (!matchedStudentAccount || !isEnrolledInTrack) {
      return {
        success: false,
        message: `❌ BỊ TỪ CHỐI: Học viên ${studentName} (${studentCode}) KHÔNG THUỘC danh sách lớp "${session.className}" do ${session.teacherName} giảng dạy!`
      };
    }

    // Check teacher assignment if student is tied to a specific teacher
    if (
      matchedStudentAccount.assignedTeacherId &&
      session.teacherId &&
      session.teacherId !== 'admin-01' &&
      matchedStudentAccount.assignedTeacherId !== session.teacherId
    ) {
      return {
        success: false,
        message: `❌ BỊ TỪ CHỐI: Học viên ${studentName} thuộc phân công của giáo viên khác, không thể điểm danh trong lớp của ${session.teacherName}!`
      };
    }

    const nowTime = new Date().toTimeString().slice(0, 8);
    const method = pinOrToken === session.qrToken ? 'qr_scan' as const : 'pin_code' as const;
    let isFound = false;

    const updatedRecords = session.records.map(rec => {
      if (rec.studentCode.trim().toLowerCase() === studentCode.trim().toLowerCase()) {
        isFound = true;
        return {
          ...rec,
          status: 'present' as AttendanceStatus,
          checkInTime: nowTime,
          checkInMethod: method
        };
      }
      return rec;
    });

    // If student was verified but missing from initial records, add them
    if (!isFound) {
      updatedRecords.push({
        studentId: matchedStudentAccount.id || `student-${studentCode}`,
        studentCode: matchedStudentAccount.studentCode,
        studentName: matchedStudentAccount.name,
        schoolOrClass: matchedStudentAccount.schoolOrClass,
        status: 'present',
        checkInTime: nowTime,
        checkInMethod: method,
        note: 'Điểm danh qua QR'
      });
    }

    setSessions(prev =>
      prev.map(s => (s.id === session.id ? { ...s, records: updatedRecords, updatedAt: new Date().toISOString() } : s))
    );

    return {
      success: true,
      message: `✓ Điểm danh thành công cho ${matchedStudentAccount.name} (${matchedStudentAccount.studentCode}) lớp "${session.className}"!`,
      session
    };
  }, [sessions, studentAccounts]);

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
