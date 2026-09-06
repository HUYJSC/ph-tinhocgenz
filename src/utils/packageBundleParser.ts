import { Question, PracticeAttachment } from '../types/quiz';

export interface DecomposedPackageResult {
  title: string;
  description: string;
  modules: {
    word: { questions: Question[]; attachments: PracticeAttachment[] };
    excel: { questions: Question[]; attachments: PracticeAttachment[] };
    powerpoint: { questions: Question[]; attachments: PracticeAttachment[] };
  };
  allQuestions: Question[];
  allAttachments: PracticeAttachment[];
  summaryText: string;
}

/**
 * Format bytes into human readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Detect module type from file name and extension
 */
export function detectModuleFromFile(fileName: string, ext: string): 'word' | 'excel' | 'powerpoint' | 'general' {
  const lowerName = fileName.toLowerCase();
  const lowerExt = ext.toLowerCase();

  if (lowerExt === 'xlsx' || lowerExt === 'xls' || lowerExt === 'csv' || lowerName.includes('excel') || lowerName.includes('bangtinh')) {
    return 'excel';
  }
  if (lowerExt === 'pptx' || lowerExt === 'ppt' || lowerName.includes('powerpoint') || lowerName.includes('ppt') || lowerName.includes('slide')) {
    return 'powerpoint';
  }
  if (lowerExt === 'docx' || lowerExt === 'doc' || lowerName.includes('word') || lowerName.includes('vanban')) {
    return 'word';
  }
  return 'general';
}

/**
 * Parse structured text into questions with options & answers
 */
export function parseQuestionsFromRawText(text: string, defaultSubject: 'word' | 'excel' | 'powerpoint'): Question[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const rawBlocks = text.split(/(?=(?:Câu\s*\d+|Bài\s*\d+|\d+\.|\bQ\d+:)\s*[:.]?)/i).filter(b => b.trim().length > 0);
  const questions: Question[] = [];

  rawBlocks.forEach((block, index) => {
    const blockLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (blockLines.length === 0) return;

    let prompt = blockLines[0].replace(/^(?:Câu\s*\d+|Bài\s*\d+|\d+\.|\bQ\d+:)\s*[:.]?\s*/i, '');
    const options: string[] = [];
    let correctAnswer = 0;
    let explanation = '';
    let hint = '';

    for (let i = 1; i < blockLines.length; i++) {
      const line = blockLines[i];

      const optMatch = line.match(/^([A-D])[\.\)]\s*(.*)/i);
      if (optMatch) {
        options.push(optMatch[2].trim());
        continue;
      }

      const ansMatch = line.match(/(?:Đáp\s*án|Đáp\s*án\s*đúng|Key|Answer)\s*[:=]?\s*([A-D]|\d+)/i);
      if (ansMatch) {
        const val = ansMatch[1].toUpperCase();
        if (val === 'A') correctAnswer = 0;
        else if (val === 'B') correctAnswer = 1;
        else if (val === 'C') correctAnswer = 2;
        else if (val === 'D') correctAnswer = 3;
        else if (!isNaN(Number(val))) correctAnswer = Math.max(0, Number(val) - 1);
        continue;
      }

      const expMatch = line.match(/(?:Giải\s*thích|Ghi\s*chú|Explanation)\s*[:=]?\s*(.*)/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
        continue;
      }

      const hintMatch = line.match(/(?:Gợi\s*ý|Hint)\s*[:=]?\s*(.*)/i);
      if (hintMatch) {
        hint = hintMatch[1].trim();
        continue;
      }

      if (options.length === 0) {
        prompt += ' ' + line;
      }
    }

    // Default 4 options if fewer parsed
    while (options.length < 4) {
      options.push(`Lựa chọn ${options.length + 1}`);
    }

    if (prompt.trim()) {
      questions.push({
        id: `${defaultSubject}-q-${Date.now()}-${index + 1}`,
        type: 'single',
        prompt: prompt.trim(),
        options: options.slice(0, 4),
        correctAnswer: Math.min(correctAnswer, options.length - 1),
        explanation: explanation || `Kiến thức thực hành mô-đun ${defaultSubject.toUpperCase()}`,
        hint: hint || '',
        points: 10,
        subjectId: defaultSubject
      });
    }
  });

  return questions;
}

