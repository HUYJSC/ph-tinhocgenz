import { Quiz } from '../types/quiz';

export const DEFAULT_QUIZZES: Quiz[] = [
  // 1. Word, Excel, PowerPoint (3Buổi 1 môn)
  {
    id: 'quiz-office-fast-3in1',
    title: '1. Word, Excel, PowerPoint (3Buổi 1 môn) - Đề Thi Cấp Tốc',
    description: 'Chương trình cấp tốc 3 buổi/môn: Kỹ năng định dạng văn bản hành chính Word, tính toán hàm Excel và thiết kế slide thuyết trình PowerPoint chuẩn công sở.',
    category: 'office-fast-3in1',
    difficulty: 'easy',
    timeLimitMinutes: 15,
    icon: 'Layers',
    badgeColor: '#2563eb',
    author: 'PH - TINHOCGENZ Văn Phòng Unit',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'fast3in1-q1',
        type: 'single',
        prompt: 'Trong Microsoft Word, tổ hợp phím tắt nào dùng để căn lề đều hai bên (Justify) cho đoạn văn bản?',
        options: ['Ctrl + J', 'Ctrl + E', 'Ctrl + L', 'Ctrl + R'],
        correctAnswer: 0,
        explanation: 'Phím `Ctrl + J` (Justify) căn đều hai lề văn bản. `Ctrl + E` căn giữa, `Ctrl + L` căn trái, `Ctrl + R` căn phải.',
        hint: 'Chữ J viết tắt của Justify.',
        points: 10
      },
      {
        id: 'fast3in1-q2',
        type: 'single',
        prompt: 'Trong Excel, hàm nào được dùng để tính trung bình cộng của một vùng dữ liệu số?',
        options: ['AVERAGE', 'SUM', 'COUNT', 'MEDIAN'],
        correctAnswer: 0,
        explanation: 'Hàm `AVERAGE(number1, [number2], ...)` trả về giá trị trung bình cộng của các đối số.',
        hint: 'Hàm tiếng Anh nghĩa là trung bình.',
        points: 10
      },
      {
        id: 'fast3in1-q3',
        type: 'single',
        prompt: 'Trong PowerPoint, phím tắt nào dùng để bắt đầu trình chiếu bài giảng từ Slide đầu tiên?',
        options: ['F5', 'Shift + F5', 'Ctrl + F5', 'Alt + F5'],
        correctAnswer: 0,
        explanation: 'Phím `F5` bắt đầu trình chiếu từ slide đầu tiên. `Shift + F5` trình chiếu từ slide hiện hành.',
        hint: 'Phím chức năng F ở hàng đầu bàn phím.',
        points: 10
      }
    ]
  },

  // 2. CC CNTT Cơ bản (6 buổi)
  {
    id: 'quiz-cc-cntt-basic',
    title: '2. CC CNTT Cơ bản (6 buổi) - Luyện Thi Chuẩn Bộ GD&ĐT',
    description: 'Nội dung chứng chỉ CNTT Cơ bản theo Thông tư 03: Cấu trúc máy tính, hệ điều hành Windows, Internet và bảo mật thông tin.',
    category: 'cc-cntt-basic',
    difficulty: 'easy',
    timeLimitMinutes: 20,
    icon: 'Cpu',
    badgeColor: '#10b981',
    author: 'PH - TINHOCGENZ Khảo Thí Unit',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'ccbasic-q1',
        type: 'single',
        prompt: '1 Gigabyte (GB) tương đương với bao nhiêu Megabyte (MB) theo chuẩn đo lường dung lượng máy tính?',
        options: ['1024 MB', '1000 MB', '1048576 MB', '512 MB'],
        correctAnswer: 0,
        explanation: 'Trong hệ nhị phân tin học, 1 GB = 1024 MB = 1,048,576 KB.',
        hint: 'Lũy thừa 2^10 = 1024.',
        points: 10
      },
      {
        id: 'ccbasic-q2',
        type: 'multiple',
        prompt: 'Những thiết bị nào sau đây là thiết bị ngoại vi ĐẦU VÀO (Input Devices)?',
        options: ['Bàn phím (Keyboard)', 'Chuột máy tính (Mouse)', 'Máy quét (Scanner)', 'Máy in (Printer)'],
        correctAnswer: [0, 1, 2],
        explanation: 'Bàn phím, chuột và máy quét đưa dữ liệu vào máy tính. Máy in là thiết bị đầu ra (Output).',
        hint: 'Máy in là thiết bị xuất ra giấy.',
        points: 15
      },
      {
        id: 'ccbasic-q3',
        type: 'true-false',
        prompt: 'Mật khẩu mạnh nên có tối thiểu 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.',
        correctAnswer: true,
        explanation: 'Đúng. Mật khẩu phức tạp giúp chống lại các cuộc tấn công Brute-force và rò rỉ dữ liệu.',
        hint: 'Nguyên tắc an toàn thông tin.',
        points: 10
      }
    ]
  },

  // 3. CC CNTT Nâng cao (6 buổi)
  {
    id: 'quiz-cc-cntt-advanced',
    title: '3. CC CNTT Nâng cao (6 buổi) - Xử Lý Dữ Liệu & Macro',
    description: 'Chuyên đề nâng cao: Hàm tra cứu nhiều điều kiện (INDEX/MATCH, XLOOKUP), xử lý bảng dữ liệu lớn, Pivot Table nâng cao và Mail Merge.',
    category: 'cc-cntt-advanced',
    difficulty: 'hard',
    timeLimitMinutes: 25,
    icon: 'Database',
    badgeColor: '#8b5cf6',
    author: 'PH - TINHOCGENZ Nâng Cao Unit',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'ccadv-q1',
        type: 'single',
        prompt: 'Trong Excel nâng cao, sự kết hợp hàm nào cho phép tra cứu dữ liệu từ phải sang trái mà VLOOKUP không làm được?',
        options: ['INDEX + MATCH', 'SUMIFS + COUNTIFS', 'LEFT + RIGHT', 'CONCATENATE + FIND'],
        correctAnswer: 0,
        explanation: 'Cặp hàm `INDEX` và `MATCH` tra cứu linh hoạt ở bất kỳ cột nào sang trái hoặc sang phải, không bị giới hạn cột đầu tiên như VLOOKUP.',
        hint: 'Hàm INDEX lấy giá trị theo hàng/cột kết hợp MATCH tìm vị trí.',
        points: 10
      },
      {
        id: 'ccadv-q2',
        type: 'single',
        prompt: 'Trong Microsoft Word nâng cao, tính năng nào cho phép tự động trộn thư hàng loạt từ danh sách dữ liệu Excel?',
        options: ['Mail Merge', 'Track Changes', 'AutoCorrect', 'Cross-reference'],
        correctAnswer: 0,
        explanation: 'Tính năng `Mail Merge` (Trộn thư) tạo hàng loạt thư mời, bảng điểm, hợp đồng từ file danh sách Excel.',
        hint: 'Tab Mailings trong Word.',
        points: 10
      }
    ]
  },

  // 4. CNTT Cơ bản: Word + Excel (10-12b)
  {
    id: 'quiz-cntt-basic-we',
    title: '4. CNTT Cơ bản: Word + Excel (10-12b) - Thực Hành Bài Bản',
    description: 'Khóa học nền tảng 10-12 buổi: Soạn thảo văn bản chuẩn thể thức Nghị định 30, kỹ năng bảng biểu Word và công thức tính toán tài chính Excel.',
    category: 'cntt-basic-we',
    difficulty: 'medium',
    timeLimitMinutes: 20,
    icon: 'BookOpen',
    badgeColor: '#06b6d4',
    author: 'PH - TINHOCGENZ Thực Chiến Unit',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'we-basic-q1',
        type: 'single',
        prompt: 'Theo Nghị định 30/2020/NĐ-CP về thể thức văn bản hành chính, font chữ bắt buộc sử dụng là:',
        options: ['Times New Roman', 'Arial', 'Calibri', 'Tahoma'],
        correctAnswer: 0,
        explanation: 'Quy định chuẩn văn bản hành chính nhà nước sử dụng phông chữ Times New Roman, bảng mã Unicode.',
        hint: 'Font chữ có chân phổ biến nhất.',
        points: 10
      },
      {
        id: 'we-basic-q2',
        type: 'single',
        prompt: 'Để cố định dòng hoặc cột tiêu đề khi cuộn bảng tính Excel, ta dùng tính năng nào?',
        options: ['Freeze Panes', 'Split', 'Hide Columns', 'Format as Table'],
        correctAnswer: 0,
        explanation: 'Tính năng `Freeze Panes` trong tab View giúp cố định dòng/cột tiêu đề khi cuộn trang.',
        hint: 'View -> Freeze Panes.',
        points: 10
      }
    ]
  },

  // 5. CNTT Nâng Cao: Word + Excel (10-12b)
  {
    id: 'quiz-cntt-adv-we',
    title: '5. CNTT Nâng Cao: Word + Excel (10-12b) - Chuyên Sâu Văn Phòng',
    description: 'Khóa chuyên sâu 10-12 buổi: Tự động hóa văn bản Word với Style, Section Break, Mục lục tự động, phân tích dữ liệu đa chiều PivotTable và Dashboard Excel.',
    category: 'cntt-adv-we',
    difficulty: 'hard',
    timeLimitMinutes: 25,
    icon: 'BarChart2',
    badgeColor: '#ec4899',
    author: 'PH - TINHOCGENZ Master Unit',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'we-adv-q1',
        type: 'single',
        prompt: 'Trong Word nâng cao, loại ngắt trang nào (Break) cho phép đặt hướng giấy (Orientation) khác nhau giữa các trang trong cùng một tài liệu?',
        options: ['Section Break (Next Page)', 'Page Break', 'Column Break', 'Line Break'],
        correctAnswer: 0,
        explanation: '`Section Break (Next Page)` chia văn bản thành các phân vùng độc lập, cho phép đổi trang ngang/dọc, đổi Header/Footer riêng biệt.',
        hint: 'Ngắt phân đoạn Section.',
        points: 10
      },
      {
        id: 'we-adv-q2',
        type: 'single',
        prompt: 'Để bảo vệ công thức tính trong Excel và chỉ cho phép người khác nhập vào các ô dữ liệu chỉ định, ta thực hiện:',
        options: ['Bỏ khóa ô nhập liệu (Unlock Cells) rồi bật Protect Sheet', 'Bật Protect Sheet trực tiếp', 'Đặt mật khẩu mở file', 'Ẩn cột công thức'],
        correctAnswer: 0,
        explanation: 'Đầu tiên bỏ thuộc tính Locked ở các ô nhập liệu, sau đó vào Review -> Protect Sheet để khóa toàn bộ công thức còn lại.',
        hint: 'Unlock ô nhập trước, sau đó Protect Sheet.',
        points: 10
      }
    ]
  },

  // 6. Ứng dụng AI vào công việc Văn phòng (5b)
  {
    id: 'quiz-ai-office',
    title: '6. Ứng dụng AI vào công việc Văn phòng (5b) - Tối Ưu Hiệu Suất',
    description: 'Kỹ năng làm chủ các công cụ Trí tuệ nhân tạo (ChatGPT, Claude, Copilot, Gamma) để viết báo cáo, tóm tắt tài liệu, phân tích Excel và thiết kế slide tự động.',
    category: 'ai-office',
    difficulty: 'medium',
    timeLimitMinutes: 15,
    icon: 'Sparkles',
    badgeColor: '#f59e0b',
    author: 'PH - TINHOCGENZ AI Innovation Lab',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'ai-q1',
        type: 'single',
        prompt: 'Kỹ thuật viết câu lệnh (Prompting) nào mang lại kết quả AI chính xác nhất cho công việc văn phòng?',
        options: [
          'Giao vai trò (Role) + Bối cảnh (Context) + Nhiệm vụ cụ thể (Task) + Định dạng kết quả (Format)',
          'Chỉ hỏi một câu thật ngắn gọn',
          'Không cần cung cấp thông tin mẫu',
          'Sử dụng từ ngữ mơ hồ'
        ],
        correctAnswer: 0,
        explanation: 'Công thức Prompt chuẩn: [Vai trò] + [Bối cảnh] + [Yêu cầu chi tiết] + [Mẫu định dạng mong muốn] giúp AI đưa ra kết quả sát thực tế nhất.',
        hint: 'Cấu trúc Prompt chuyên nghiệp RCTF.',
        points: 10
      },
      {
        id: 'ai-q2',
        type: 'multiple',
        prompt: 'Những công cụ AI nào sau đây hỗ trợ tự động tạo bài trình chiếu thuyết trình PowerPoint?',
        options: ['Gamma App', 'Microsoft Copilot in PowerPoint', 'Tome AI', 'WinRAR'],
        correctAnswer: [0, 1, 2],
        explanation: 'Gamma, Copilot và Tome là các công cụ AI hàng đầu giúp thiết kế slide tự động. WinRAR là phần mềm nén tệp.',
        hint: 'WinRAR không phải là AI.',
        points: 15
      }
    ]
  },

  // 7. Excel cho Kế toán (Custom tuỳ nhu cầu)
  {
    id: 'quiz-excel-accounting',
    title: '7. Excel cho Kế toán (Custom tuỳ nhu cầu) - Nghiệp Vụ Tài Chính',
    description: 'Hệ thống hàm và mẫu biểu kế toán: Sổ nhật ký chung, bảng trích khấu hao TSCĐ, hàm SUMIFS tính doanh thu theo kỳ và đối chiếu công nợ.',
    category: 'excel-accounting',
    difficulty: 'hard',
    timeLimitMinutes: 25,
    icon: 'TrendingUp',
    badgeColor: '#d97706',
    author: 'PH - TINHOCGENZ Kế Toán Unit',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'acc-q1',
        type: 'single',
        prompt: 'Trong bảng sổ cái kế toán, hàm nào được dùng để tính tổng số tiền phát sinh Nợ/Có theo mã tài khoản và trong khoảng ngày cụ thể?',
        options: ['SUMIFS', 'SUMIF', 'COUNTIFS', 'VLOOKUP'],
        correctAnswer: 0,
        explanation: 'Hàm `SUMIFS` tính tổng với nhiều điều kiện (tài khoản, từ ngày, đến ngày).',
        hint: 'Hàm SUM có chữ S ở cuối cho nhiều điều kiện.',
        points: 10
      },
      {
        id: 'acc-q2',
        type: 'single',
        prompt: 'Trong kế toán tiền lương, hàm nào dùng để kiểm tra và xử lý trường hợp tìm kiếm bị lỗi #N/A để hiển thị số 0?',
        options: ['IFERROR(VLOOKUP(...), 0)', 'ISERROR(...)', 'COUNTIF(...)', 'ROUND(...)'],
        correctAnswer: 0,
        explanation: 'Cấu trúc `IFERROR(biểu_thức, 0)` bắt lỗi và thay thế bằng 0 giúp các công thức cộng tổng phía sau không bị lỗi dây chuyền.',
        hint: 'Hàm IFERROR.',
        points: 10
      }
    ]
  },

  // 8. Word (6 buổi)
  {
    id: 'quiz-word-6b',
    title: '8. Word (6 buổi) - Soạn Thảo & Trình Bày Văn Bản Chuẩn',
    description: 'Trọn bộ kỹ năng soạn thảo 6 buổi: Căn lề chuẩn, Tab Stop, Header & Footer, Table chuyên nghiệp và xuất file PDF in ấn sắc nét.',
    category: 'word-6b',
    difficulty: 'easy',
    timeLimitMinutes: 15,
    icon: 'FileText',
    badgeColor: '#2563eb',
    author: 'PH - TINHOCGENZ Word Team',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'w6-q1',
        type: 'single',
        prompt: 'Để tạo dấu chấm chấm (...) tự động khi soạn hợp đồng trong Word, ta sử dụng công cụ nào trên thanh thước kẻ (Ruler)?',
        options: ['Tab Stop với Leader', 'Dấu chấm bàn phím', 'Dấu gạch dưới', 'Bullet Point'],
        correctAnswer: 0,
        explanation: 'Sử dụng điểm dừng Tab (Tab Stop) kết hợp tùy chọn Leader dấu chấm trong hộp thoại Tabs để đường chấm thẳng hàng tuyệt đối.',
        hint: 'Tính năng Tab Leader.',
        points: 10
      },
      {
        id: 'w6-q2',
        type: 'single',
        prompt: 'Phím tắt để tăng/giảm cỡ chữ nhanh từng bước trong Word là:',
        options: ['Ctrl + ] hoặc Ctrl + [', 'Ctrl + Shift + >', 'Alt + H + F + S', 'Tất cả đều đúng'],
        correctAnswer: 3,
        explanation: 'Cả `Ctrl + ]/[`, `Ctrl + Shift + >/<` và phím tắt Ribbon đều hỗ trợ điều chỉnh cỡ chữ nhanh.',
        hint: 'Tất cả các phương án đều đúng.',
        points: 10
      }
    ]
  },

  // 9. Excel (6 buổi)
  {
    id: 'quiz-excel-6b',
    title: '9. Excel (6 buổi) - Bảng Tính & Xử Lý Dữ Liệu Thông Minh',
    description: 'Trọn bộ kỹ năng bảng tính 6 buổi: 20 hàm thông dụng (IF, VLOOKUP, HLOOKUP, COUNTIF, SUMIF), lọc nâng cao Advanced Filter và vẽ biểu đồ Chart.',
    category: 'excel-6b',
    difficulty: 'medium',
    timeLimitMinutes: 20,
    icon: 'FileSpreadsheet',
    badgeColor: '#10b981',
    author: 'PH - TINHOCGENZ Excel Team',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'e6-q1',
        type: 'single',
        prompt: 'Ký hiệu nào trong Excel dùng để chuyển đổi địa chỉ ô từ tương đối sang tuyệt đối (ví dụ $A$1)?',
        options: ['Phím F4 (Ký tự $)', 'Phím F2', 'Phím F9', 'Phím Alt + Enter'],
        correctAnswer: 0,
        explanation: 'Nhấn phím `F4` để tự động thêm ký hiệu `$` khóa dòng và cột cố định.',
        hint: 'Phím F4.',
        points: 10
      },
      {
        id: 'e6-q2',
        type: 'single',
        prompt: 'Công thức `=IF(8 >= 5, "Đậu", "Rớt")` sẽ trả về kết quả gì?',
        options: ['Đậu', 'Rớt', '#VALUE!', 'TRUE'],
        correctAnswer: 0,
        explanation: 'Vì điều kiện 8 >= 5 là TRUE, hàm IF trả về giá trị nhánh đúng là "Đậu".',
        hint: '8 lớn hơn 5.',
        points: 10
      }
    ]
  },

  // 10. PPT (6 buổi)
  {
    id: 'quiz-ppt-6b',
    title: '10. PPT (6 buổi) - Thiết Kế Slide Thuyết Trình Ấn Tượng',
    description: 'Khóa học thuyết trình 6 buổi: Bố cục trực quan, hiệu ứng chuyển động Animation/Transition mượt mà, kỹ thuật Slide Master và chèn Video/Audio đa phương tiện.',
    category: 'ppt-6b',
    difficulty: 'easy',
    timeLimitMinutes: 15,
    icon: 'MonitorPlay',
    badgeColor: '#f97316',
    author: 'PH - TINHOCGENZ Presentation Team',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'ppt6-q1',
        type: 'single',
        prompt: 'Công cụ nào trong PowerPoint cho phép định dạng màu sắc, font chữ và logo đồng bộ cho toàn bộ các slide một cách tự động?',
        options: ['Slide Master', 'Format Background', 'Design Ideas', 'Themes'],
        correctAnswer: 0,
        explanation: '`Slide Master` (View -> Slide Master) là trang mẫu quản lý định dạng gốc cho toàn bộ bài thuyết trình.',
        hint: 'View -> Slide Master.',
        points: 10
      },
      {
        id: 'ppt6-q2',
        type: 'single',
        prompt: 'Hiệu ứng nào dùng để tạo chuyển cảnh biến hình (Morph) mượt mà giữa hai slide liên tiếp?',
        options: ['Morph Transition', 'Fade', 'Push', 'Wipe'],
        correctAnswer: 0,
        explanation: 'Hiệu ứng `Morph` trong tab Transitions nhận diện các đối tượng giống nhau giữa 2 slide và biến đổi chuyển động liền mạch.',
        hint: 'Chuyển cảnh Morph.',
        points: 10
      }
    ]
  }
];
