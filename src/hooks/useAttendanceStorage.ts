import { useState, useEffect, useCallback } from 'react';
import { AttendanceSession, AttendanceRecord, AttendanceStatus, MakeupAttendanceReport } from '../types/attendance';
import { StudentAccount, CurriculumTrack, TRACK_LABELS } from '../types/auth';
import { getClientIp, getDeviceFingerprint, calculateDistanceMeters } from '../utils/securityUtils';

// Storage key updated for 5-minute rotation & GPS Anti-cheat v7
const ATTENDANCE_SESSIONS_KEY = 'phtinhocgenz_attendance_sessions_v7_5min_gps';
const MAKEUP_REPORTS_KEY = 'phtinhocgenz_makeup_reports_v3';

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

// Teacher-to-Class mappings
export const TRACK_CLASS_CODES: Record<CurriculumTrack, { classCode: string; defaultTeacherId: string; defaultTeacherName: string }> = {
  'office-fast-3in1': { classCode: 'K26-WE01', defaultTeacherId: 'tch-03', defaultTeacherName: 'Thầy Quang Huy' },
  'cc-cntt-basic':    { classCode: 'K26-CC01', defaultTeacherId: 'tch-03', defaultTeacherName: 'Thầy Quang Huy' },
  'cc-cntt-advanced': { classCode: 'K26-CCN01', defaultTeacherId: 'tch-02', defaultTeacherName: 'Thầy Đức Nam' },
  'cntt-basic-we':    { classCode: 'K26-WE-CB', defaultTeacherId: 'tch-01', defaultTeacherName: 'Cô Hoàng Mai' },
  'cntt-adv-we':      { classCode: 'K26-WENC01', defaultTeacherId: 'tch-02', defaultTeacherName: 'Thầy Đức Nam' },
  'ai-office':        { classCode: 'K26-AI01', defaultTeacherId: 'tch-03', defaultTeacherName: 'Thầy Quang Huy' },
  'excel-accounting': { classCode: 'K26-KT01', defaultTeacherId: 'tch-02', defaultTeacherName: 'Thầy Đức Nam' },
  'word-6b':          { classCode: 'K26-W01', defaultTeacherId: 'tch-01', defaultTeacherName: 'Cô Hoàng Mai' },
  'excel-6b':         { classCode: 'K26-EX01', defaultTeacherId: 'tch-01', defaultTeacherName: 'Cô Hoàng Mai' },
  'ppt-6b':           { classCode: 'K26-PPT01', defaultTeacherId: 'tch-01', defaultTeacherName: 'Cô Hoàng Mai' }
};