/**
 * Parses a single comprehensive document that contains sections for Word, Excel, and PowerPoint
 */
export function decomposeTextByModules(fullText: string): {
  wordText: string;
  excelText: string;
  pptText: string;
} {
  // Regex to detect section headers
  const wordSectionRegex = /(?:\[?(?:phần|môn|module|kỹ năng)\s*(?:1|i|a)?\s*[:\-–]?\s*(?:microsoft\s*)?word\]?)/i;
  const excelSectionRegex = /(?:\[?(?:phần|môn|module|kỹ năng)\s*(?:2|ii|b)?\s*[:\-–]?\s*(?:microsoft\s*)?excel\]?)/i;
  const pptSectionRegex = /(?:\[?(?:phần|môn|module|kỹ năng)\s*(?:3|iii|c)?\s*[:\-–]?\s*(?:microsoft\s*)?powerpoint\]?)/i;

  let wordText = '';
  let excelText = '';
  let pptText = '';

  const excelIdx = fullText.search(excelSectionRegex);
  const pptIdx = fullText.search(pptSectionRegex);
  const wordIdx = fullText.search(wordSectionRegex);

  // If explicit sections exist
  if (wordIdx !== -1 || excelIdx !== -1 || pptIdx !== -1) {
    const indices = [
      { type: 'word', index: wordIdx },
      { type: 'excel', index: excelIdx },
      { type: 'powerpoint', index: pptIdx }
    ].filter(item => item.index !== -1).sort((a, b) => a.index - b.index);

    for (let i = 0; i < indices.length; i++) {
      const current = indices[i];
      const next = indices[i + 1];
      const sectionContent = fullText.slice(current.index, next ? next.index : undefined);

      if (current.type === 'word') wordText = sectionContent;
      else if (current.type === 'excel') excelText = sectionContent;
      else if (current.type === 'powerpoint') pptText = sectionContent;
    }
  } else {
    // If no explicit section headers, scan line by line or divide content
    const lines = fullText.split('\n');
    const wordLines: string[] = [];
    const excelLines: string[] = [];
    const pptLines: string[] = [];

    let currentMod: 'word' | 'excel' | 'powerpoint' = 'word';

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('excel') || lower.includes('vlookup') || lower.includes('hàm') || lower.includes('bảng tính')) {
        currentMod = 'excel';
      } else if (lower.includes('powerpoint') || lower.includes('slide') || lower.includes('trình chiếu') || lower.includes('animation')) {
        currentMod = 'powerpoint';
      } else if (lower.includes('word') || lower.includes('văn bản') || lower.includes('paragraph') || lower.includes('font')) {
        currentMod = 'word';
      }

      if (currentMod === 'word') wordLines.push(line);
      else if (currentMod === 'excel') excelLines.push(line);
      else pptLines.push(line);
    }

    wordText = wordLines.join('\n');
    excelText = excelLines.join('\n');
    pptText = pptLines.join('\n');
  }

  return { wordText, excelText, pptText };
}

/**
 * Smart Decomposition Engine: processes multiple files or bundle file into 3 distinct modules
 */
