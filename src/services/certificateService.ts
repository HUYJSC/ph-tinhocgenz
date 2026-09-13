import { DigitalCertificate } from '../types/edtech';
import { CurriculumTrack, TRACK_LABELS } from '../types/auth';
import { CertificateTemplate, IssueCertificatePayload, UpdateCertificatePayload } from '../types/certificateTemplate';

const STORAGE_KEY_CERTS = 'phtinhocgenz_digital_certificates_v1';
const STORAGE_KEY_TEMPLATES = 'phtinhocgenz_cert_templates_v1';
const ISSUER_PUBLIC_KEY = 'PH-DIGITAL-EDU-ISSUER-2026-TGZ';

// ─── SHA-256 Polyfill using Web Crypto API ─────────────────────────────────
export async function sha256Hex(message: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (_) {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const base = Math.abs(hash).toString(16).padStart(8, '0');
    return base.repeat(8).substring(0, 64);
  }
}

// ─── Deterministic Ethereum-like Tx Hash (without real network) ────────────
export function generateTxHash(certId: string, salt: string): string {
  const input = `${certId}::${salt}::${ISSUER_PUBLIC_KEY}`;
  let h = 0xcafebabe;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 0x9e3779b9);
    h ^= h >>> 16;
  }
  const hex = (Math.abs(h) >>> 0).toString(16).padStart(8, '0');
  return `0x${hex.repeat(8).substring(0, 64)}`;
}

export function generateBlockHeight(certId: string): number {
  const seed = certId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 45_000_000 + (seed % 1_000_000);
}

export interface BlockchainProof {
  certHash: string;           // SHA-256 of canonical cert payload
  txHash: string;             // On-chain transaction hash (anchored)
  blockHeight: number;        // Polygon block height
  network: string;            // Network name
  contractAddress: string;    // SBT Smart Contract address
  issuerKey: string;          // Public key of issuer
  anchoredAt: string;         // ISO timestamp of on-chain anchor
  merkleLeaf: string;         // Merkle leaf input (readable)
}

