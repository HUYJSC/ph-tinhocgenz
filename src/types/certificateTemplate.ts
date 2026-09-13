/**
 * Certificate Template & Frame Definitions — PH Digital Education LMS
 * Hỗ trợ tải khung phôi mẫu từ bên ngoài và căn chỉnh tọa độ hiển thị trực quan (WYSIWYG)
 */

export interface TemplateFieldConfig {
  x: number;             // Tọa độ X theo phần trăm (0 - 100%)
  y: number;             // Tọa độ Y theo phần trăm (0 - 100%)
  fontSize: number;      // Cỡ chữ (pixel tại khung vẽ chuẩn 1200x850)
  fontWeight?: 'normal' | '500' | '600' | '700' | '800' | '900';
  color: string;         // Mã màu CSS (hex, rgba)
  fontFamily?: 'Inter' | 'Playfair Display' | 'Times New Roman' | 'Montserrat' | 'Merriweather' | 'sans-serif';
  align?: 'left' | 'center' | 'right';
  visible: boolean;      // Bật/tắt hiển thị trường này
  prefix?: string;       // Tiền tố văn bản
  suffix?: string;       // Hậu tố văn bản
  letterSpacing?: string;// Khoảng cách chữ
  uppercase?: boolean;   // In hoa
}

export interface CertificateTemplate {
  id: string;            // ID duy nhất, ví dụ: 'tpl-royal-gold', 'custom-1715000000'
  name: string;          // Tên mẫu khung
  description?: string;  // Mô tả
  backgroundImageUrl?: string; // Data URL (Base64) của ảnh phôi hoặc URL ảnh
  aspectRatio: 'landscape_a4' | 'landscape_16_9'; // Chuẩn khổ ngang A4 (1.414)
  isDefault?: boolean;   // Đặt làm khung mặc định
  isSystem?: boolean;    // Mẫu sẵn có của hệ thống (không thể xóa)
  createdAt: string;
  updatedAt: string;
  fields: {
    title: TemplateFieldConfig;          // Tiêu đề chứng chỉ
    subtitle: TemplateFieldConfig;       // Lời tuyên dương/mô tả
    studentName: TemplateFieldConfig;    // Họ và tên học viên
    studentCode: TemplateFieldConfig;    // Mã định danh học viên
    courseTitle: TemplateFieldConfig;    // Tên khóa học / Môn thi chuẩn
    finalScore: TemplateFieldConfig;     // Điểm số kết quả
    honorsTitle: TemplateFieldConfig;    // Xếp loại danh dự
    issueDate: TemplateFieldConfig;      // Ngày cấp chứng nhận
    certificateId: TemplateFieldConfig;  // Số hiệu chứng chỉ
    qrCode: TemplateFieldConfig & { size: number }; // Mã QR xác thực
    signatoryLeftTitle: TemplateFieldConfig;  // Chức danh bên trái
    signatoryLeftName: TemplateFieldConfig;   // Tên người ký bên trái
    signatoryRightTitle: TemplateFieldConfig; // Chức danh bên phải (Giám đốc)
    signatoryRightName: TemplateFieldConfig;  // Tên người ký bên phải
    organization: TemplateFieldConfig;        // Đơn vị cấp
  };
}

export interface IssueCertificatePayload {
  studentName: string;
  studentCode: string;
  track: string;
  courseTitle?: string;
  finalScore: number;
  honorsTitle?: string;
  issueDate?: string;
  templateId?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  organization?: string;
}

export interface UpdateCertificatePayload {
  studentName?: string;
  studentCode?: string;
  courseTitle?: string;
  track?: string;
  finalScore?: number;
  honorsTitle?: string;
  issueDate?: string;
  templateId?: string;
  status?: 'valid' | 'revoked';
  revocationReason?: string;
  signatoryName?: string;
  signatoryTitle?: string;
}

