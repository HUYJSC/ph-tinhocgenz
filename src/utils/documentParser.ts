import { Assignment, FileSourceType } from '../types/assignment';

export interface ParsedDocumentResult {
  title: string;
  description: string;
  sourceFileName: string;
  sourceFileType: FileSourceType;
  rawContent: string;
  parsedQuestions: Array<{
    id: string;
    number: number;
    prompt: string;
    points: number;
    sampleAnswer?: string;
  }>;
}

/**
 * Parses raw text or structured document text and extracts numbered questions.
 * Handles patterns like "Câu 1:", "Câu 2.", "Bài 1:", "Yêu cầu 1:".
 */
export function extractQuestionsFromText(text: string): Array<{
  id: string;
  number: number;
  prompt: string;
  points: number;
}> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const questions: Array<{ id: string; number: number; prompt: string; points: number }> = [];

  const questionRegex = /^(?:câu|bài|yêu\s+cầu|task|question)\s*(\d+)[\s.:\-)]*(.*)/i;
  
  let currentQuestion: { id: string; number: number; prompt: string; points: number } | null = null;
  let questionCount = 0;

  for (const line of lines) {
    const match = line.match(questionRegex);
    if (match) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      questionCount++;
      const qNum = parseInt(match[1], 10) || questionCount;
      const promptText = match[2] ? match[2].trim() : '';
      currentQuestion = {
        id: `q-${Date.now()}-${questionCount}`,
        number: qNum,
        prompt: promptText || `Thực hiện yêu cầu bài tập số ${qNum}`,
        points: 10
      };
    } else if (currentQuestion) {
      currentQuestion.prompt += '\n' + line;
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  // If no specific "Câu X" markers were found, split paragraphs or lines as tasks
  if (questions.length === 0 && lines.length > 0) {
    const nonHeaderLines = lines.slice(0, 8);
    nonHeaderLines.forEach((line, idx) => {
      questions.push({
        id: `q-${Date.now()}-${idx + 1}`,
        number: idx + 1,
        prompt: line,
        points: 10
      });
    });
  }

  return questions;
}

/**
 * Smart file loader: reads File object and parses content cleanly
 */
export async function parseUploadedDocument(file: File): Promise<ParsedDocumentResult> {
  const fileName = file.name;
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

  let fileType: FileSourceType = 'text';
  if (fileExt === 'docx' || fileExt === 'doc') fileType = 'docx';
  else if (fileExt === 'pdf') fileType = 'pdf';
  else if (['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(fileExt)) fileType = 'image';

  let rawContent = '';

  // 1. Image File Handling
  if (fileType === 'image') {
    rawContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const parsedQuestions = [
      {
        id: `q-img-1`,
        number: 1,
        prompt: 'Thực hiện thao tác và hoàn thành bài tập thực hành theo hình ảnh đề thi trên.',
        points: 50
      },
      {
        id: `q-img-2`,
        number: 2,
        prompt: 'Giải thích tóm tắt các bước thực hiện hoặc hàm/công thức đã áp dụng vào ô trả lời.',
        points: 50
      }
    ];

    return {
      title: fileName.replace(/\.[^/.]+$/, ''),
      description: 'Đề thi thực hành được trích xuất từ tệp hình ảnh.',
      sourceFileName: fileName,
      sourceFileType: fileType,
      rawContent,
      parsedQuestions
    };
  }

  // 2. PDF File Handling (Read as Base64 Data URL instead of binary raw bytecode!)
  if (fileType === 'pdf') {
    const pdfDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return {
      title: fileName.replace(/\.[^/.]+$/, ''),
      description: `Tài liệu đề thi định dạng PDF (${(file.size / 1024).toFixed(1)} KB) - Hiển thị bảo mật chống tải về`,
      sourceFileName: fileName,
      sourceFileType: 'pdf',
      rawContent: pdfDataUrl,
      parsedQuestions: [
        {
          id: `q-pdf-1`,
          number: 1,
          prompt: 'Đọc kỹ toàn bộ nội dung đề bài trong file PDF bảo mật phía trên và thực hiện yêu cầu:',
          points: 50
        },
        {
          id: `q-pdf-2`,
          number: 2,
          prompt: 'Nhập câu trả lời hoặc đính kèm tệp bài làm thực hành (.xlsx, .docx) để nộp:',
          points: 50
        }
      ]
    };
  }

  // 3. Text / Docx File Handling
  const textContent = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = reject;
    reader.readAsText(file);
  });

  // Filter out any binary garbage if a binary doc was read
  let cleanText = textContent;
  if (textContent.includes('%PDF-') || textContent.includes('PK\u0003\u0004')) {
    cleanText = `TÀI LIỆU ĐỀ THI TIN HỌC: ${fileName}\n\nYêu cầu học viên:\n1. Quan sát nội dung đề bài và hoàn thành các câu hỏi theo hướng dẫn của giảng viên.\n2. Làm bài trực tiếp vào các ô bên dưới và nộp bài trước hạn chót.`;
  }

  rawContent = cleanText;
  const questions = extractQuestionsFromText(cleanText);

  return {
    title: fileName.replace(/\.[^/.]+$/, ''),
    description: `Đề thi trích xuất từ tệp ${fileName}`,
    sourceFileName: fileName,
    sourceFileType: fileType,
    rawContent,
    parsedQuestions: questions.length > 0 ? questions : [
      {
        id: `q-1`,
        number: 1,
        prompt: 'Đọc kỹ toàn bộ nội dung đề bài trong khung tài liệu bảo mật và trả lời câu hỏi vào ô bên dưới.',
        points: 100
      }
    ]
  };
}

/**
 * Pre-defined default Informatics Exam Templates for 1-Click loading
 */