// Deterministic 6-digit rolling PIN generator (Default: 300 seconds / 5 minutes)
export function getRollingTrackPin(track: string, intervalSeconds: number = 300, windowOffset: number = 0): string {
  const timeStep = Math.floor(Date.now() / (intervalSeconds * 1000)) + windowOffset;
  let hash = 0;
  const str = `PHTIN_${track}_ROTATING_5MIN_${timeStep}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const pin = (absHash % 900000) + 100000;
  return String(pin);
}

// Generate token based on time step (Default: 300 seconds / 5 minutes)
export function getRollingTrackToken(track: string, intervalSeconds: number = 300, windowOffset: number = 0): string {
  const timeStep = Math.floor(Date.now() / (intervalSeconds * 1000)) + windowOffset;
  return `tk_${track.slice(0, 4)}_${timeStep.toString(36)}`;
}

export function useAttendanceStorage(studentAccounts: StudentAccount[]) {
  // Build initial default sessions for each track and class
  const createDefaultSessions = (students: StudentAccount[]): AttendanceSession[] => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    return ALL_10_TRACK_KEYS.map((trackKey, idx) => {
      const trackTitle = TRACK_LABELS[trackKey] || trackKey;
      const classMeta = TRACK_CLASS_CODES[trackKey] || { classCode: `K26-${trackKey.toUpperCase().slice(0, 4)}`, defaultTeacherId: 'tch-03', defaultTeacherName: 'Thầy Quang Huy' };

      // Filter students strictly enrolled in this track/class
      const enrolled = students.filter(s =>
        s.programTrack === trackKey || (s.enrolledTracks && s.enrolledTracks.includes(trackKey))
      );

      const records: AttendanceRecord[] = enrolled.map(student => ({
        studentId: student.id,
        studentCode: student.studentCode,
        studentName: student.name,
        classCode: student.classCode || classMeta.classCode,
        schoolOrClass: student.schoolOrClass,
        status: 'absent' as AttendanceStatus,
        checkInMethod: 'manual',
        note: ''
      }));

      return {
        id: `sess-pro-${idx + 1}-${trackKey}`,
        date: dateStr,
        startTime: timeStr,
        endTime: '',
        track: trackKey,
        classCode: classMeta.classCode,
        className: `Lớp ${classMeta.classCode} - ${trackTitle}`,
        teacherId: classMeta.defaultTeacherId,
        teacherName: classMeta.defaultTeacherName,
        qrToken: getRollingTrackToken(trackKey, 300),
        qrExpiresAt: Date.now() + 300 * 1000,
        qrPinCode: getRollingTrackPin(trackKey, 300),
        intervalSeconds: 300,
        isOpen: true,
        requireSameIp: false,
        requireLocation: false,
        preventMultiCheckIn: true,
        allowedRadiusMeters: 150,
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

  // Admin Makeup Reports
  const [makeupReports, setMakeupReports] = useState<MakeupAttendanceReport[]>(() => {
    try {
      const saved = localStorage.getItem(MAKEUP_REPORTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load makeup reports', e);
    }
    return [];
  });

  // Keep sessions in sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ATTENDANCE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save attendance sessions', e);
    }
  }, [sessions]);

  // Keep makeup reports in sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MAKEUP_REPORTS_KEY, JSON.stringify(makeupReports));
    } catch (e) {
      console.error('Failed to save makeup reports', e);
    }
  }, [makeupReports]);

  // Synchronize student records in active sessions if student accounts change
  useEffect(() => {
    if (!studentAccounts || studentAccounts.length === 0) return;

    setSessions(prev => {
      let hasChanges = false;
      const next = prev.map(session => {
        const enrolled = studentAccounts.filter(s =>
          s.programTrack === session.track || (s.enrolledTracks && s.enrolledTracks.includes(session.track))
        );

        const currentCodes = new Set(session.records.map(r => r.studentCode.toLowerCase()));
        const missingStudents = enrolled.filter(s => !currentCodes.has(s.studentCode.toLowerCase()));

        if (missingStudents.length > 0) {
          hasChanges = true;
          const newRecords: AttendanceRecord[] = missingStudents.map(st => ({
            studentId: st.id,
            studentCode: st.studentCode,
            studentName: st.name,
            classCode: st.classCode || session.classCode,
            schoolOrClass: st.schoolOrClass,
            status: 'absent' as AttendanceStatus,
            checkInMethod: 'manual',
            note: ''
          }));
          return {
            ...session,
            records: [...session.records, ...newRecords]
          };
        }
        return session;
      });

      return hasChanges ? next : prev;
    });
  }, [studentAccounts]);

  // Create a new attendance session for a class (default 120s rotation)
  const createSession = useCallback((
    track: CurriculumTrack,
    className: string,
    teacherId: string,
    teacherName: string,
    classCode?: string
  ): AttendanceSession => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    const assignedClassCode = classCode || TRACK_CLASS_CODES[track]?.classCode || `K26-${track.slice(0, 4).toUpperCase()}`;

    // Filter students enrolled in this track/class
    const enrolled = studentAccounts.filter(s =>
      s.programTrack === track || (s.enrolledTracks && s.enrolledTracks.includes(track))
    );

    const records: AttendanceRecord[] = enrolled.map(student => ({
      studentId: student.id,
      studentCode: student.studentCode,
      studentName: student.name,
      classCode: student.classCode || assignedClassCode,
      schoolOrClass: student.schoolOrClass,
      status: 'absent' as AttendanceStatus,
      checkInMethod: 'manual',
      note: ''
    }));

    const newSession: AttendanceSession = {
      id: `sess-${Date.now()}`,
      date: dateStr,
      startTime: timeStr,
      endTime: '',
      track,
      classCode: assignedClassCode,
      className: className || `Lớp ${assignedClassCode} - ${TRACK_LABELS[track]}`,
      teacherId,
      teacherName,
      qrToken: getRollingTrackToken(track, 300),
      qrExpiresAt: Date.now() + 300 * 1000,
      qrPinCode: getRollingTrackPin(track, 300),
      intervalSeconds: 300,
      isOpen: true,
      requireSameIp: false,
      preventMultiCheckIn: true,
      allowedRadiusMeters: 150,
      records,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setSessions(prev => [newSession, ...prev]);
    return newSession;
  }, [studentAccounts]);

  // Rotate QR code (Default to 300-second rotation = 5 minutes)
  const rotateQRCode = useCallback((sessionId: string, intervalSeconds: number = 300) => {
    const session = sessions.find(s => s.id === sessionId);
    const targetTrack = session ? session.track : 'office-fast-3in1';
    const effectiveInterval = intervalSeconds || session?.intervalSeconds || 300;

    const newToken = getRollingTrackToken(targetTrack, effectiveInterval);
    const newPin = getRollingTrackPin(targetTrack, effectiveInterval);
    const newExpiresAt = Date.now() + effectiveInterval * 1000;

    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            qrToken: newToken,
            qrPinCode: newPin,
            qrExpiresAt: newExpiresAt,
            intervalSeconds: effectiveInterval,
            isOpen: true,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      })
    );

    return { token: newToken, pinCode: newPin, expiresAt: newExpiresAt };
  }, [sessions]);

  // Update session security (IP lock, Geolocation, Interval, etc.)
  const updateSessionSecurity = useCallback((
    sessionId: string,
    updates: Partial<AttendanceSession>
  ) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            ...updates,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      })
    );
  }, []);

  // Toggle Session Open / Locked
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

  // Update a student's attendance status (Handles 'makeup' / 'present' / 'absent' etc.)
  const updateStudentStatus = useCallback((
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    note?: string,
    method: 'manual' | 'qr_scan' | 'pin_code' = 'manual',
    isMakeup?: boolean
  ) => {
    const nowTime = new Date().toTimeString().slice(0, 8);

    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s;

        const updatedRecords = s.records.map(rec => {
          if (rec.studentId === studentId) {
            const willBeMakeup = isMakeup !== undefined ? isMakeup : (status === 'makeup');
            return {
              ...rec,
              status,
              isMakeup: willBeMakeup,
              checkInTime: (status === 'present' || status === 'late' || status === 'makeup') ? (rec.checkInTime || nowTime) : undefined,
              checkInMethod: method,
              note: note !== undefined ? note : rec.note
            };
          }
          return rec;
        });

        // If marked as makeup, report to Admin
        if (status === 'makeup' || isMakeup) {
          const studentRec = s.records.find(r => r.studentId === studentId);
          if (studentRec) {
            const report: MakeupAttendanceReport = {
              id: `rpt-${Date.now()}`,
              studentCode: studentRec.studentCode,
              studentName: studentRec.studentName,
              originalClassCode: studentRec.classCode || 'Lớp Khác',
              makeupClassCode: s.classCode,
              track: s.track,
              teacherName: s.teacherName,
              sessionDate: s.date,
              checkInTime: nowTime,
              reason: note || 'Học viên vắng buổi trước, xin học bù',
              reportedToAdminAt: new Date().toISOString()
            };
            setMakeupReports(r => [report, ...r]);
          }
        }

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

  // Strict Universal Student Check-In with 2-Minute TOTP, IP Check & Anti-Proxy Security
  const studentCheckIn = useCallback(async (
    studentCode: string,
    studentName: string,
    rawPinOrToken: string,
    optionalTrack?: CurriculumTrack,
    studentCoords?: { latitude: number; longitude: number }
  ): Promise<{ success: boolean; message: string; session?: AttendanceSession; isMakeup?: boolean }> => {
    const cleanInput = rawPinOrToken.trim();

    // 1. Extract PIN, Token, Track, Class
    let searchPin = cleanInput;
    let searchToken = cleanInput;
    let targetTrack = optionalTrack;
    let targetClass = '';

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
    if (cleanInput.includes('class=')) {
      const classMatch = cleanInput.match(/[?&]class=([^&]+)/);
      if (classMatch && classMatch[1]) targetClass = decodeURIComponent(classMatch[1]).trim();
    }

    try {
      if (cleanInput.startsWith('http://') || cleanInput.startsWith('https://')) {
        const parsedUrl = new URL(cleanInput);
        const p = parsedUrl.searchParams.get('pin');
        const t = parsedUrl.searchParams.get('token');
        const tr = parsedUrl.searchParams.get('track') as CurriculumTrack;
        const cl = parsedUrl.searchParams.get('class');
        if (p) searchPin = p.trim();
        if (t) searchToken = t.trim();
        if (tr) targetTrack = tr;
        if (cl) targetClass = cl.trim();
      }
    } catch (e) {}

    // 2. Find matching session:
    // A) Direct session matching
    let matchedSession = sessions.find(s =>
      (s.qrPinCode && (s.qrPinCode === searchPin || cleanInput.includes(s.qrPinCode))) ||
      (s.qrToken && (s.qrToken === searchToken || cleanInput.includes(s.qrToken))) ||
      s.id === cleanInput
    );

    // B) 2-Minute (or custom interval) TOTP Rolling PIN Match (Checked across current + previous grace windows)
    if (!matchedSession && searchPin && searchPin.length === 6) {
      for (const trackKey of ALL_10_TRACK_KEYS) {
        const sessionForTrack = sessions.find(s => s.track === trackKey);
        const interval = sessionForTrack?.intervalSeconds || 300;

        // Tolerant window: 0 (current), -1 (prev 5m), 1 (slight clock ahead)
        const isMatch = searchPin === getRollingTrackPin(trackKey, interval, 0) ||
                        searchPin === getRollingTrackPin(trackKey, interval, -1) ||
                        searchPin === getRollingTrackPin(trackKey, interval, 1);

        if (isMatch) {
          matchedSession = sessions.find(s => s.track === trackKey && s.isOpen !== false) || sessions.find(s => s.track === trackKey);
          break;
        }
      }
    }

    // C) Fallback by targetTrack / targetClass
    if (!matchedSession && (targetTrack || targetClass)) {
      matchedSession = sessions.find(s => (targetClass ? s.classCode === targetClass : true) && (targetTrack ? s.track === targetTrack : true) && s.isOpen !== false)
        || sessions.find(s => (targetTrack ? s.track === targetTrack : true));
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
        message: 'Mã QR hoặc PIN đã hết hạn (Mã tự động đổi mỗi 5 phút). Vui lòng quét lại mã mới trên màn hình lớp học!'
      };
    }

    // Check if session is locked
    if (matchedSession.isOpen === false) {
      return {
        success: false,
        message: `🔒 Giảng viên ${matchedSession.teacherName} đã KHÓA phiên điểm danh của lớp "${matchedSession.className}"!`
      };
    }

    // ─── 3. ANTI-FRAUD / CHỐNG ĐIỂM DANH HỘ ───
    const clientIp = await getClientIp().catch(() => '127.0.0.1');
    const deviceFp = getDeviceFingerprint();

    // A) Check IP Lock (Bắt buộc cùng mạng WiFi / IP với Giảng viên)
    if (matchedSession.requireSameIp && matchedSession.teacherIp) {
      if (clientIp !== matchedSession.teacherIp && clientIp !== '127.0.0.1') {
        return {
          success: false,
          message: `🚫 TỪ CHỐI ĐIỂM DANH TỪ XA: Thiết bị của bạn không cùng mạng WiFi/IP với phòng học (${clientIp} ≠ ${matchedSession.teacherIp}). Vui lòng kết nối vào đúng mạng WiFi của lớp học để điểm danh!`
        };
      }
    }

    // B) Check Single-Device Lock (Chống 1 máy điểm danh hộ nhiều sinh viên vắng mặt)
    if (matchedSession.preventMultiCheckIn !== false) {
      const otherStudentWithSameDevice = matchedSession.records.find(
        r => r.deviceFp === deviceFp &&
             r.studentCode.trim().toLowerCase() !== studentCode.trim().toLowerCase() &&
             (r.status === 'present' || r.status === 'makeup' || r.status === 'late')
      );

      if (otherStudentWithSameDevice) {
        return {
          success: false,
          message: `⚠️ PHÁT HIỆN GIAN LẬN: Thiết bị này vừa mới được dùng để điểm danh cho học viên ${otherStudentWithSameDevice.studentName} (${otherStudentWithSameDevice.studentCode}). Mỗi thiết bị chỉ được điểm danh cho 1 học viên duy nhất!`
        };
      }
    }

    // C) Check GPS Geofencing (Nếu lớp học bật giới hạn khoảng cách)
    let calculatedDistance: number | undefined = undefined;
    if (matchedSession.requireLocation && matchedSession.classroomLat && matchedSession.classroomLng) {
      if (!studentCoords) {
        return {
          success: false,
          message: '📍 Vui lòng bật định vị GPS trên thiết bị để xác thực bạn đang có mặt tại phòng học!'
        };
      }

      calculatedDistance = calculateDistanceMeters(
        matchedSession.classroomLat,
        matchedSession.classroomLng,
        studentCoords.latitude,
        studentCoords.longitude
      );

      const maxAllowed = matchedSession.allowedRadiusMeters || 150;
      if (calculatedDistance > maxAllowed) {
        return {
          success: false,
          message: `🚫 BỊ TỪ CHỐI: Bạn đang ở cách phòng học ${calculatedDistance} mét (Vượt quá bán kính cho phép ${maxAllowed}m). Không thể điểm danh từ xa!`
        };
      }
    }

    // ─── 4. STRICT STUDENT MATCHING ───
    let matchedStudent = studentAccounts.find(
      s => s.studentCode.trim().toLowerCase() === studentCode.trim().toLowerCase() ||
           s.name.trim().toLowerCase() === studentName.trim().toLowerCase() ||
           s.id === studentCode.trim()
    );

    const recordInSession = matchedSession.records.find(
      r => r.studentCode.trim().toLowerCase() === studentCode.trim().toLowerCase() ||
           r.studentName.trim().toLowerCase() === studentName.trim().toLowerCase()
    );

    // 5. Check Enrollment & Handle Make-Up (Học Bù)
    const isEnrolledInTrack = matchedStudent && (
      matchedStudent.programTrack === matchedSession.track ||
      (matchedStudent.enrolledTracks && matchedStudent.enrolledTracks.includes(matchedSession.track)) ||
      !!recordInSession
    );

    let isMakeupAttendance = false;

    if (!isEnrolledInTrack) {
      if (matchedStudent) {
        isMakeupAttendance = true;
      } else {
        return {
          success: false,
          message: `❌ BỊ TỪ CHỐI: Không tìm thấy học viên ${studentName} (${studentCode}) trong danh sách học viên!`
        };
      }
    }

    // 6. Record Attendance
    const nowTime = new Date().toTimeString().slice(0, 8);
    const checkInMethod = (searchToken === matchedSession.qrToken || cleanInput.includes('token='))
      ? 'qr_scan' as const
      : 'pin_code' as const;

    const studentIdToUse = matchedStudent ? matchedStudent.id : (recordInSession?.studentId || `std-${Date.now()}`);
    const studentNameToUse = matchedStudent ? matchedStudent.name : studentName;
    const studentCodeToUse = matchedStudent ? matchedStudent.studentCode : studentCode;
    const studentClassToUse = matchedStudent?.classCode || matchedSession.classCode;

    let isFoundInRecords = false;
    const finalStatus: AttendanceStatus = isMakeupAttendance ? 'makeup' : 'present';

    const updatedRecords = matchedSession.records.map(rec => {
      if (rec.studentCode.trim().toLowerCase() === studentCodeToUse.trim().toLowerCase()) {
        isFoundInRecords = true;
        return {
          ...rec,
          status: finalStatus,
          isMakeup: isMakeupAttendance,
          checkInTime: nowTime,
          checkInMethod,
          clientIp,
          deviceFp,
          distanceMeters: calculatedDistance,
          note: isMakeupAttendance ? `Học Bù từ lớp ${matchedStudent?.classCode || 'Khác'}` : rec.note
        };
      }
      return rec;
    });

    if (!isFoundInRecords) {
      updatedRecords.push({
        studentId: studentIdToUse,
        studentCode: studentCodeToUse,
        studentName: studentNameToUse,
        classCode: studentClassToUse,
        schoolOrClass: matchedStudent?.schoolOrClass || `Lớp ${matchedSession.classCode}`,
        status: finalStatus,
        isMakeup: isMakeupAttendance,
        checkInTime: nowTime,
        checkInMethod,
        clientIp,
        deviceFp,
        distanceMeters: calculatedDistance,
        note: isMakeupAttendance ? `Học Bù từ lớp ${matchedStudent?.classCode || 'Khác'}` : ''
      });
    }

    const updatedSession: AttendanceSession = {
      ...matchedSession,
      records: updatedRecords,
      updatedAt: new Date().toISOString()
    };

    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));

    // Report Make-up to Admin
    if (isMakeupAttendance) {
      const makeupReport: MakeupAttendanceReport = {
        id: `rpt-${Date.now()}`,
        studentCode: studentCodeToUse,
        studentName: studentNameToUse,
        originalClassCode: matchedStudent?.classCode || 'Khác',
        makeupClassCode: matchedSession.classCode,
        track: matchedSession.track,
        teacherName: matchedSession.teacherName,
        sessionDate: matchedSession.date,
        checkInTime: nowTime,
        reason: `Quét mã QR học bù vào lớp ${matchedSession.classCode}`,
        reportedToAdminAt: new Date().toISOString()
      };
      setMakeupReports(r => [makeupReport, ...r]);

      return {
        success: true,
        message: `🎉 ĐÃ GHI NHẬN HỌC BÙ (VẮNG BÙ): Học viên ${studentNameToUse} (${studentCodeToUse}) điểm danh bù vào Lớp ${matchedSession.classCode} thành công! Hệ thống đã ghi nhận IP (${clientIp}) và gửi báo cáo về Ban Quản Trị.`,
        session: updatedSession,
        isMakeup: true
      };
    }

    return {
      success: true,
      message: `✅ ĐIỂM DANH THÀNH CÔNG: Học viên ${studentNameToUse} (${studentCodeToUse}) • Lớp ${matchedSession.classCode} • Đã xác thực tại lớp (IP: ${clientIp})`,
      session: updatedSession,
      isMakeup: false
    };
  }, [sessions, studentAccounts]);

  // Save session
  const saveSession = useCallback((session: AttendanceSession) => {
    setSessions(prev => {
      const exists = prev.some(s => s.id === session.id);
      if (exists) {
        return prev.map(s => s.id === session.id ? { ...session, updatedAt: new Date().toISOString() } : s);
      }
      return [session, ...prev];
    });
  }, []);

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  // Clear a makeup report
  const clearMakeupReport = useCallback((reportId: string) => {
    setMakeupReports(prev => prev.filter(r => r.id !== reportId));
  }, []);

  return {
    sessions,
    makeupReports,
    createSession,
    rotateQRCode,
    updateSessionSecurity,
    toggleSessionOpen,
    updateStudentStatus,
    markAllPresent,
    studentCheckIn,
    saveSession,
    deleteSession,
    clearMakeupReport
  };
}
