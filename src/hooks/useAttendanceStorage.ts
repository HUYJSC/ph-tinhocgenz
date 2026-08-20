import { useState, useEffect, useCallback } from 'react';
import { AttendanceSession, AttendanceRecord, AttendanceStatus } from '../types/attendance';
import { StudentAccount, CurriculumTrack, TRACK_LABELS } from '../types/auth';

const ATTENDANCE_SESSIONS_KEY = 'phtinhocgenz_attendance_sessions_v2';

const ALL_10_TRACK_KEYS: CurriculumTrack[] = [
  'office-fast-3in1',
  'cc-cntt-basic',
  'cc-cntt-advanced',
  'cntt-basic-we',
  'cntt-adv-we',
  'ai-office',
  'excel-accounting',
  'word-6b',
  'excel-6b',
  'ppt-6b'
];

export function useAttendanceStorage(studentAccounts: StudentAccount[]) {
  // Generate 6-digit PIN (e.g. "839102")
  const generatePin = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  };

  // Generate a random token
  const generateToken = () => {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  };

  // Build initial default sessions for all tracks if empty
  const createDefaultSessions = (students: StudentAccount[]): AttendanceSession[] => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    return ALL_10_TRACK_KEYS.map((trackKey, idx) => {
      const trackTitle = TRACK_LABELS[trackKey] || trackKey;
      const enrolled = students.filter(s =>
        s.programTrack === trackKey || (s.enrolledTracks && s.enrolledTracks.includes(trackKey))
      );

      const records: AttendanceRecord[] = enrolled.map(student => ({
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: student.name,
        schoolOrClass: student.schoolOrClass,
        status: 'absent' as AttendanceStatus,
        checkInMethod: 'manual',
        note: ''
      }));

      return {
        id: `sess-init-${idx + 1}-${trackKey}`,
        date: dateStr,
        startTime: timeStr,
        endTime: '',
        track: trackKey,
        className: `Lớp ${trackTitle}`,
        teacherId: 'admin-01',
        teacherName: 'Thầy Huy (Giảng Viên Trưởng)',
        qrToken: generateToken(),
        qrExpiresAt: Date.now() + 5 * 60 * 1000,
        qrPinCode: generatePin(),
        isOpen: true,
        records,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
    });
  };

  const [sessions, setSessions] = useState<AttendanceSession[]>(() => {
    try {
      const saved = localStorage.getItem(ATTENDANCE_SESSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load attendance sessions', e);
    }
    return createDefaultSessions(studentAccounts);
  });

  // Keep sessions in sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ATTENDANCE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save attendance sessions', e);
    }
  }, [sessions]);

  // Synchronize student records in active sessions if student accounts change
  useEffect(() => {
    if (!studentAccounts || studentAccounts.length === 0) return;

    setSessions(prev => {
      let hasChanges = false;
      const next = prev.map(session => {
        const enrolled = studentAccounts.filter(s =>
          s.programTrack === session.track || (s.enrolledTracks && s.enrolledTracks.includes(session.track))
        );

        // Check if any student is missing from session records
        const currentCodes = new Set(session.records.map(r => r.studentCode.toLowerCase()));
        const missingStudents = enrolled.filter(s => !currentCodes.has(s.studentCode.toLowerCase()));

        if (missingStudents.length > 0) {
          hasChanges = true;
          const newRecords: AttendanceRecord[] = [
            ...session.records,
            ...missingStudents.map(student => ({
              studentId: student.id,
              studentCode: student.studentCode,
              studentName: student.name,
              schoolOrClass: student.schoolOrClass,
              status: 'absent' as AttendanceStatus,
              checkInMethod: 'manual' as const,
              note: ''
            }))
          ];
          return { ...session, records: newRecords };
        }
        return session;
      });

      return hasChanges ? next : prev;
    });
  }, [studentAccounts]);

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
      qrExpiresAt: Date.now() + 5 * 60 * 1000,
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
            isOpen: true,
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

  // Universal Smart Student Check-In with Strict Class & Enrollment Validation
  const studentCheckIn = useCallback((
    studentCode: string,
    studentName: string,
    rawPinOrToken: string,
    optionalTrack?: CurriculumTrack
  ): { success: boolean; message: string; session?: AttendanceSession } => {
    const now = Date.now();
    const cleanInput = rawPinOrToken.trim();

    // 1. Parse PIN or Token from raw input or URL query params
    let searchPin = cleanInput;
    let searchToken = cleanInput;
    let targetTrack = optionalTrack;

    if (cleanInput.includes('?') && (cleanInput.includes('pin=') || cleanInput.includes('token='))) {
      try {
        const parsedUrl = new URL(cleanInput);
        searchPin = parsedUrl.searchParams.get('pin') || searchPin;
        searchToken = parsedUrl.searchParams.get('token') || searchToken;
        const urlTrack = parsedUrl.searchParams.get('track') as CurriculumTrack;
        if (urlTrack) targetTrack = urlTrack;
      } catch (e) {}
    }

    // 2. Find the exact matching session by PIN, Token, ID, or active track session
    let matchedSession = sessions.find(s =>
      (s.qrPinCode && s.qrPinCode === searchPin) ||
      (s.qrToken && s.qrToken === searchToken) ||
      s.id === cleanInput
    );

    // Fallback: If not found by PIN/token, check if user provided track and session matches
    if (!matchedSession && targetTrack) {
      matchedSession = sessions.find(s => s.track === targetTrack && s.isOpen !== false);
    }

    if (!matchedSession) {
      return {
        success: false,
        message: 'Mã PIN hoặc Token điểm danh không hợp lệ, hoặc lớp học chưa mở phiên điểm danh!'
      };
    }

    // 3. Check if session is closed/locked by teacher
    if (matchedSession.isOpen === false) {
      return {
        success: false,
        message: `🔒 Giáo viên đã ĐÓNG / KHÓA phiên điểm danh của môn "${matchedSession.className}"!`
      };
    }

    // 4. Check if QR code / PIN has expired
    if (matchedSession.qrExpiresAt && now > matchedSession.qrExpiresAt) {
      return {
        success: false,
        message: 'Mã QR / PIN điểm danh đã hết hạn. Vui lòng nhìn màn hình giáo viên để lấy mã mới nhất!'
      };
    }

    // 5. STRICT ENROLLMENT CHECK: Check if this student is enrolled in matchedSession.track
    const matchedStudentAccount = studentAccounts.find(
      s => s.studentCode.trim().toLowerCase() === studentCode.trim().toLowerCase() ||
           s.name.trim().toLowerCase() === studentName.trim().toLowerCase()
    );

    const isEnrolledInTrack = matchedStudentAccount && (
      matchedStudentAccount.programTrack === matchedSession.track ||
      (matchedStudentAccount.enrolledTracks && matchedStudentAccount.enrolledTracks.includes(matchedSession.track))
    );

    // If student is NOT enrolled in this specific course track
    if (!matchedStudentAccount || !isEnrolledInTrack) {
      const studentTrackLabel = matchedStudentAccount
        ? (TRACK_LABELS[matchedStudentAccount.programTrack] || matchedStudentAccount.programTrack)
        : 'Khác';

      return {
        success: false,
        message: `❌ BỊ TỪ CHỐI: Học viên ${studentName} (${studentCode}) thuộc môn "${studentTrackLabel}", KHÔNG CÓ TÊN trong danh sách lớp "${matchedSession.className}" do ${matchedSession.teacherName} phụ trách!`
      };
    }

    // 6. Check teacher assignment if student is tied to a specific teacher
    if (
      matchedStudentAccount.assignedTeacherId &&
      matchedSession.teacherId &&
      matchedSession.teacherId !== 'admin-01' &&
      matchedStudentAccount.assignedTeacherId !== matchedSession.teacherId
    ) {
      return {
        success: false,
        message: `❌ BỊ TỪ CHỐI: Học viên ${studentName} thuộc phân công của giáo viên khác, không thể điểm danh trong lớp của ${matchedSession.teacherName}!`
      };
    }

    // 7. Mark as PRESENT
    const nowTime = new Date().toTimeString().slice(0, 8);
    const checkInMethod = (searchToken === matchedSession.qrToken || cleanInput.includes('token='))
      ? 'qr_scan' as const
      : 'pin_code' as const;

    let isFoundInRecords = false;

    const updatedRecords = matchedSession.records.map(rec => {
      if (rec.studentCode.trim().toLowerCase() === matchedStudentAccount.studentCode.trim().toLowerCase()) {
        isFoundInRecords = true;
        return {
          ...rec,
          status: 'present' as AttendanceStatus,
          checkInTime: nowTime,
          checkInMethod
        };
      }
      return rec;
    });

    if (!isFoundInRecords) {
      updatedRecords.push({
        studentId: matchedStudentAccount.id,
        studentCode: matchedStudentAccount.studentCode,
        studentName: matchedStudentAccount.name,
        schoolOrClass: matchedStudentAccount.schoolOrClass,
        status: 'present',
        checkInTime: nowTime,
        checkInMethod,
        note: 'Điểm danh qua QR'
      });
    }

    setSessions(prev =>
      prev.map(s => (s.id === matchedSession!.id ? { ...s, records: updatedRecords, updatedAt: new Date().toISOString() } : s))
    );

    return {
      success: true,
      message: `✓ Điểm danh thành công cho ${matchedStudentAccount.name} (${matchedStudentAccount.studentCode}) môn "${matchedSession.className}"!`,
      session: matchedSession
    };
  }, [sessions, studentAccounts]);

  // Save session
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