export const SAMPLE_INFORMATICS_EXAMS: Partial<Assignment>[] = [
  {
    title: 'Đề Thi Thực Hành MOS Excel Specialist - K12 & Đại Cương',
    description: 'Bài kiểm tra kỹ năng xử lý dữ liệu, hàm VLOOKUP, SUMIFS, PivotTable và định dạng bảng tính có điều kiện.',
    category: 'mos-excel',
    targetClass: 'Lớp Luyện Thi MOS K12',
    sourceFileName: 'De_Thi_MOS_Excel_Chuyen_Sau.docx',
    sourceFileType: 'docx',
    rawContent: `TRƯỜNG ĐÀO TẠO TIN HỌC PH DIGITAL EDUCATION • TIN HỌC GENZ
BÀI KIỂM TRA ĐỊNH KỲ: THỰC HÀNH MICROSOFT EXCEL CHUYÊN SÂU
Thời gian làm bài: 45 phút (Không được tải tài liệu về máy tính)

CÂU 1 (25 điểm):
Tại Sheet 'BangLuong', sử dụng hàm VLOOKUP kết hợp hàm IFERROR để điền cột [Hệ Số Lương] dựa vào [Mã Chức Vụ] tra cứu từ bảng phụ 'DanhMuc_ChucVu'. Nếu mã không tồn tại, trả về giá trị 1.0.

CÂU 2 (25 điểm):
Tính cột [Thưởng Hiệu Suất] theo quy tắc: Nếu [Doanh Thu] >= 100,000,000 và [Số Ngày Công] >= 24 thì thưởng 15% Doanh thu; nếu Doanh thu >= 50,000,000 thì thưởng 10%; các trường hợp còn lại thưởng 5%.

CÂU 3 (25 điểm):
Thiết lập định dạng có điều kiện (Conditional Formatting) dạng Data Bars màu xanh lá cây cho cột [Tổng Thu Nhập].

CÂU 4 (25 điểm):
Tạo một PivotTable tại Sheet mới có tên 'BaoCao_TongHop' để tổng hợp Tổng Lương thực lĩnh theo từng [Phòng Ban] và chèn thêm 1 bộ lọc trực quan (Slicer) theo [Tháng Làm Việc].`,
    parsedQuestions: [
      {
        id: 'q-sample-1',
        number: 1,
        prompt: "Tại Sheet 'BangLuong', viết công thức VLOOKUP kết hợp IFERROR để điền cột [Hệ Số Lương] tra từ bảng phụ. Trình bày công thức bạn sử dụng:",
        points: 25
      },
      {
        id: 'q-sample-2',
        number: 2,
        prompt: "Viết công thức IF lồng ghép với AND để tính cột [Thưởng Hiệu Suất] theo điều kiện Doanh Thu và Ngày Công:",
        points: 25
      },
      {
        id: 'q-sample-3',
        number: 3,
        prompt: "Nêu các bước thực hiện thiết lập Conditional Formatting (Data Bars) cho cột [Tổng Thu Nhập]:",
        points: 25
      },
      {
        id: 'q-sample-4',
        number: 4,
        prompt: "Trình bày các bước tạo PivotTable tổng hợp lương theo Phòng Ban và cách chèn Slicer:",
        points: 25
      }
    ],
    durationMinutes: 45,
    isOpen: true,
    allowLateSubmission: false,
    securityOptions: {
      disableCopy: true,
      disableDownload: true,
      watermarkStudent: true
    }
  },
  {
    title: 'Đề Thi Lý Thuyết & Thực Hành Chuẩn Quốc Tế IC3 GS6',
    description: 'Kiểm tra kiến thức máy tính căn bản, an toàn mạng và ứng dụng công nghệ đám mây.',
    category: 'ic3-gs',
    targetClass: 'Lớp Chứng Chỉ IC3 Quốc Tế',
    sourceFileName: 'De_Thi_IC3_GS6_Global.pdf',
    sourceFileType: 'pdf',
    rawContent: `CHỨNG CHỈ QUỐC TẾ IC3 GS6 (GLOBAL STANDARD 6)
BÀI THI TỔNG HỢP KIẾN THỨC MÁY TÍNH & AN TOÀN SỐ
Thời gian: 40 phút • Học viên làm bài trực tiếp trên hệ thống

CÂU 1 (30 điểm):
Phân tích sự khác biệt cơ bản giữa bộ nhớ RAM và ROM trong máy tính về mặt lưu trữ dữ liệu khi mất nguồn điện đột ngột.

CÂU 2 (35 điểm):
Nêu 3 biện pháp then chốt để phòng chống các cuộc tấn công lừa đảo trực tuyến (Phishing Attacks) và bảo vệ tài khoản ngân hàng số.

CÂU 3 (35 điểm):
Trình bày nguyên lý hoạt động của hệ thống phân giải tên miền DNS và lý do tại sao giao thức HTTPS lại an toàn hơn HTTP.`,
    parsedQuestions: [
      {
        id: 'q-ic3-1',
        number: 1,
        prompt: 'Phân tích sự khác biệt cơ bản giữa RAM và ROM khi mất nguồn cấp điện:',
        points: 30
      },
      {
        id: 'q-ic3-2',
        number: 2,
        prompt: 'Nêu 3 biện pháp phòng chống Phishing và bảo vệ thông tin tài khoản trên mạng:',
        points: 35
      },
      {
        id: 'q-ic3-3',
        number: 3,
        prompt: 'Giải thích nguyên lý của DNS và lý do HTTPS mã hóa dữ liệu an toàn:',
        points: 35
      }
    ],
    durationMinutes: 40,
    isOpen: true,
    allowLateSubmission: false,
    securityOptions: {
      disableCopy: true,
      disableDownload: true,
      watermarkStudent: true
    }
  }
];
