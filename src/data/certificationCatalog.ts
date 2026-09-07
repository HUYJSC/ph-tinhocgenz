/**
 * DANH MỤC CHỨNG CHỈ & MÃ BÀI THI CHÍNH THỨC (OFFICIAL CERTIFICATION CATALOG)
 * Cơ sở đối chiếu kiểm tra tính chính xác & phát hiện lỗi sai kiến thức
 * Nguồn căn cứ:
 * - Certiport / Pearson VUE Microsoft Office Specialist
 * - Microsoft Learn Credentials
 * - Thông tư 03/2014/TT-BTTTT của Bộ Thông tin và Truyền thông & Bộ Giáo dục và Đào tạo
 */

import { CertificationExam } from '../types/learningResource';

export const OFFICIAL_CERTIFICATION_CATALOG: CertificationExam[] = [
  // ── A. MICROSOFT OFFICE 2019 (CHUẨN CHÍNH THỨC CERTIPORT) ──
  {
    family: 'MOS_2019',
    code: 'MO-100',
    name: 'Microsoft Word Associate (Office 2019)',
    officialLevel: 'Associate',
    subject: 'Word',
    officialUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/Office-2019.aspx',
    isCurrent: true,
    notes: 'Dành riêng cho Office 2019. Không dùng cho Microsoft 365 Apps.'
  },
  {
    family: 'MOS_2019',
    code: 'MO-101',
    name: 'Microsoft Word Expert (Office 2019)',
    officialLevel: 'Expert',
    subject: 'Word',
    officialUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/Office-2019.aspx',
    isCurrent: true
  },
  {
    family: 'MOS_2019',
    code: 'MO-200',
    name: 'Microsoft Excel Associate (Office 2019)',
    officialLevel: 'Associate',
    subject: 'Excel',
    officialUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/Office-2019.aspx',
    isCurrent: true,
    notes: 'Dành riêng cho Office 2019. Không dùng cho Microsoft 365 Apps.'
  },
  {
    family: 'MOS_2019',
    code: 'MO-201',
    name: 'Microsoft Excel Expert (Office 2019)',
    officialLevel: 'Expert',
    subject: 'Excel',
    officialUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/Office-2019.aspx',
    isCurrent: true
  },
  {
    family: 'MOS_2019',
    code: 'MO-300',
    name: 'Microsoft PowerPoint Associate (Office 2019)',
    officialLevel: 'Associate',
    subject: 'PowerPoint',
    officialUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/Office-2019.aspx',
    isCurrent: true,
    notes: 'Dành riêng cho Office 2019. Không dùng cho Microsoft 365 Apps.'
  },
  {
    family: 'MOS_2019',
    code: 'MO-400',
    name: 'Microsoft Outlook Associate (Office 2019)',
    officialLevel: 'Associate',
    subject: 'Outlook',
    officialUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/Office-2019.aspx',
    isCurrent: true
  },
  {
    family: 'MOS_2019',
    code: 'MO-500',
    name: 'Microsoft Access Expert (Office 2019)',
    officialLevel: 'Expert',
    subject: 'Access',
    officialUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/Office-2019.aspx',
    isCurrent: true
  },

  // ── B. MICROSOFT 365 APPS (CHUẨN CHÍNH THỨC CERTIPORT & MS LEARN) ──
  {
    family: 'MOS_365',
    code: 'MO-110',
    name: 'Microsoft Word Associate (Microsoft 365 Apps)',
    officialLevel: 'Associate',
    subject: 'Word',
    officialUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/microsoft-office-specialist-associate-m365-apps/',
    isCurrent: true,
    notes: 'Mã bài thi chính thức cho Word trên Microsoft 365 Apps.'
  },
  {
    family: 'MOS_365',
    code: 'MO-111',
    name: 'Microsoft Word Expert (Microsoft 365 Apps)',
    officialLevel: 'Expert',
    subject: 'Word',
    officialUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/365-Apps.aspx',
    isCurrent: true
  },
  {
    family: 'MOS_365',
    code: 'MO-210',
    name: 'Microsoft Excel Associate (Microsoft 365 Apps)',
    officialLevel: 'Associate',
    subject: 'Excel',
    officialUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/microsoft-office-specialist-associate-m365-apps/',
    isCurrent: true,
    notes: 'Mã bài thi chính thức cho Excel trên Microsoft 365 Apps.'
  },
  {
    family: 'MOS_365',
    code: 'MO-211',
    name: 'Microsoft Excel Expert (Microsoft 365 Apps)',
    officialLevel: 'Expert',
    subject: 'Excel',
    officialUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/365-Apps.aspx',
    isCurrent: true
  },
  {
    family: 'MOS_365',
    code: 'MO-310',
    name: 'Microsoft PowerPoint Associate (Microsoft 365 Apps)',
    officialLevel: 'Associate',
    subject: 'PowerPoint',
    officialUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/365-Apps.aspx',
    isCurrent: true,
    notes: 'Mã bài thi chính thức cho PowerPoint trên Microsoft 365 Apps.'
  },

  // ── C. CHUẨN KỸ NĂNG SỬ DỤNG CNTT VIỆT NAM (THÔNG TƯ 03/2014) ──
  {
    family: 'CNTT_CO_BAN',
    code: 'IU01-IU06',
    name: 'Chứng chỉ Ứng dụng CNTT Cơ bản (Thông tư 03)',
    officialLevel: 'Standard',
    subject: 'General_IT',
    officialUrl: 'https://vanban.chinhphu.vn/default.aspx?docid=172851&pageid=27160',
    isCurrent: true,
    notes: 'Gồm 6 mô-đun chuẩn quốc gia: Hiểu biết CNTT, Sử dụng máy tính, Xử lý văn bản, Bảng tính, Trình chiếu, Internet.'
  },
  {
    family: 'CNTT_NANG_CAO',
    code: 'IU07-IU15',
    name: 'Chứng chỉ Ứng dụng CNTT Nâng cao (Thông tư 03)',
    officialLevel: 'Standard',
    subject: 'General_IT',
    officialUrl: 'https://vanban.chinhphu.vn/default.aspx?docid=172851&pageid=27160',
    isCurrent: true,
    notes: 'Bắt buộc hoàn thành CNTT Cơ bản + 3 mô-đun nâng cao tự chọn.'
  }
];

