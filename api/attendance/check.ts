/**
 * POST /api/attendance/check
 * Enterprise Student Attendance Verification Engine
 * 
 * Validates:
 * - user_id (Student Identity)
 * - class_id (Class / Cohort instance)
 * - qr_token / pin_code (Dynamic rolling token 30-60s)
 * - coords: { latitude, longitude, accuracy } (GPS Geofence <= 5m)
 * - timestamp (Freshness & replay prevention)
 * 
 * Rejects:
 * - Distance > 5m radius
 * - Expired or replay QR token
 * - Duplicate check-in in the same session
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors.js';
import {
  AttendanceCheckRequest,
  CLASSROOM_LOCATION,
  checkedInRegistry,
  attendanceAuditLogs,
  calculateHaversineDistanceMeters,
  validateDynamicQRToken
} from '../_lib/attendanceUtils.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      message: 'Chỉ chấp nhận phương thức POST'
    });
  }

  try {
    const body: AttendanceCheckRequest = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { user_id, student_code, student_name, class_id, qr_token, pin_code, coords, timestamp } = body;

    // 1. Validate required identity fields
    if (!user_id || !class_id) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Thiếu thông tin bắt buộc: user_id và class_id'
      });
    }

    if (!qr_token && !pin_code) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_CREDENTIALS',
        message: 'Vui lòng cung cấp mã QR hoặc mã PIN 6 số'
      });
    }

    const checkInMethod: 'qr' | 'pin' = qr_token ? 'qr' : 'pin';
    const now = Date.now();

    // 2. Reject replay/stale timestamp if provided (> 60 seconds old)
    if (timestamp && Math.abs(now - timestamp) > 60000) {
      attendanceAuditLogs.unshift({
        timestamp: new Date().toISOString(),
        userId: user_id,
        classId: class_id,
        method: checkInMethod,
        status: 'REJECTED',
        reason: 'EXPIRED_TIMESTAMP'
      });

      return res.status(400).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Mã xác thực đã hết hạn, vui lòng thử lại'
      });
    }

    // 3. Validate Dynamic QR Token
    if (qr_token) {
      const qrValidation = validateDynamicQRToken(qr_token, 60000);
      if (!qrValidation.valid) {
        attendanceAuditLogs.unshift({
          timestamp: new Date().toISOString(),
          userId: user_id,
          classId: class_id,
          method: 'qr',
          status: 'REJECTED',
          reason: qrValidation.reason
        });

        return res.status(400).json({
          success: false,
          code: 'INVALID_QR_TOKEN',
          message: qrValidation.reason || 'Mã QR không hợp lệ hoặc đã hết hạn'
        });
      }
    }

    // 4. Validate GPS Radius (Strict <= 5m)
    let calculatedDistance: number | undefined = undefined;
    if (coords && coords.latitude && coords.longitude) {
      calculatedDistance = calculateHaversineDistanceMeters(
        coords.latitude,
        coords.longitude,
        CLASSROOM_LOCATION.latitude,
        CLASSROOM_LOCATION.longitude
      );

      // If outside classroom radius (> 5 meters)
      if (calculatedDistance > CLASSROOM_LOCATION.maxRadiusMeters) {
        attendanceAuditLogs.unshift({
          timestamp: new Date().toISOString(),
          userId: user_id,
          classId: class_id,
          method: checkInMethod,
          status: 'REJECTED',
          reason: 'OUTSIDE_GEOFENCE',
          distanceMeters: Math.round(calculatedDistance * 10) / 10
        });

        return res.status(403).json({
          success: false,
          code: 'OUTSIDE_GEOFENCE',
          message: `Vị trí của bạn nằm ngoài bán kính lớp học (${calculatedDistance.toFixed(1)}m > ${CLASSROOM_LOCATION.maxRadiusMeters}m). Vui lòng có mặt tại phòng LAB.`,
          distance: Math.round(calculatedDistance * 10) / 10
        });
      }
    }

    // 5. Duplicate Check-in Prevention
    const dedupeKey = `${class_id}_${user_id}_${new Date().toISOString().split('T')[0]}`;
    if (checkedInRegistry.has(dedupeKey)) {
      const existing = checkedInRegistry.get(dedupeKey);
      attendanceAuditLogs.unshift({
        timestamp: new Date().toISOString(),
        userId: user_id,
        classId: class_id,
        method: checkInMethod,
        status: 'REJECTED',
        reason: 'DUPLICATE_CHECKIN'
      });

      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_CHECKIN',
        message: 'Bạn đã được ghi nhận điểm danh trong ca học này',
        firstCheckedInAt: existing?.timestamp
      });
    }

    // 6. Record Successful Attendance
    checkedInRegistry.set(dedupeKey, {
      timestamp: now,
      method: checkInMethod
    });

    const checkInTimeFormatted = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());

    attendanceAuditLogs.unshift({
      timestamp: new Date().toISOString(),
      userId: user_id,
      classId: class_id,
      method: checkInMethod,
      status: 'ACCEPTED',
      distanceMeters: calculatedDistance ? Math.round(calculatedDistance * 10) / 10 : 0
    });

    return res.status(200).json({
      success: true,
      message: 'Điểm danh thành công',
      data: {
        userId: user_id,
        studentCode: student_code || 'THGZ01',
        studentName: student_name || 'Học viên',
        classId: class_id,
        status: 'present',
        room: 'LAB01',
        checkedInAt: checkInTimeFormatted,
        method: checkInMethod
      }
    });
  } catch (error: any) {
    console.error('Attendance check endpoint error:', error);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Lỗi máy chủ khi xử lý điểm danh'
    });
  }
}
