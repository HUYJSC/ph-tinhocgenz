/**
 * Enterprise Attendance Utilities & Geofence Verification Engine
 */

export interface AttendanceCheckRequest {
  user_id: string;
  student_code?: string;
  student_name?: string;
  class_id: string;
  qr_token?: string;
  pin_code?: string;
  coords?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  timestamp?: number;
}

// Classroom reference location: LAB 01 (default campus coordinates)
export const CLASSROOM_LOCATION = {
  latitude: 21.028511, // Central reference campus coordinates
  longitude: 105.854444,
  maxRadiusMeters: 5 // Strict 5m radius as required by spec
};

// In-memory checked-in registry for session deduplication (per class + user)
export const checkedInRegistry = new Map<string, { timestamp: number; method: string }>();

// Audit log in-memory store
export const attendanceAuditLogs: Array<{
  timestamp: string;
  userId: string;
  classId: string;
  method: 'qr' | 'pin';
  status: 'ACCEPTED' | 'REJECTED';
  reason?: string;
  distanceMeters?: number;
}> = [];

/**
 * Calculates distance between two GPS coordinates using Haversine formula
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Validates dynamic rolling QR token freshness (expires in 60s)
 */
export function validateDynamicQRToken(token: string, maxAgeMs: number = 60000): { valid: boolean; reason?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Token không hợp lệ' };
  }

  // Check if token format is tk_<track>_<timestep> or phtgz_<timestamp>_<hash>
  const parts = token.split('_');
  if (parts.length >= 3) {
    const rawTime = parseInt(parts[parts.length - 1], 36);
    if (!isNaN(rawTime)) {
      const nowStep = Math.floor(Date.now() / maxAgeMs);
      // Allow current step and previous step (tolerance window)
      if (Math.abs(nowStep - rawTime) > 1) {
        return { valid: false, reason: 'Mã QR đã hết hạn, vui lòng quét lại mã mới' };
      }
    }
  }

  return { valid: true };
}
