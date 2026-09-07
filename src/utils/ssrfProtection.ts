/**
 * BẢO MẬT HỆ THỐNG: CHỐNG SSRF (SERVER-SIDE REQUEST FORGERY)
 * PH DIGITAL EDUCATION — CYBERSECURITY LAYER
 */

export interface SSRFValidationResult {
  safe: boolean;
  reason?: string;
  normalizedUrl?: string;
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'instance-data',
  '169.254.169.254' // Cloud metadata (AWS, GCP, Azure, DigitalOcean)
]);

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Kiểm tra địa chỉ IPv4 có thuộc dải mạng nội bộ (Private / Loopback / Link-local) không
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(isNaN)) return false;

  const [b0, b1] = parts;

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true;

  // 10.0.0.0/8 (Private Network)
  if (b0 === 10) return true;

  // 172.16.0.0/12 (Private Network: 172.16.0.0 - 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.168.0.0/16 (Private Network)
  if (b0 === 192 && b1 === 168) return true;

  // 169.254.0.0/16 (Link-local / Cloud Metadata)
  if (b0 === 169 && b1 === 254) return true;

  // 0.0.0.0/8 (Current network)
  if (b0 === 0) return true;

  return false;
}

/**
 * Xác thực URL an toàn trước khi thực hiện thu thập hoặc đồng bộ học liệu
 */
export function validateSafeUrlForFetch(urlStr: string, allowedDomains?: string[]): SSRFValidationResult {
  if (!urlStr || typeof urlStr !== 'string') {
    return { safe: false, reason: 'URL không được để trống.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr.trim());
  } catch {
    return { safe: false, reason: 'Định dạng URL không hợp lệ.' };
  }

  // 1. Giao thức chỉ cho phép HTTP hoặc HTTPS
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return {
      safe: false,
      reason: `Giao thức ${parsed.protocol} bị chặn vì lý do an toàn. Chỉ chấp nhận HTTP/HTTPS.`
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Chặn các hostname cấm (localhost, cloud metadata, ...)
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      safe: false,
      reason: `Tên miền '${hostname}' thuộc danh sách chặn bảo mật SSRF.`
    };
  }

  // 3. Chặn IP riêng tư nếu hostname là IP
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      return {
        safe: false,
        reason: `Địa chỉ IP '${hostname}' là địa chỉ mạng nội bộ / loopback không hợp lệ.`
      };
    }
  }

  // 4. Nếu có cấu hình whitelist allowedDomains
  if (allowedDomains && allowedDomains.length > 0) {
    const isDomainAllowed = allowedDomains.some(domain => {
      const cleanDomain = domain.toLowerCase().trim();
      return hostname === cleanDomain || hostname.endsWith('.' + cleanDomain);
    });

    if (!isDomainAllowed) {
      return {
        safe: false,
        reason: `Tên miền '${hostname}' không nằm trong danh sách tên miền được phép (${allowedDomains.join(', ')}).`
      };
    }
  }

  return {
    safe: true,
    normalizedUrl: parsed.toString()
  };
}

/**
 * Giới hạn dung lượng và thời gian tải
 */
export const SSRF_CONFIG = {
  TIMEOUT_MS: 10000, // 10 giây
  MAX_RESPONSE_BYTES: 5 * 1024 * 1024, // 5 MB
  MAX_REDIRECTS: 3
};