export async function decomposePackageFiles(files: File[]): Promise<DecomposedPackageResult> {
  const result: DecomposedPackageResult = {
    title: 'Gói Bài Thi & Thực Hành 3in1 (Word - Excel - PPT)',
    description: 'Bộ đề thi và bài tập thực hành máy tính phân tách tự động theo 3 kỹ năng tin học văn phòng',
    modules: {
      word: { questions: [], attachments: [] },
      excel: { questions: [], attachments: [] },
      powerpoint: { questions: [], attachments: [] }
    },
    allQuestions: [],
    allAttachments: [],
    summaryText: ''
  };

  // Process all files
  for (const file of files) {
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    const moduleType = detectModuleFromFile(fileName, fileExt);
    const fileSizeStr = formatBytes(file.size);

    // Read as Data URL for downloading
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });

    // Create attachment entry
    const attachment: PracticeAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: fileName,
      size: fileSizeStr,
      module: moduleType,
      fileType: moduleType === 'excel' ? 'excel' : moduleType === 'powerpoint' ? 'powerpoint' : moduleType === 'word' ? 'word' : 'other',
      downloadUrl: dataUrl
    };

    if (moduleType === 'word') {
      result.modules.word.attachments.push(attachment);
    } else if (moduleType === 'excel') {
      result.modules.excel.attachments.push(attachment);
    } else if (moduleType === 'powerpoint') {
      result.modules.powerpoint.attachments.push(attachment);
    } else {
      // General or unclassified goes to Word as primary module
      result.modules.word.attachments.push(attachment);
    }
    result.allAttachments.push(attachment);

    // If text or doc-like file, attempt to parse questions
    if (['txt', 'docx', 'doc', 'json'].includes(fileExt) || file.type.includes('text')) {
      try {
        const textContent = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsText(file);
        });

        if (textContent.trim()) {
          const { wordText, excelText, pptText } = decomposeTextByModules(textContent);

          if (wordText.trim()) {
            const wQ = parseQuestionsFromRawText(wordText, 'word');
            result.modules.word.questions.push(...wQ);
          }
          if (excelText.trim()) {
            const eQ = parseQuestionsFromRawText(excelText, 'excel');
            result.modules.excel.questions.push(...eQ);
          }
          if (pptText.trim()) {
            const pQ = parseQuestionsFromRawText(pptText, 'powerpoint');
            result.modules.powerpoint.questions.push(...pQ);
          }
        }
      } catch (err) {
        console.warn('Could not extract text questions from', fileName, err);
      }
    }
  }

  // If no questions were parsed directly from files, generate standard representative starter questions for each module
  if (result.modules.word.questions.length === 0) {
    result.modules.word.questions.push(
      {
        id: `word-q-${Date.now()}-1`,
        type: 'single',
        prompt: 'Trong Microsoft Word, thao tác nào dùng để tạo mục lục tự động (Table of Contents)?',
        options: [
          'Thẻ References -> Table of Contents',
          'Thẻ Insert -> Quick Parts',
          'Thẻ Layout -> Breaks',
          'Thẻ View -> Outline View'
        ],
        correctAnswer: 0,
        explanation: 'Thẻ References chứa công cụ Table of Contents để tạo mục lục dựa trên các cấp độ Heading 1, 2, 3.',
        hint: 'Nằm trong thẻ References trên thanh công cụ Ribbon.',
        points: 10,
        subjectId: 'word'
      },
      {
        id: `word-q-${Date.now()}-2`,
        type: 'single',
        prompt: 'Mở tệp thực hành đính kèm của phần Word và thực hiện căn lề đoạn văn bản (Justify) bằng tổ hợp phím nào?',
        options: ['Ctrl + J', 'Ctrl + L', 'Ctrl + R', 'Ctrl + E'],
        correctAnswer: 0,
        explanation: 'Ctrl + J dùng để căn đều hai bên (Justify).',
        hint: 'J viết tắt của Justify.',
        points: 10,
        subjectId: 'word'
      }
    );
  }

  if (result.modules.excel.questions.length === 0) {
    result.modules.excel.questions.push(
      {
        id: `excel-q-${Date.now()}-1`,
        type: 'single',
        prompt: 'Trong bảng tính Excel của file thực hành, hàm nào được sử dụng để tính tổng có điều kiện?',
        options: ['SUMIF / SUMIFS', 'COUNTIF', 'VLOOKUP', 'AVERAGEIF'],
        correctAnswer: 0,
        explanation: 'Hàm SUMIF tính tổng theo 1 điều kiện, SUMIFS tính tổng theo nhiều điều kiện kết hợp.',
        hint: 'Bắt đầu bằng chữ SUM kết hợp IF.',
        points: 10,
        subjectId: 'excel'
      },
      {
        id: `excel-q-${Date.now()}-2`,
        type: 'single',
        prompt: 'Dựa trên bảng dữ liệu Excel đính kèm, công thức nào cố định đúng địa chỉ cột B và cho phép hàng tự thay đổi?',
        options: ['$B1', 'B$1', '$B$1', 'B1'],
        correctAnswer: 0,
        explanation: 'Dấu $ đặt trước tên cột $B1 sẽ cố định cột B và thả nổi số hàng.',
        hint: 'Nhấn F4 để luân chuyển các chế độ cố định.',
        points: 10,
        subjectId: 'excel'
      }
    );
  }

  if (result.modules.powerpoint.questions.length === 0) {
    result.modules.powerpoint.questions.push(
      {
        id: `ppt-q-${Date.now()}-1`,
        type: 'single',
        prompt: 'Trong Microsoft PowerPoint, tính năng Slide Master dùng để làm gì?',
        options: [
          'Thiết lập định dạng mẫu, font chữ và logo đồng bộ cho toàn bộ các slide',
          'Chèn hiệu ứng chuyển tiếp giữa các slide',
          'Ghi âm bài thuyết trình',
          'Xuất slide thành định dạng PDF'
        ],
        correctAnswer: 0,
        explanation: 'Slide Master cho phép người dùng tùy biến giao diện khung chung một lần để áp dụng cho tất cả slide con.',
        hint: 'Nằm trong thẻ View -> Slide Master.',
        points: 10,
        subjectId: 'powerpoint'
      },
      {
        id: `ppt-q-${Date.now()}-2`,
        type: 'single',
        prompt: 'Phím tắt nào dùng để bắt đầu trình chiếu slide từ trang hiện tại đang chọn?',
        options: ['Shift + F5', 'F5', 'Ctrl + F5', 'Alt + F5'],
        correctAnswer: 0,
        explanation: 'F5 trình chiếu từ đầu, Shift + F5 trình chiếu từ slide hiện hành.',
        hint: 'Kết hợp phím Shift và F5.',
        points: 10,
        subjectId: 'powerpoint'
      }
    );
  }

  // Aggregate all questions
  result.allQuestions = [
    ...result.modules.word.questions,
    ...result.modules.excel.questions,
    ...result.modules.powerpoint.questions
  ];

  result.summaryText = `Đã phân tách thành công 3 bài: Word (${result.modules.word.questions.length} câu, ${result.modules.word.attachments.length} file) • Excel (${result.modules.excel.questions.length} câu, ${result.modules.excel.attachments.length} file) • PowerPoint (${result.modules.powerpoint.questions.length} câu, ${result.modules.powerpoint.attachments.length} file)`;

  return result;
}

