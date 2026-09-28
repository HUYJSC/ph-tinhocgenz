/**
 * POST /api/attendance/check
 * Enterprise Student Attendance Verification Engine
 * Strictly typed (No any, No @ts-ignore)
 * Integrated with Prisma ORM and Vercel Serverless
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors.js';
import {
  type AttendanceRequest,
  CLASSROOM_LOCATION,
  calculateHaversineDistanceMeters,
  validateDynamicQRToken,
  isAlreadyCheckedIn,
  recordAttendance
} from '../_lib/attendanceUtils.js';

export type { AttendanceRequest };

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void | VercelResponse> {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      message: 'Chỉ chấp nhận phương thức POST'
    });
  }

  try {
    const rawBody = req.body;
    const body: AttendanceRequest = typeof rawBody === 'string' ? JSON.parse(rawBody) : (rawBody || {});

    const userId = body.studentId || body.user_id;
    const classId = body.classId || body.class_id;
    const studentCode = body.studentCode || body.student_code || 'THGZ01';
    const studentName = body.studentName || body.student_name || 'Học viên';
    const qrToken = body.qrToken || body.qr_token;
    const pinCode = body.pinCode || body.pin_code;
    const timestamp = body.timestamp;

    const lat = body.coords?.latitude ?? body.latitude;
    const lng = body.coords?.longitude ?? body.longitude;

    // 1. Validate required identity fields
    if (!userId || !classId) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Thiếu thông tin bắt buộc: studentId và classId'
      });
    }

    // 2. Validate credentials (must provide either QR token or PIN code)
    if (!qrToken && !pinCode) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_CREDENTIALS',
        message: 'Vui lòng cung cấp mã QR hoặc mã PIN 6 số'
      });
    }

    const checkInMethod: 'QR_CODE' | 'PIN_CODE' = qrToken ? 'QR_CODE' : 'PIN_CODE';
    const now = Date.now();

    // 3. Reject stale timestamp if provided (> 60 seconds old)
    if (timestamp && Math.abs(now - timestamp) > 60000) {
      return res.status(400).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Mã xác thực đã hết hạn, vui lòng thử lại'
      });
    }

    // 4. Validate dynamic rolling QR token freshness
    if (qrToken) {
      const qrValidation = validateDynamicQRToken(qrToken, 60000);
      if (!qrValidation.valid) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_QR_TOKEN',
          message: qrValidation.reason || 'Mã QR không hợp lệ hoặc đã hết hạn'
        });
      }
    }

    // 5. Validate GPS Geofence radius (Strict <= 5.0m)
    let calculatedDistance: number | undefined = undefined;
    if (lat !== undefined && lng !== undefined) {
      calculatedDistance = calculateHaversineDistanceMeters(
        lat,
        lng,
        CLASSROOM_LOCATION.latitude,
        CLASSROOM_LOCATION.longitude
      );

      // If outside classroom radius (> 5.0 meters)
      if (calculatedDistance > CLASSROOM_LOCATION.maxRadiusMeters) {
        return res.status(403).json({
          success: false,
          code: 'OUTSIDE_GEOFENCE',
          message: `Vị trí của bạn nằm ngoài bán kính lớp học (${calculatedDistance.toFixed(1)}m > ${CLASSROOM_LOCATION.maxRadiusMeters}m). Vui lòng có mặt tại phòng LAB.`,
          distance: Math.round(calculatedDistance * 10) / 10
        });
      }
    }

    // 6. Duplicate check-in prevention (Checks Prisma attendance session)
    const todayIso = new Date().toISOString().split('T')[0];
    const alreadyChecked = await isAlreadyCheckedIn(userId, classId, todayIso);
    if (alreadyChecked) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_CHECKIN',
        message: 'Bạn đã được ghi nhận điểm danh trong ca học này'
      });
    }

    // 7. Record Attendance in Prisma Database / Serverless safe cache
    const ipHeader = req.headers['x-forwarded-for'];
    const clientIp = Array.isArray(ipHeader) ? ipHeader[0] : (ipHeader ? ipHeader.split(',')[0].trim() : undefined);
    const userAgent = req.headers['user-agent'] as string | undefined;

    await recordAttendance({
      userId,
      classId,
      method: checkInMethod,
      lat,
      lng,
      distanceM: calculatedDistance ? Math.round(calculatedDistance * 10) / 10 : undefined,
      ipAddress: clientIp,
      userAgent
    });

    const checkInTimeFormatted = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());

    return res.status(200).json({
      success: true,
      message: 'Điểm danh thành công',
      data: {
        userId,
        studentCode,
        studentName,
        classId,
        status: 'present',
        room: 'LAB01',
        checkedInAt: checkInTimeFormatted,
        method: checkInMethod === 'QR_CODE' ? 'qr' : 'pin'
      }
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown server error';
    console.error('Attendance check endpoint error:', errorMsg);
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Lỗi máy chủ khi xử lý điểm danh'
    });
  }
}
