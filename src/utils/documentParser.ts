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
  // 1. MOS Word MO-100 Objective 2.1: Chèn & Tìm Kiếm Văn Bản, Ký Tự Đặc Biệt
  {
    title: 'MOS Word MO-100: Objective 2.1 - Chèn Ký Tự Đặc Biệt & Tìm Kiếm Thay Thế',
    description: 'Thực hành đề thi chuẩn MOS: Chèn Registered Trademark (®), Trademark (™) và sử dụng Find & Replace nâng cao (Word_2-1).',
    category: 'word-6b',
    targetClass: 'Lớp Kỹ Năng Soạn Thảo Word (6 buổi)',
    sourceFileName: 'MOS_Word_MO100_Task_2.1_Symbols_Replace.docx',
    sourceFileType: 'docx',
    rawContent: `MICROSOFT OFFICE SPECIALIST: EXAM MO-100 (WORD 2019 / MICROSOFT 365)
CHUYÊN ĐỀ 2.1: CHÈN VĂN BẢN, ĐOẠN VĂN & KÝ TỰ ĐẶC BIỆT (SYMBOLS & SPECIAL CHARACTERS)
Tài liệu thực hành: Word_2-1.docx • Đối chiếu kết quả: Word_2-1_results.docx

YÊU CẦU 1 (30 điểm):
Tại đoạn văn đầu tiên của tài liệu Word_2-1, chèn ký tự biểu tượng nhãn hiệu đã đăng ký (Registered Trademark symbol ®) ngay phía sau từ "Microsoft". (Sử dụng tổ hợp phím Alt+Ctrl+R hoặc tab Insert > Symbols).

YÊU CẦU 2 (40 điểm):
Sử dụng tính năng Find and Replace (Ctrl+H) để thay thế tất cả các từ "(trademark)" xuất hiện trong văn bản bằng biểu tượng thương hiệu (™). Đảm bảo chỉ thay thế chính xác các trường hợp từ trademark nằm trong dấu ngoặc đơn.
(Mẹo: Gõ ký tự ™ vào văn bản, cắt vào Clipboard và chọn Clipboard Contents trong mục Special của Find and Replace).

YÊU CẦU 3 (30 điểm):
Sử dụng tính năng tìm kiếm ký tự đặc biệt để loại bỏ các dấu ngắt đoạn trống thừa trong văn bản (thay thế hai dấu ngắt đoạn liên tiếp ^p^p thành một dấu ngắt đoạn ^p). Lưu tài liệu và kiểm tra kết quả.`,
    parsedQuestions: [
      {
        id: 'mos-w-21-q1',
        number: 1,
        prompt: 'Trình bày các bước chèn biểu tượng Registered Trademark (®) sau từ "Microsoft" (nêu rõ tab/nút bấm hoặc phím tắt thực hiện):',
        points: 30
      },
      {
        id: 'mos-w-21-q2',
        number: 2,
        prompt: 'Trình bày thao tác mở hộp thoại Find and Replace để thay thế toàn bộ cụm "(trademark)" thành ký tự ™ chính xác theo yêu cầu đề thi:',
        points: 40
      },
      {
        id: 'mos-w-21-q3',
        number: 3,
        prompt: 'Mô tả cú pháp ký tự đại diện (Special code) dùng trong ô "Find what" và "Replace with" để xóa các dòng ngắt đoạn trống thừa (^p):',
        points: 30
      }
    ],
    durationMinutes: 30,
    isOpen: true,
    allowLateSubmission: false,
    securityOptions: {
      disableCopy: true,
      disableDownload: true,
      watermarkStudent: true
    }
  },

  // 2. MOS Word MO-100 Objective 2.2: Định Dạng Styles, Hiệu Ứng Chữ & Paragraph Spacing
  {
    title: 'MOS Word MO-100: Objective 2.2 - Quản Lý Styles, Text Effects & Khoảng Cách Đoạn',
    description: 'Thực hành chuẩn MOS: Sắp xếp Styles Gallery, áp dụng Heading 1, 2, Format Painter, hiệu ứng Sharp Bevel và Paragraph Spacing Relaxed (Word_2-2).',
    category: 'word-6b',
    targetClass: 'Lớp Kỹ Năng Soạn Thảo Word (6 buổi)',
    sourceFileName: 'MOS_Word_MO100_Task_2.2_Styles_TextEffects.docx',
    sourceFileType: 'docx',
    rawContent: `MICROSOFT OFFICE SPECIALIST: EXAM MO-100 (WORD 2019 / MICROSOFT 365)
CHUYÊN ĐỀ 2.2: ĐỊNH DẠNG VĂN BẢN, STYLES & KHOẢNG CÁCH DÒNG ĐOẠN
Tài liệu thực hành: Word_2-2.docx • Đối chiếu kết quả: Word_2-2_results.docx

YÊU CẦU 1 (25 điểm):
Mở bảng Styles Pane (Ctrl+Alt+Shift+S hoặc nút mở rộng trên Home tab). Thiết lập hiển thị toàn bộ Styles theo thứ tự bảng chữ cái (Alphabetical order). Chọn tất cả các đoạn văn đang có định dạng Heading 3 và chuyển đổi hàng loạt sang Style Heading 2.

YÊU CẦU 2 (25 điểm):
Tại đầu tài liệu, áp dụng Style Heading 1 cho tiêu đề "Financial Summary". Sử dụng công cụ chổi định dạng Format Painter để sao chép Style này sang hai tiêu đề "Financial Statements" và "Statement Notes".

YÊU CẦU 3 (25 điểm):
Tại tab Design > nhóm Document Formatting, thiết lập khoảng cách dòng đoạn (Paragraph Spacing) cho toàn bộ tài liệu thành "Relaxed".

YÊU CẦU 4 (25 điểm):
Ngay sau tiêu đề chính, chọn đoạn văn "A Brief Review of Our Finances":
- Áp dụng hiệu ứng chữ Text Effect: "Fill: Green, Accent color 3; Sharp Bevel".
- Căn giữa (Center) đoạn văn theo chiều ngang trang.
- Đổi khoảng cách phía trước (Space Before) của tiêu đề "Financial Summary" từ 20 pt thành 12 pt.`,
    parsedQuestions: [
      {
        id: 'mos-w-22-q1',
        number: 1,
        prompt: 'Trình bày cách mở Styles Pane, tùy chọn hiển thị Alphabetical và thao tác chọn tất cả các đoạn Heading 3 để đổi sang Heading 2:',
        points: 25
      },
      {
        id: 'mos-w-22-q2',
        number: 2,
        prompt: 'Nêu cách áp dụng Heading 1 cho "Financial Summary" và kỹ thuật sử dụng Format Painter để dán định dạng sang 2 tiêu đề tiếp theo:',
        points: 25
      },
      {
        id: 'mos-w-22-q3',
        number: 3,
        prompt: 'Chỉ ra vị trí thiết lập Paragraph Spacing dạng "Relaxed" cho toàn văn bản trên thanh Ribbon:',
        points: 25
      },
      {
        id: 'mos-w-22-q4',
        number: 4,
        prompt: 'Trình bày các bước áp dụng Text Effect "Fill: Green, Accent color 3; Sharp Bevel" và chỉnh Space Before thành 12 pt:',
        points: 25
      }
    ],
    durationMinutes: 35,
    isOpen: true,
    allowLateSubmission: false,
    securityOptions: {
      disableCopy: true,
      disableDownload: true,
      watermarkStudent: true
    }
  },

  // 3. MOS Word MO-100 Objective 2.3: Chia Cột Báo, Section Break & Định Dạng Trang Khác Nhau
  {
    title: 'MOS Word MO-100: Objective 2.3 - Chia Cột Báo Columns & Ngắt Phân Đoạn Section Breaks',
    description: 'Thực hành nâng cao chuẩn MOS: Chia 2 cột có đường kẻ giữa, Column Break, phân trang chống ngắt dòng và tạo Section nằm ngang Landscape (Word_2-3).',
    category: 'office-fast-3in1',
    targetClass: 'Lớp Word, Excel, PowerPoint (3 Buổi 1 môn)',
    sourceFileName: 'MOS_Word_MO100_Task_2.3_Columns_SectionBreaks.docx',
    sourceFileType: 'docx',
    rawContent: `MICROSOFT OFFICE SPECIALIST: EXAM MO-100 (WORD 2019 / MICROSOFT 365)
CHUYÊN ĐỀ 2.3: TẠO VÀ CẤU HÌNH CÁC PHÂN ĐOẠN TÀI LIỆU (SECTIONS & COLUMNS)
Tài liệu thực hành: Word_2-3.docx • Đối chiếu kết quả: Word_2-3_results.docx

YÊU CẦU 1 (25 điểm):
Ngay trước tiêu đề "Process", chèn một dấu ngắt trang thủ công (Page Break - Ctrl+Enter).

YÊU CẦU 2 (25 điểm):
Chọn các tiêu đề "Questions for Team Leaders", "Questions for Department Reps" và danh sách đi kèm:
- Định dạng thành 2 cột (Two Columns) có độ rộng bằng nhau.
- Đặt khoảng cách giữa hai cột (Spacing) là 0.3" (7.62 mm) và bật tùy chọn đường kẻ dọc phân cách (Line Between).
- Chèn một ngắt cột (Column Break - Ctrl+Shift+Enter) ngay trước tiêu đề "Questions for Department Reps" để đưa danh sách sang đầu cột thứ hai.

YÊU CẦU 3 (25 điểm):
Tại phần "Pre-Plan Project", chọn tiêu đề, đoạn văn và các mục danh sách:
- Mở hộp thoại Paragraph > tab Line and Page Breaks.
- Thiết lập tùy chọn "Keep with next" và "Keep lines together" để giữ trọn vẹn nội dung trên cùng một trang.

YÊU CẦU 4 (25 điểm):
Ở cuối tài liệu, xác định phần "Carry out project":
- Tạo một Section Break (Next Page) riêng biệt để đưa nội dung này sang một trang độc lập.
- Chỉ riêng Section này: thiết lập hướng giấy sang Nằm Ngang (Orientation: Landscape) và đặt cả 4 lề trang (Top, Bottom, Left, Right) là 2" (5.08 cm).`,
    parsedQuestions: [
      {
        id: 'mos-w-23-q1',
        number: 1,
        prompt: 'Trình bày cách chèn ngắt trang Page Break trước tiêu đề "Process":',
        points: 25
      },
      {
        id: 'mos-w-23-q2',
        number: 2,
        prompt: 'Trình bày các bước chia 2 cột có khoảng cách Spacing 0.3", đường kẻ giữa Line Between và chèn ngắt cột Column Break:',
        points: 25
      },
      {
        id: 'mos-w-23-q3',
        number: 3,
        prompt: 'Giải thích ý nghĩa và cách bật 2 tùy chọn "Keep with next" và "Keep lines together" trong hộp thoại Paragraph:',
        points: 25
      },
      {
        id: 'mos-w-23-q4',
        number: 4,
        prompt: 'Trình bày cách tạo Section Break Next Page và cấu hình hướng trang Landscape cùng lề 2" độc lập cho một phần văn bản:',
        points: 25
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
  },

  // 4. Excel Specialist
  {
    title: 'Đề Thi Thực Hành MOS Excel Specialist - K12 & Đại Cương',
    description: 'Bài kiểm tra kỹ năng xử lý dữ liệu, hàm VLOOKUP, SUMIFS, PivotTable và định dạng bảng tính có điều kiện.',
    category: 'excel-6b',
    targetClass: 'Lớp Excel (6 buổi)',
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
    category: 'cc-cntt-basic',
    targetClass: 'Lớp CC CNTT Cơ bản (6 buổi)',
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
