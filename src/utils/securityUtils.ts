/**
 * Security & Anti-Fraud Utilities for Smart Attendance
 * Supports: IP Matching (Same WiFi), GPS Geofencing, and Device Locking.
 */

// Cache client IP in memory for 1 minute to avoid spamming public IP APIs
let cachedIp: string | null = null;
let lastIpFetchTime = 0;

export async function getClientIp(): Promise<string> {
  const now = Date.now();
  if (cachedIp && now - lastIpFetchTime < 60000) {
    return cachedIp;
  }

  const fetchWithTimeout = async (url: string, timeoutMs: number = 3500): Promise<string> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data.ip || data.query || data.origin || '').split(',')[0].trim();
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  const providers = [
    'https://api.ipify.org?format=json',
    'https://api64.ipify.org?format=json',
    'https://ipapi.co/json/',
    'https://api.my-ip.io/v2/ip.json'
  ];

  for (const url of providers) {
    try {
      const ip = await fetchWithTimeout(url);
      if (ip && ip.length >= 7) {
        cachedIp = ip;
        lastIpFetchTime = now;
        return ip;
      }
    } catch (err) {
      // try next provider
    }
  }

  return '127.0.0.1';
}

/**
 * Get or create unique anonymous device fingerprint
 */
export function getDeviceFingerprint(): string {
  const KEY = 'phtinhocgenz_device_fp_v1';
  let fp = localStorage.getItem(KEY);
  if (!fp) {
    fp = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(KEY, fp);
  }
  return fp;
}

/**
 * Calculate distance in meters between two GPS coordinates using Haversine formula
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Get current browser GPS location with Promise
 */
export function getCurrentCoordinates(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Thiết bị không hỗ trợ GPS Định vị.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let msg = 'Không thể lấy tọa độ GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Vui lòng cấp quyền truy cập Vị trí (GPS) trên trình duyệt để xác thực đang ở lớp học.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Thông tin vị trí không khả dụng.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Hết thời gian lấy tọa độ GPS.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 10000
      }
    );
  });
}
