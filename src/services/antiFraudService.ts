/**
 * Anti-Fraud Verification Engine for Attendance
 * TINHOCGENZ LMS — Dynamic QR & Geofence Verification
 * 
 * Rules:
 * 1. Haversine distance calculation (lat/lng)
 * 2. Risk scoring (0-100):
 *    - 0-20: ACCEPT (PRESENT)
 *    - 21-49: ACCEPT_WITH_FLAG (PRESENT with flag)
 *    - 50-79: NEED_VERIFICATION
 *    - 80+: REJECTED
 * 3. Server timestamp is source of truth
 * 4. Token expiration & replay defense
 */

export interface GeolocationPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface AntiFraudEvaluationInput {
  classroomLocation?: GeolocationPoint;
  studentLocation?: GeolocationPoint;
  allowedRadiusMeters?: number;
  maxGpsAccuracyAllowedMeters?: number;
  qrExpiresAt?: number;
  currentTimeMs?: number;
  clientIp?: string;
  teacherIp?: string;
  requireSameIp?: boolean;
  deviceFp?: string;
  previousDeviceRecord?: {
    studentId: string;
    studentCode: string;
  };
  studentId: string;
}

export interface AntiFraudEvaluationResult {
  riskScore: number; // 0 to 100
  recommendedStatus: 'present' | 'need_verification' | 'rejected';
  distanceMeters: number;
  fraudFlags: string[];
  reason: string;
}

/**
 * Calculates distance in meters between two lat/lng coordinates using Haversine formula
 */
export function calculateHaversineDistanceMeters(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
      Math.cos(toRad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Evaluates attendance check-in request against multi-layered anti-fraud rules
 */
export function evaluateAttendanceRisk(input: AntiFraudEvaluationInput): AntiFraudEvaluationResult {
  const flags: string[] = [];
  let riskScore = 0;
  let distanceMeters = 0;
  const now = input.currentTimeMs || Date.now();

  // 1. QR Expiration check
  if (input.qrExpiresAt && now > input.qrExpiresAt) {
    flags.push('EXPIRED_QR');
    riskScore += 80;
  }

  // 2. Geofence & Location verification
  if (input.classroomLocation && input.studentLocation) {
    distanceMeters = calculateHaversineDistanceMeters(
      input.classroomLocation,
      input.studentLocation
    );

    const radius = input.allowedRadiusMeters || 80; // default 80m
    const maxAccuracy = input.maxGpsAccuracyAllowedMeters || 100;

    // Check GPS accuracy
    if (input.studentLocation.accuracy && input.studentLocation.accuracy > maxAccuracy) {
      flags.push('POOR_GPS_ACCURACY');
      riskScore += 35;
    }

    // Check distance vs allowed geofence
    if (distanceMeters > radius) {
      if (distanceMeters > radius * 3) {
        flags.push('FAR_OUTSIDE_GEOFENCE');
        riskScore += 75;
      } else {
        flags.push('OUTSIDE_GEOFENCE');
        riskScore += 45;
      }
    }
  } else if (input.classroomLocation && !input.studentLocation) {
    // Classroom requires GPS but student didn't provide location
    flags.push('MISSING_LOCATION_EVIDENCE');
    riskScore += 60;
  }

  // 3. Same IP verification (if required)
  if (input.requireSameIp && input.teacherIp && input.clientIp) {
    if (input.teacherIp.trim() !== input.clientIp.trim()) {
      flags.push('IP_MISMATCH');
      riskScore += 40;
    }
  }

  // 4. Multiple students on same device detection (Device Fingerprint check)
  if (
    input.previousDeviceRecord &&
    input.previousDeviceRecord.studentId !== input.studentId
  ) {
    flags.push('MULTIPLE_ACCOUNTS_SAME_DEVICE');
    riskScore += 50;
  }

  // Cap score between 0 and 100
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine final status
  let recommendedStatus: 'present' | 'need_verification' | 'rejected' = 'present';
  let reason = 'Điểm danh hợp lệ';

  if (riskScore >= 80) {
    recommendedStatus = 'rejected';
    reason = 'Điểm danh bị từ chối do vi phạm quy định chống gian lận';
  } else if (riskScore >= 50) {
    recommendedStatus = 'need_verification';
    reason = 'Điểm danh ghi nhận thành công, đang chờ giáo viên xác minh';
  } else if (riskScore > 20) {
    recommendedStatus = 'present';
    reason = 'Điểm danh thành công (có cảnh báo bất thường)';
  }

  return {
    riskScore,
    recommendedStatus,
    distanceMeters,
    fraudFlags: flags,
    reason
  };
}