export interface ExamValidationResult {
  hasConflict: boolean;
  detectedIssue?: string;
  claim?: string;
  standardValue?: string;
  referenceUrl?: string;
}

/**
 * Kiểm tra đối chiếu mã bài thi với nội dung khai báo của tài liệu/nguồn
 * Phát hiện lỗi nhầm lẫn cực kỳ phổ biến:
 * Gán MO-100, MO-200, MO-300 vào Microsoft 365 Apps thay vì Office 2019.
 */
export function validateExamCodeVsTitle(title: string, examCode: string): ExamValidationResult {
  const normalizedTitle = title.toLowerCase();
  const normalizedCode = (examCode || '').toUpperCase().trim();

  // Kiểm tra trường hợp: Tiêu đề nói Microsoft 365 Apps nhưng gắn mã MO-100 (Word 2019)
  if ((normalizedTitle.includes('365') || normalizedTitle.includes('m365')) && normalizedCode === 'MO-100') {
    return {
      hasConflict: true,
      claim: 'Gán mã MO-100 cho nội dung luyện thi Microsoft 365 Apps',
      standardValue: 'Mã bài thi Microsoft Word Associate cho Microsoft 365 Apps là MO-110 (MO-100 là dành riêng cho Office 2019)',
      referenceUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/365-Apps.aspx',
      detectedIssue: 'Xung đột mã bài thi: MO-100 thuộc Office 2019, Microsoft 365 Apps phải là MO-110.'
    };
  }

  // Kiểm tra trường hợp: Tiêu đề nói Microsoft 365 Apps nhưng gắn mã MO-200 (Excel 2019)
  if ((normalizedTitle.includes('365') || normalizedTitle.includes('m365')) && normalizedCode === 'MO-200') {
    return {
      hasConflict: true,
      claim: 'Gán mã MO-200 cho nội dung luyện thi Microsoft 365 Apps',
      standardValue: 'Mã bài thi Microsoft Excel Associate cho Microsoft 365 Apps là MO-210 (MO-200 là dành riêng cho Office 2019)',
      referenceUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/365-Apps.aspx',
      detectedIssue: 'Xung đột mã bài thi: MO-200 thuộc Office 2019, Microsoft 365 Apps phải là MO-210.'
    };
  }

  // Kiểm tra trường hợp: Tiêu đề nói Microsoft 365 Apps nhưng gắn mã MO-300 (PPT 2019)
  if ((normalizedTitle.includes('365') || normalizedTitle.includes('m365')) && normalizedCode === 'MO-300') {
    return {
      hasConflict: true,
      claim: 'Gán mã MO-300 cho nội dung luyện thi Microsoft 365 Apps',
      standardValue: 'Mã bài thi Microsoft PowerPoint Associate cho Microsoft 365 Apps là MO-310 (MO-300 là dành riêng cho Office 2019)',
      referenceUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/365-Apps.aspx',
      detectedIssue: 'Xung đột mã bài thi: MO-300 thuộc Office 2019, Microsoft 365 Apps phải là MO-310.'
    };
  }

  // Kiểm tra bài thi không tồn tại trong danh mục chính thức
  if (normalizedCode && normalizedCode.startsWith('MO-')) {
    const matched = OFFICIAL_CERTIFICATION_CATALOG.find(c => c.code === normalizedCode);
    if (!matched) {
      return {
        hasConflict: true,
        claim: `Mã bài thi ${normalizedCode} không có trong danh mục Certiport / Microsoft Learn`,
        standardValue: 'Chỉ chấp nhận các mã hợp lệ: MO-100..MO-500 (Office 2019) hoặc MO-110..MO-310 (M365)',
        referenceUrl: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/365-Apps.aspx',
        detectedIssue: `Mã bài thi ${normalizedCode} không được công nhận.`
      };
    }
  }

  return { hasConflict: false };
}