// ─── HỆ THỐNG KHUNG MẪU MẶC ĐỊNH (SYSTEM PRE-BUILT TEMPLATES) ─────────────
export const DEFAULT_SYSTEM_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'tpl-royal-gold',
    name: 'Khung Hoàng Gia Gold - Viện Tin Học Gen Z (Chuẩn Khảo Thí)',
    description: 'Khung phôi sang trọng viền vàng đôi hoàng gia, phù điêu bảo an và hoa văn guilloche khảo thí chính thức.',
    aspectRatio: 'landscape_a4',
    isDefault: true,
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-13T00:00:00.000Z',
    fields: {
      title: {
        x: 50, y: 19, fontSize: 32, fontWeight: '900', color: '#b45309',
        fontFamily: 'Playfair Display', align: 'center', visible: true, uppercase: true,
        letterSpacing: '0.12em', prefix: 'GIẤY CHỨNG NHẬN TỐT NGHIỆP'
      },
      subtitle: {
        x: 50, y: 26, fontSize: 14, fontWeight: '500', color: '#64748b',
        fontFamily: 'Inter', align: 'center', visible: true,
        prefix: 'Hội đồng Khảo thí & Đào tạo Công Nghệ Tin Học Gen Z trân trọng công nhận học viên:'
      },
      studentName: {
        x: 50, y: 36, fontSize: 38, fontWeight: '900', color: '#1e3a8a',
        fontFamily: 'Playfair Display', align: 'center', visible: true, uppercase: true,
        letterSpacing: '0.04em'
      },
      studentCode: {
        x: 50, y: 44, fontSize: 13, fontWeight: '600', color: '#475569',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Mã định danh học viên: ', suffix: ''
      },
      courseTitle: {
        x: 50, y: 53, fontSize: 24, fontWeight: '800', color: '#92400e',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'ĐÃ HOÀN THÀNH XUẤT SẮC CHƯƠNG TRÌNH: ', uppercase: true
      },
      finalScore: {
        x: 35, y: 62, fontSize: 15, fontWeight: '700', color: '#047857',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Điểm đánh giá: ', suffix: ' / 100'
      },
      honorsTitle: {
        x: 65, y: 62, fontSize: 15, fontWeight: '800', color: '#b45309',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Xếp loại: '
      },
      issueDate: {
        x: 20, y: 77, fontSize: 13, fontWeight: '600', color: '#475569',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Ngày cấp: '
      },
      certificateId: {
        x: 20, y: 82, fontSize: 12, fontWeight: '700', color: '#2563eb',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Số hiệu: '
      },
      qrCode: {
        x: 50, y: 78, fontSize: 12, color: '#0f172a',
        visible: true, size: 76
      },
      signatoryLeftTitle: {
        x: 20, y: 88, fontSize: 11, fontWeight: '600', color: '#64748b',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'PHÒNG KHẢO THÍ SỐ'
      },
      signatoryLeftName: {
        x: 20, y: 92, fontSize: 12, fontWeight: '700', color: '#1e293b',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Ban Khảo Thí Tin Học'
      },
      signatoryRightTitle: {
        x: 80, y: 76, fontSize: 13, fontWeight: '700', color: '#475569',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'GIÁM ĐỐC TRUNG TÂM'
      },
      signatoryRightName: {
        x: 80, y: 92, fontSize: 14, fontWeight: '800', color: '#1e293b',
        fontFamily: 'Playfair Display', align: 'center', visible: true, prefix: 'ThS. Đinh Huy'
      },
      organization: {
        x: 50, y: 11, fontSize: 12, fontWeight: '800', color: '#b45309',
        fontFamily: 'Inter', align: 'center', visible: true, uppercase: true,
        letterSpacing: '0.18em', prefix: 'CÔNG TY TNHH PH – TIN HỌC GEN Z • VIỆN ĐÀO TẠO KỸ NĂNG SỐ'
      }
    }
  },
  {
    id: 'tpl-global-blue',
    name: 'Khung Quốc Tế MOS & IC3 (Global Tech Blue)',
    description: 'Phong cách chứng chỉ quốc tế công nghệ cao, dải màu xanh navy sắc nét, phù hợp các kỳ thi Tin học Văn phòng MOS và CNTT Cơ bản.',
    aspectRatio: 'landscape_a4',
    isDefault: false,
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-13T00:00:00.000Z',
    fields: {
      title: {
        x: 50, y: 18, fontSize: 34, fontWeight: '900', color: '#1e40af',
        fontFamily: 'Inter', align: 'center', visible: true, uppercase: true,
        letterSpacing: '0.08em', prefix: 'CERTIFICATE OF ACHIEVEMENT'
      },
      subtitle: {
        x: 50, y: 25, fontSize: 13, fontWeight: '500', color: '#475569',
        fontFamily: 'Inter', align: 'center', visible: true,
        prefix: 'This is proudly presented to verify the competency and outstanding completion of:'
      },
      studentName: {
        x: 50, y: 35, fontSize: 40, fontWeight: '900', color: '#0f172a',
        fontFamily: 'Inter', align: 'center', visible: true, uppercase: true,
        letterSpacing: '0.02em'
      },
      studentCode: {
        x: 50, y: 43, fontSize: 12, fontWeight: '600', color: '#64748b',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Student ID: '
      },
      courseTitle: {
        x: 50, y: 52, fontSize: 24, fontWeight: '800', color: '#2563eb',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'PROGRAM: ', uppercase: true
      },
      finalScore: {
        x: 35, y: 61, fontSize: 15, fontWeight: '700', color: '#059669',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Assessment Score: ', suffix: '/100'
      },
      honorsTitle: {
        x: 65, y: 61, fontSize: 15, fontWeight: '800', color: '#d97706',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Distinction: '
      },
      issueDate: {
        x: 22, y: 77, fontSize: 12, fontWeight: '600', color: '#64748b',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Date of Issue: '
      },
      certificateId: {
        x: 22, y: 82, fontSize: 12, fontWeight: '700', color: '#1e40af',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Credential ID: '
      },
      qrCode: {
        x: 50, y: 78, fontSize: 12, color: '#0f172a',
        visible: true, size: 72
      },
      signatoryLeftTitle: {
        x: 22, y: 88, fontSize: 11, fontWeight: '600', color: '#64748b',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'TESTING COMMISSION'
      },
      signatoryLeftName: {
        x: 22, y: 92, fontSize: 12, fontWeight: '700', color: '#1e293b',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Digital Assessment Board'
      },
      signatoryRightTitle: {
        x: 78, y: 76, fontSize: 13, fontWeight: '700', color: '#475569',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'ACADEMIC DIRECTOR'
      },
      signatoryRightName: {
        x: 78, y: 92, fontSize: 14, fontWeight: '800', color: '#1e293b',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Dinh Huy, M.Sc.'
      },
      organization: {
        x: 50, y: 11, fontSize: 12, fontWeight: '800', color: '#1d4ed8',
        fontFamily: 'Inter', align: 'center', visible: true, uppercase: true,
        letterSpacing: '0.15em', prefix: 'PH DIGITAL EDUCATION • INTERNATIONAL TESTING CENTER'
      }
    }
  },
  {
    id: 'tpl-modern-minimal',
    name: 'Khung Hiện Đại Tối Giản (Modern Minimalist)',
    description: 'Thiết kế tinh gọn, trang nhã theo phong cách Thụy Sĩ, đường nét chuẩn mực, phù hợp các khóa đào tạo ngắn hạn và chuyên đề nâng cao.',
    aspectRatio: 'landscape_a4',
    isDefault: false,
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-13T00:00:00.000Z',
    fields: {
      title: {
        x: 50, y: 20, fontSize: 30, fontWeight: '800', color: '#0f172a',
        fontFamily: 'Inter', align: 'center', visible: true, uppercase: true,
        letterSpacing: '0.1em', prefix: 'CHỨNG CHỈ NĂNG LỰC SỐ'
      },
      subtitle: {
        x: 50, y: 27, fontSize: 13, fontWeight: '500', color: '#64748b',
        fontFamily: 'Inter', align: 'center', visible: true,
        prefix: 'Chứng nhận năng lực chuyên môn và kết quả đào tạo thực tế dành cho:'
      },
      studentName: {
        x: 50, y: 37, fontSize: 36, fontWeight: '800', color: '#0f172a',
        fontFamily: 'Inter', align: 'center', visible: true, uppercase: true
      },
      studentCode: {
        x: 50, y: 44, fontSize: 12, fontWeight: '600', color: '#94a3b8',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Mã học viên: '
      },
      courseTitle: {
        x: 50, y: 53, fontSize: 22, fontWeight: '700', color: '#334155',
        fontFamily: 'Inter', align: 'center', visible: true, uppercase: true
      },
      finalScore: {
        x: 35, y: 62, fontSize: 14, fontWeight: '700', color: '#0284c7',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Kết quả: ', suffix: '/100 điểm'
      },
      honorsTitle: {
        x: 65, y: 62, fontSize: 14, fontWeight: '700', color: '#059669',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Xếp loại: '
      },
      issueDate: {
        x: 20, y: 78, fontSize: 12, fontWeight: '500', color: '#64748b',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Ngày: '
      },
      certificateId: {
        x: 20, y: 83, fontSize: 11, fontWeight: '600', color: '#475569',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'ID: '
      },
      qrCode: {
        x: 50, y: 78, fontSize: 12, color: '#0f172a',
        visible: true, size: 68
      },
      signatoryLeftTitle: {
        x: 20, y: 88, fontSize: 11, fontWeight: '500', color: '#94a3b8',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Bộ Phận Đào Tạo'
      },
      signatoryLeftName: {
        x: 20, y: 92, fontSize: 12, fontWeight: '600', color: '#334155',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'Ban Giảng Viên Tin Học'
      },
      signatoryRightTitle: {
        x: 80, y: 76, fontSize: 12, fontWeight: '600', color: '#64748b',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'ĐẠI DIỆN TRUNG TÂM'
      },
      signatoryRightName: {
        x: 80, y: 92, fontSize: 13, fontWeight: '700', color: '#0f172a',
        fontFamily: 'Inter', align: 'center', visible: true, prefix: 'ThS. Đinh Huy'
      },
      organization: {
        x: 50, y: 12, fontSize: 11, fontWeight: '700', color: '#64748b',
        fontFamily: 'Inter', align: 'center', visible: true, uppercase: true,
        letterSpacing: '0.12em', prefix: 'PH DIGITAL EDUCATION PLATFORM'
      }
    }
  }
];

