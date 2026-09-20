/**
 * BẢO MẬT HỆ THỐNG: CHỐNG SSRF (SERVER-SIDE REQUEST FORGERY)
 * Serverless Lib Layer
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
  '169.254.169.254'
]);

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export function isPrivateOrReservedIp(ip: string): boolean {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(isNaN)) return false;

  const [b0, b1] = parts;

  if (b0 === 127) return true;
  if (b0 === 10) return true;
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;
  if (b0 === 192 && b1 === 168) return true;
  if (b0 === 169 && b1 === 254) return true;
  if (b0 === 0) return true;

  return false;
}

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

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return {
      safe: false,
      reason: `Giao thức ${parsed.protocol} bị chặn vì lý do an toàn. Chỉ chấp nhận HTTP/HTTPS.`
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      safe: false,
      reason: `Tên miền '${hostname}' thuộc danh sách chặn bảo mật SSRF.`
    };
  }

  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      return {
        safe: false,
        reason: `Địa chỉ IP '${hostname}' là địa chỉ mạng nội bộ / loopback không hợp lệ.`
      };
    }
  }

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