/**
 * Returns a standard demo 3in1 starter bundle for instant 1-click preview
 */
export function getSample3in1StarterBundle(): DecomposedPackageResult {
  const wordAtt: PracticeAttachment = {
    id: 'sample-att-word',
    name: 'De_Thuc_Hanh_Word_Chuan.docx',
    size: '142.5 KB',
    module: 'word',
    fileType: 'word',
    downloadUrl: '#'
  };

  const excelAtt: PracticeAttachment = {
    id: 'sample-att-excel',
    name: 'Du_Lieu_Mau_Bang_Tinh_Excel.xlsx',
    size: '286.0 KB',
    module: 'excel',
    fileType: 'excel',
    downloadUrl: '#'
  };

  const pptAtt: PracticeAttachment = {
    id: 'sample-att-ppt',
    name: 'Slide_Thuyet_Trinh_Mau_PowerPoint.pptx',
    size: '512.4 KB',
    module: 'powerpoint',
    fileType: 'powerpoint',
    downloadUrl: '#'
  };

  const wordQuestions: Question[] = [
    {
      id: 'demo-word-1',
      type: 'single',
      prompt: 'Trong Microsoft Word, tổ hợp phím nào dùng để ngắt trang (Page Break) ngay lập tức?',
      options: ['Ctrl + Enter', 'Shift + Enter', 'Alt + Enter', 'Ctrl + Shift + Enter'],
      correctAnswer: 0,
      explanation: 'Ctrl + Enter dùng để chèn ngắt trang Page Break.',
      hint: 'Phím tắt thông dụng khi làm báo cáo.',
      points: 10,
      subjectId: 'word'
    },
    {
      id: 'demo-word-2',
      type: 'single',
      prompt: 'Theo file bài tập Word đính kèm, tính năng Mail Merge dùng để làm gì?',
      options: [
        'Trộn thư tự động hàng loạt từ danh sách dữ liệu Excel',
        'Gửi email trực tiếp không cần mạng',
        'Tạo chữ nghệ thuật WordArt',
        'Kiểm tra chính tả tiếng Việt'
      ],
      correctAnswer: 0,
      explanation: 'Mail Merge (Trộn thư) kết hợp mẫu văn bản Word với bảng danh sách Excel để tạo hàng trăm văn bản cá nhân hóa.',
      hint: 'Nằm trong thẻ Mailings.',
      points: 10,
      subjectId: 'word'
    }
  ];

  const excelQuestions: Question[] = [
    {
      id: 'demo-excel-1',
      type: 'single',
      prompt: 'Trong bảng tính Excel thực hành, hàm nào tìm kiếm giá trị theo cột và trả về kết quả tương ứng?',
      options: ['VLOOKUP / XLOOKUP', 'HLOOKUP', 'COUNTIF', 'SUMIF'],
      correctAnswer: 0,
      explanation: 'VLOOKUP và XLOOKUP tìm kiếm giá trị theo cột dọc.',
      hint: 'Chữ V viết tắt của Vertical.',
      points: 10,
      subjectId: 'excel'
    },
    {
      id: 'demo-excel-2',
      type: 'single',
      prompt: 'Dựa trên file Du_Lieu_Mau_Bang_Tinh_Excel.xlsx, phím tắt nào dùng để tạo nhanh bảng dữ liệu Table?',
      options: ['Ctrl + T', 'Ctrl + B', 'Ctrl + Shift + L', 'Alt + F1'],
      correctAnswer: 0,
      explanation: 'Ctrl + T (hoặc Ctrl + L) tạo bảng Table có tự động lọc và style.',
      hint: 'T viết tắt của Table.',
      points: 10,
      subjectId: 'excel'
    }
  ];

  const pptQuestions: Question[] = [
    {
      id: 'demo-ppt-1',
      type: 'single',
      prompt: 'Trong Microsoft PowerPoint, hiệu ứng làm cho đối tượng xuất hiện trên slide thuộc nhóm nào?',
      options: ['Entrance Effects (Màu xanh lá)', 'Exit Effects (Màu đỏ)', 'Emphasis Effects (Màu vàng)', 'Motion Paths'],
      correctAnswer: 0,
      explanation: 'Nhóm Entrance quy định cách thức đối tượng bước vào màn hình slide.',
      hint: 'Có biểu tượng ngôi sao màu xanh.',
      points: 10,
      subjectId: 'powerpoint'
    },
    {
      id: 'demo-ppt-2',
      type: 'single',
      prompt: 'Theo file mẫu Slide PowerPoint đính kèm, phím tắt nào dùng để dừng hoặc tiếp tục bài trình chiếu màn hình đen?',
      options: ['Phím B (Black screen)', 'Phím W (White screen)', 'Phím Esc', 'Phím Space'],
      correctAnswer: 0,
      explanation: 'Khi đang trình chiếu, nhấn phím B sẽ tắt tạm màn hình đen để tập trung khán giả vào diễn giả.',
      hint: 'B viết tắt của Black.',
      points: 10,
      subjectId: 'powerpoint'
    }
  ];

  return {
    title: 'Gói Bài Thi & Thực Hành 3in1 Chuẩn (Word - Excel - PowerPoint)',
    description: 'Bộ đề thi chuẩn phân tách 3 phần độc lập kèm đầy đủ 3 file thực hành mẫu (.docx, .xlsx, .pptx)',
    modules: {
      word: { questions: wordQuestions, attachments: [wordAtt] },
      excel: { questions: excelQuestions, attachments: [excelAtt] },
      powerpoint: { questions: pptQuestions, attachments: [pptAtt] }
    },
    allQuestions: [...wordQuestions, ...excelQuestions, ...pptQuestions],
    allAttachments: [wordAtt, excelAtt, pptAtt],
    summaryText: 'Đã sẵn sàng gói đề chuẩn 3in1: 2 câu Word • 2 câu Excel • 2 câu PowerPoint kèm 3 file thực hành'
  };
}

/**
 * Count questions categorized by module
 */
export function countQuestionsByModule(questions: Question[]): {
  wordCount: number;
  excelCount: number;
  pptCount: number;
} {
  let wordCount = 0;
  let excelCount = 0;
  let pptCount = 0;

  for (const q of questions) {
    const sub = (q.subjectId || '').toLowerCase();
    if (sub === 'excel' || sub.includes('excel') || sub.includes('bangtinh')) {
      excelCount++;
    } else if (sub === 'powerpoint' || sub.includes('powerpoint') || sub.includes('ppt') || sub.includes('slide')) {
      pptCount++;
    } else {
      wordCount++;
    }
  }

  return { wordCount, excelCount, pptCount };
}

