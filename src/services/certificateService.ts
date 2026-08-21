import { DigitalCertificate } from '../types/edtech';
import { CurriculumTrack, TRACK_LABELS } from '../types/auth';

const STORAGE_KEY_CERTS = 'phtinhocgenz_digital_certificates_v1';

export class CertificateService {
  /**
   * Get all issued certificates from storage
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
   * Issue a new verifiable digital certificate upon course / final exam completion
   */
  static issueCertificate(
    studentName: string,
    studentCode: string,
    track: CurriculumTrack,
    finalScore: number
  ): DigitalCertificate {
    const certs = this.getAllCertificates();
    const existing = certs.find(c => c.studentCode === studentCode && c.track === track);
    if (existing) return existing;

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const trackCode = track.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    const certificateId = `TGZ-${trackCode}-2026-${randomSuffix}`;

    let honorsTitle: string | undefined = undefined;
    if (finalScore >= 95) honorsTitle = 'Thủ Khoa Xuất Sắc';
    else if (finalScore >= 85) honorsTitle = 'Hạng Giỏi - Khảo Thí Chuẩn';

    const verificationUrl = `https://hoctructuyen.tinhocgenz.io.vn/certificate/verify/${certificateId}`;

    const newCert: DigitalCertificate = {
      certificateId,
      studentName,
      studentCode,
      courseTitle: TRACK_LABELS[track] || track,
      track,
      issueDate: new Date().toISOString().split('T')[0],
      finalScore,
      honorsTitle,
      verificationUrl,
      status: 'valid'
    };

    certs.push(newCert);
    try {
      localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(certs));
    } catch (e) {}

    return newCert;
  }

  /**
   * Verify certificate by ID
   */
  static verifyCertificate(certificateId: string): DigitalCertificate | null {
    const certs = this.getAllCertificates();
    return certs.find(c => c.certificateId.trim().toUpperCase() === certificateId.trim().toUpperCase()) || null;
  }

  /**
   * Get certificates owned by a specific student
   */
  static getStudentCertificates(studentCode: string): DigitalCertificate[] {
    const certs = this.getAllCertificates();
    return certs.filter(c => c.studentCode.toUpperCase() === studentCode.toUpperCase());
  }
}
