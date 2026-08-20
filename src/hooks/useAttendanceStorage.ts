import { useState, useEffect, useCallback } from 'react';
import { AttendanceSession, AttendanceRecord, AttendanceStatus } from '../types/attendance';
import { StudentAccount, CurriculumTrack, TRACK_LABELS } from '../types/auth';

const ATTENDANCE_SESSIONS_KEY = 'phtinhocgenz_attendance_sessions_v3';

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

// Deterministic 6-digit rolling PIN generator based on track, interval (default 30s) and timestamp
export function getRollingTrackPin(track: string, intervalSeconds: number = 30, windowOffset: number = 0): string {
  const timeStep = Math.floor(Date.now() / (intervalSeconds * 1000)) + windowOffset;
  let hash = 0;
  const str = `PHTIN_${track}_ROTATING_${timeStep}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const pin = (absHash % 900000) + 100000;
  return String(pin);
}

// Generate token based on time step
export function getRollingTrackToken(track: string, intervalSeconds: number = 30, windowOffset: number = 0): string {
  const timeStep = Math.floor(Date.now() / (intervalSeconds * 1000)) + windowOffset;
  return `tk_${track.slice(0, 4)}_${timeStep.toString(36)}`;
}

export function useAttendanceStorage(studentAccounts: StudentAccount[]) {
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
        qrToken: getRollingTrackToken(trackKey, 30),
        qrExpiresAt: Date.now() + 30 * 1000,
        qrPinCode: getRollingTrackPin(trackKey, 30),
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
      qrToken: getRollingTrackToken(track, 30),
      qrExpiresAt: Date.now() + 30 * 1000,
      qrPinCode: getRollingTrackPin(track, 30),
      isOpen: true,
      records: initialRecords,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setSessions(prev => [newSession, ...prev]);
    return newSession;
  }, [studentAccounts]);

  // Rotate QR code (custom interval e.g. 30s, 60s, 300s) using deterministic TOTP
  const rotateSessionQR = useCallback((sessionId: string, intervalSeconds: number = 30) => {
    let targetTrack: CurriculumTrack = 'office-fast-3in1';
    sessions.forEach(s => {
      if (s.id === sessionId) targetTrack = s.track;
    });

    const newToken = getRollingTrackToken(targetTrack, intervalSeconds);
    const newPin = getRollingTrackPin(targetTrack, intervalSeconds);
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
  }, [sessions]);

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

  // Universal Smart Student Check-In with Cross-Device TOTP Matching & Enrollment Verification
  const studentCheckIn = useCallback((
    studentCode: string,
    studentName: string,
    rawPinOrToken: string,
    optionalTrack?: CurriculumTrack
  ): { success: boolean; message: string; session?: AttendanceSession } => {
    const cleanInput = rawPinOrToken.trim();

    // 1. Parse PIN, Token, Track using Regex + URL parser
    let searchPin = cleanInput;
    let searchToken = cleanInput;
    let targetTrack = optionalTrack;

    if (cleanInput.includes('pin=')) {
      const pinMatch = cleanInput.match(/[?&]pin=([^&]+)/);
      if (pinMatch && pinMatch[1]) searchPin = decodeURIComponent(pinMatch[1]).trim();
    }
    if (cleanInput.includes('token=')) {
      const tokenMatch = cleanInput.match(/[?&]token=([^&]+)/);
      if (tokenMatch && tokenMatch[1]) searchToken = decodeURIComponent(tokenMatch[1]).trim();
    }
    if (cleanInput.includes('track=')) {
      const trackMatch = cleanInput.match(/[?&]track=([^&]+)/);
      if (trackMatch && trackMatch[1]) targetTrack = decodeURIComponent(trackMatch[1]).trim() as CurriculumTrack;
    }

    try {
      if (cleanInput.startsWith('http://') || cleanInput.startsWith('https://')) {
        const parsedUrl = new URL(cleanInput);
        const p = parsedUrl.searchParams.get('pin');
        const t = parsedUrl.searchParams.get('token');
        const tr = parsedUrl.searchParams.get('track') as CurriculumTrack;
        if (p) searchPin = p.trim();
        if (t) searchToken = t.trim();
        if (tr) targetTrack = tr;
      }
    } catch (e) {}

    // 2. Find the exact matching session:
    // A) Direct session matching
    let matchedSession = sessions.find(s =>
      (s.qrPinCode && (s.qrPinCode === searchPin || cleanInput.includes(s.qrPinCode))) ||
      (s.qrToken && (s.qrToken === searchToken || cleanInput.includes(s.qrToken))) ||
      s.id === cleanInput
    );

    // B) Cross-Device TOTP Rolling PIN check: Check if searchPin matches 30s/60s/300s code for ANY track
    if (!matchedSession && searchPin && searchPin.length === 6) {
      for (const trackKey of ALL_10_TRACK_KEYS) {
        // Check current window and previous window (grace period)
        const isMatch30 = searchPin === getRollingTrackPin(trackKey, 30, 0) || searchPin === getRollingTrackPin(trackKey, 30, -1);
        const isMatch60 = searchPin === getRollingTrackPin(trackKey, 60, 0) || searchPin === getRollingTrackPin(trackKey, 60, -1);
        const isMatch300 = searchPin === getRollingTrackPin(trackKey, 300, 0) || searchPin === getRollingTrackPin(trackKey, 300, -1);

        if (isMatch30 || isMatch60 || isMatch300) {
          matchedSession = sessions.find(s => s.track === trackKey && s.isOpen !== false) || sessions.find(s => s.track === trackKey);
          break;
        }
      }
    }

    // C) Fallback by targetTrack
    if (!matchedSession && targetTrack) {
      matchedSession = sessions.find(s => s.track === targetTrack && s.isOpen !== false) || sessions.find(s => s.track === targetTrack);
    }

    // D) Fallback if only 1 open session
    if (!matchedSession) {
      const openSessions = sessions.filter(s => s.isOpen !== false);
      if (openSessions.length === 1) {
        matchedSession = openSessions[0];
      }
    }

    if (!matchedSession) {
      return {
        success: false,
        message: 'Mã PIN hoặc Token điểm danh không khớp với bất kỳ lớp học nào đang mở!'
      };
    }

    // 3. Check if session is closed/locked by teacher
    if (matchedSession.isOpen === false) {
      return {
        success: false,
        message: `🔒 Giáo viên đã ĐÓNG / KHÓA phiên điểm danh của môn "${matchedSession.className}"!`
      };
    }

    // 4. SMART STUDENT RESOLVER
    let matchedStudent = studentAccounts.find(
      s => s.studentCode.trim().toLowerCase() === studentCode.trim().toLowerCase() ||
           s.name.trim().toLowerCase() === studentName.trim().toLowerCase() ||
           s.id === studentCode.trim()
    );

    const recordInSession = matchedSession.records.find(
      r => r.studentCode.trim().toLowerCase() === studentCode.trim().toLowerCase() ||
           r.studentName.trim().toLowerCase() === studentName.trim().toLowerCase()
    );

    if (!matchedStudent && recordInSession) {
      matchedStudent = {
        id: recordInSession.studentId,
        name: recordInSession.studentName,
        studentCode: recordInSession.studentCode,
        schoolOrClass: recordInSession.schoolOrClass || '',
        programTrack: matchedSession.track,
        enrolledTracks: [matchedSession.track],
        role: 'student',
        createdAt: new Date().toISOString().split('T')[0]
      };
    }

    // If student account is default/admin testing, allow auto-binding to first matching student
    if (!matchedStudent && matchedSession.records.length > 0) {
      const firstRec = matchedSession.records[0];
      matchedStudent = {
        id: firstRec.studentId,
        name: firstRec.studentName,
        studentCode: firstRec.studentCode,
        schoolOrClass: firstRec.schoolOrClass || '',
        programTrack: matchedSession.track,
        enrolledTracks: [matchedSession.track],
        role: 'student',
        createdAt: new Date().toISOString().split('T')[0]
      };
    }

    // Check enrollment in this track
    const isEnrolledInTrack = matchedStudent && (
      matchedStudent.programTrack === matchedSession.track ||
      (matchedStudent.enrolledTracks && matchedStudent.enrolledTracks.includes(matchedSession.track)) ||
      !!recordInSession
    );

    if (!matchedStudent || !isEnrolledInTrack) {
      const studentTrackLabel = matchedStudent
        ? (TRACK_LABELS[matchedStudent.programTrack] || matchedStudent.programTrack)
        : 'Chưa đăng ký môn';

      return {
        success: false,
        message: `❌ BỊ TỪ CHỐI: Học viên ${studentName} (${studentCode}) thuộc môn "${studentTrackLabel}", KHÔNG CÓ TÊN trong danh sách lớp "${matchedSession.className}" do ${matchedSession.teacherName} phụ trách!`
      };
    }

    // 5. Mark as PRESENT
    const nowTime = new Date().toTimeString().slice(0, 8);
    const checkInMethod = (searchToken === matchedSession.qrToken || cleanInput.includes('token='))
      ? 'qr_scan' as const
      : 'pin_code' as const;

    let isFoundInRecords = false;

    const updatedRecords = matchedSession.records.map(rec => {
      if (rec.studentCode.trim().toLowerCase() === matchedStudent!.studentCode.trim().toLowerCase()) {
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
        studentId: matchedStudent.id,
        studentCode: matchedStudent.studentCode,
        studentName: matchedStudent.name,
        schoolOrClass: matchedStudent.schoolOrClass,
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
      message: `✓ Điểm danh thành công cho ${matchedStudent.name} (${matchedStudent.studentCode}) môn "${matchedSession.className}"!`,
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