export class CertificateService {
  // ──────────────────────────────────────────────────────────────────────────
  // A. QUẢN LÝ KHUNG MẪU CHỨNG CHỈ (TEMPLATES MANAGEMENT)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Lấy toàn bộ danh sách khung mẫu (kết hợp mẫu hệ thống và mẫu tùy chỉnh)
   */
  static getAllTemplates(): CertificateTemplate[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (raw) {
        const customTemplates: CertificateTemplate[] = JSON.parse(raw);
        // Trộn các mẫu hệ thống (cập nhật mới nhất) với mẫu của người dùng
        const systemIds = new Set(DEFAULT_SYSTEM_TEMPLATES.map(t => t.id));
        const nonSystemCustom = customTemplates.filter(t => !systemIds.has(t.id));
        
        // Kiểm tra nếu có custom template ghi đè cấu hình hệ thống
        const mergedSystem = DEFAULT_SYSTEM_TEMPLATES.map(sys => {
          const overridden = customTemplates.find(c => c.id === sys.id);
          return overridden ? { ...sys, ...overridden } : sys;
        });

        return [...mergedSystem, ...nonSystemCustom];
      }
    } catch (e) {
      console.error('Không thể đọc danh sách khung mẫu từ localStorage:', e);
    }
    return [...DEFAULT_SYSTEM_TEMPLATES];
  }

  /**
   * Lấy chi tiết một khung mẫu theo ID
   */
  static getTemplateById(templateId?: string): CertificateTemplate {
    const templates = this.getAllTemplates();
    if (templateId) {
      const found = templates.find(t => t.id === templateId);
      if (found) return found;
    }
    // Fallback: Tìm mẫu mặc định
    const def = templates.find(t => t.isDefault);
    return def || templates[0] || DEFAULT_SYSTEM_TEMPLATES[0];
  }

  /**
   * Lưu hoặc cập nhật một khung mẫu
   */
  static saveTemplate(template: CertificateTemplate): CertificateTemplate {
    const all = this.getAllTemplates();
    const existingIdx = all.findIndex(t => t.id === template.id);
    
    // Nếu đặt là default, bỏ default của các mẫu khác
    if (template.isDefault) {
      all.forEach(t => { t.isDefault = false; });
    }

    const updatedTemplate: CertificateTemplate = {
      ...template,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      all[existingIdx] = updatedTemplate;
    } else {
      all.push(updatedTemplate);
    }

    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(all));
    } catch (e) {
      console.error('Lỗi khi lưu khung mẫu:', e);
    }
    return updatedTemplate;
  }

  /**
   * Xóa khung mẫu (không cho xóa mẫu hệ thống cốt lõi)
   */
  static deleteTemplate(templateId: string): boolean {
    const all = this.getAllTemplates();
    const target = all.find(t => t.id === templateId);
    if (!target) return false;
    if (target.isSystem) {
      console.warn('Không thể xóa khung mẫu hệ thống mặc định');
      return false;
    }

    const filtered = all.filter(t => t.id !== templateId);
    // Nếu mẫu vừa xóa là default, chỉ định mẫu đầu tiên làm default
    if (target.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }

    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Lỗi khi xóa khung mẫu:', e);
      return false;
    }
  }

  /**
   * Đặt làm khung mẫu mặc định
   */
  static setDefaultTemplate(templateId: string): boolean {
    const all = this.getAllTemplates();
    let found = false;
    all.forEach(t => {
      if (t.id === templateId) {
        t.isDefault = true;
        found = true;
      } else {
        t.isDefault = false;
      }
    });

    if (found) {
      try {
        localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(all));
        return true;
      } catch (e) {}
    }
    return false;
  }

  /**
   * Lấy khung mẫu mặc định hiện tại
   */
  static getDefaultTemplate(): CertificateTemplate {
    return this.getTemplateById();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // B. QUẢN LÝ CHỨNG CHỈ (CERTIFICATES ISSUANCE & LIFECYCLE)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Lấy toàn bộ chứng chỉ từ storage
   */
  static getAllCertificates(): DigitalCertificate[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CERTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to get certificates:', e);
    }
    return [];
  }

  /**
   * Lưu đè toàn bộ danh sách chứng chỉ
   */
  static saveCertificates(certs: DigitalCertificate[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(certs));
    } catch (e) {
      console.error('Lỗi lưu danh sách chứng chỉ:', e);
    }
  }

  /**
   * Cấp mới chứng chỉ (Hỗ trợ cả 2 kiểu gọi: Object payload hoặc tham số truyền thống)
   */
  static issueCertificate(
    payloadOrStudentName: string | IssueCertificatePayload,
    studentCode?: string,
    track?: CurriculumTrack,
    finalScore?: number,
    optionalTemplateId?: string
  ): DigitalCertificate {
    // Chuẩn hóa dữ liệu đầu vào
    let payload: IssueCertificatePayload;
    if (typeof payloadOrStudentName === 'object') {
      payload = payloadOrStudentName;
    } else {
      payload = {
        studentName: payloadOrStudentName,
        studentCode: studentCode || 'TGZ-STUDENT',
        track: (track as string) || 'office-fast-3in1',
        finalScore: finalScore !== undefined ? finalScore : 85,
        templateId: optionalTemplateId
      };
    }

    const certs = this.getAllCertificates();
    const chosenTrack = payload.track as CurriculumTrack;
    
    // Tạo mã số hiệu chứng chỉ
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const trackCode = (payload.track || 'GENZ').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    const certificateId = `TGZ-${trackCode}-2026-${randomSuffix}`;

    // Tự động phân loại danh hiệu nếu chưa có
    let honors = payload.honorsTitle;
    if (!honors) {
      if (payload.finalScore >= 95) honors = 'Thủ Khoa Xuất Sắc';
      else if (payload.finalScore >= 85) honors = 'Hạng Giỏi - Khảo Thí Chuẩn';
      else if (payload.finalScore >= 75) honors = 'Hạng Khá - Đạt Chuẩn';
      else honors = 'Hoàn Thành Khóa Học';
    }

    const verificationUrl = `https://hoctructuyen.tinhocgenz.io.vn/verify/${certificateId}`;
    const issueDate = payload.issueDate || new Date().toISOString().split('T')[0];

    // Xác định khung mẫu áp dụng
    const selectedTemplate = payload.templateId 
      ? this.getTemplateById(payload.templateId)
      : this.getDefaultTemplate();

    // Sinh Blockchain Proof
    const merkleLeaf = `${payload.studentCode}|${payload.studentName}|${payload.track}|${payload.finalScore}|${issueDate}`;
    const txHash = generateTxHash(certificateId, merkleLeaf);
    const blockHeight = generateBlockHeight(certificateId);

    // Tính sync pseudo-hash trước
    let syncHash = 0xcafebabe;
    for (let i = 0; i < merkleLeaf.length; i++) {
      syncHash = Math.imul(syncHash ^ merkleLeaf.charCodeAt(i), 0x9e3779b9);
      syncHash ^= syncHash >>> 16;
    }
    const certHashHex = (Math.abs(syncHash) >>> 0).toString(16).padStart(8, '0').repeat(8).substring(0, 64);

    const blockchainProof: BlockchainProof = {
      certHash: certHashHex,
      txHash,
      blockHeight,
      network: 'Polygon PoS (EduChain Layer)',
      contractAddress: '0x7F4e8bA2C1a9d3E056F8234B1c7eA593D0F2b814',
      issuerKey: ISSUER_PUBLIC_KEY,
      anchoredAt: new Date().toISOString(),
      merkleLeaf
    };

    const courseTitle = payload.courseTitle || (TRACK_LABELS[chosenTrack] || payload.track);

    const newCert: DigitalCertificate = {
      certificateId,
      studentName: payload.studentName,
      studentCode: payload.studentCode,
      courseTitle,
      track: chosenTrack,
      issueDate,
      finalScore: payload.finalScore,
      honorsTitle: honors,
      verificationUrl,
      status: 'valid',
      blockchainProof,
      templateId: selectedTemplate.id,
      signatoryName: payload.signatoryName || 'ThS. Đinh Huy',
      signatoryTitle: payload.signatoryTitle || 'Giám Đốc Trung Tâm',
      organization: payload.organization || 'CÔNG TY TNHH PH – TIN HỌC GEN Z'
    };

    certs.unshift(newCert);
    this.saveCertificates(certs);

    // Băm SHA-256 thật trong background
    sha256Hex(merkleLeaf).then(realHash => {
      try {
        const allCerts = this.getAllCertificates();
        const idx = allCerts.findIndex(c => c.certificateId === certificateId);
        if (idx !== -1 && allCerts[idx].blockchainProof) {
          allCerts[idx].blockchainProof!.certHash = realHash;
          this.saveCertificates(allCerts);
        }
      } catch (_) {}
    });

    return newCert;
  }

  /**
   * Chỉnh sửa thông tin chứng chỉ đã cấp
   */
  static updateCertificate(certificateId: string, updates: UpdateCertificatePayload): DigitalCertificate | null {
    const certs = this.getAllCertificates();
    const index = certs.findIndex(c => c.certificateId.trim().toUpperCase() === certificateId.trim().toUpperCase());
    if (index === -1) return null;

    const oldCert = certs[index];
    const studentName = updates.studentName ?? oldCert.studentName;
    const studentCode = updates.studentCode ?? oldCert.studentCode;
    const track = (updates.track as CurriculumTrack) ?? oldCert.track;
    const courseTitle = updates.courseTitle ?? oldCert.courseTitle;
    const finalScore = updates.finalScore ?? oldCert.finalScore;
    const issueDate = updates.issueDate ?? oldCert.issueDate;
    const honorsTitle = updates.honorsTitle ?? oldCert.honorsTitle;
    const templateId = updates.templateId ?? oldCert.templateId;
    const status = updates.status ?? oldCert.status;
    const signatoryName = updates.signatoryName ?? oldCert.signatoryName;
    const signatoryTitle = updates.signatoryTitle ?? oldCert.signatoryTitle;

    // Tái tạo Merkle Leaf khi thông tin cốt lõi thay đổi
    const merkleLeaf = `${studentCode}|${studentName}|${track}|${finalScore}|${issueDate}`;
    const txHash = generateTxHash(certificateId, merkleLeaf);
    const blockHeight = oldCert.blockchainProof?.blockHeight || generateBlockHeight(certificateId);

    const updatedCert: DigitalCertificate = {
      ...oldCert,
      studentName,
      studentCode,
      track,
      courseTitle,
      finalScore,
      issueDate,
      honorsTitle,
      templateId,
      status,
      signatoryName,
      signatoryTitle,
      revocationReason: updates.revocationReason ?? oldCert.revocationReason,
      revokedAt: status === 'revoked' ? (oldCert.revokedAt || new Date().toISOString()) : undefined,
      blockchainProof: {
        ...(oldCert.blockchainProof || {
          network: 'Polygon PoS (EduChain Layer)',
          contractAddress: '0x7F4e8bA2C1a9d3E056F8234B1c7eA593D0F2b814',
          issuerKey: ISSUER_PUBLIC_KEY,
          anchoredAt: new Date().toISOString()
        }),
        merkleLeaf,
        txHash,
        blockHeight,
        certHash: oldCert.blockchainProof?.certHash || 'recomputing...'
      }
    };

    certs[index] = updatedCert;
    this.saveCertificates(certs);

    // Tính lại Real Hash
    sha256Hex(merkleLeaf).then(realHash => {
      try {
        const freshCerts = this.getAllCertificates();
        const fIdx = freshCerts.findIndex(c => c.certificateId === certificateId);
        if (fIdx !== -1 && freshCerts[fIdx].blockchainProof) {
          freshCerts[fIdx].blockchainProof!.certHash = realHash;
          this.saveCertificates(freshCerts);
        }
      } catch (_) {}
    });

    return updatedCert;
  }

  /**
   * Thu hồi chứng chỉ (Đánh dấu status = 'revoked')
   */
  static revokeCertificate(certificateId: string, reason: string = 'Thu hồi theo quyết định của Hội đồng Khảo thí'): boolean {
    const res = this.updateCertificate(certificateId, {
      status: 'revoked',
      revocationReason: reason
    });
    return !!res;
  }

  /**
   * Kích hoạt lại chứng chỉ bị thu hồi
   */
  static reactivateCertificate(certificateId: string): boolean {
    const res = this.updateCertificate(certificateId, {
      status: 'valid',
      revocationReason: undefined
    });
    return !!res;
  }

  /**
   * Xóa chứng chỉ khỏi hệ thống
   */
  static deleteCertificate(certificateId: string): boolean {
    const certs = this.getAllCertificates();
    const filtered = certs.filter(c => c.certificateId.trim().toUpperCase() !== certificateId.trim().toUpperCase());
    if (filtered.length === certs.length) return false;
    this.saveCertificates(filtered);
    return true;
  }

  /**
   * Cấp phát hàng loạt chứng chỉ cho nhiều học viên
   */
  static batchIssueCertificates(items: IssueCertificatePayload[]): DigitalCertificate[] {
    const results: DigitalCertificate[] = [];
    for (const item of items) {
      const cert = this.issueCertificate(item);
      results.push(cert);
    }
    return results;
  }

  /**
   * Tra cứu công khai chứng chỉ theo ID
   */
  static verifyCertificate(certificateId: string): DigitalCertificate | null {
    if (!certificateId) return null;
    const certs = this.getAllCertificates();
    return certs.find(c => c.certificateId.trim().toUpperCase() === certificateId.trim().toUpperCase()) || null;
  }

  /**
   * Lấy danh sách chứng chỉ của một học viên
   */
  static getStudentCertificates(studentCode: string): DigitalCertificate[] {
    if (!studentCode) return [];
    const certs = this.getAllCertificates();
    return certs.filter(c => c.studentCode.toUpperCase() === studentCode.toUpperCase());
  }

  /**
   * Lấy sổ cái blockchain (chỉ các chứng chỉ hợp lệ)
   */
  static getBlockchainLedger(): DigitalCertificate[] {
    return this.getAllCertificates().filter(c => c.status === 'valid');
  }
}
