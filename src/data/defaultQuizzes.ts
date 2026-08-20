import { Quiz } from '../types/quiz';

export const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: 'quiz-web-dev',
    title: 'Lập Trình Web Hiện Đại & JavaScript ES6+',
    description: 'Kiểm tra kiến thức cốt lõi về JavaScript, React, HTML5/CSS3 và các kỹ năng lập trình web frontend.',
    category: 'programming',
    difficulty: 'medium',
    timeLimitMinutes: 10,
    icon: 'Code2',
    badgeColor: '#3b82f6',
    author: 'PH- TINHOCGENZ Team',
    createdAt: '2026-08-15',
    questions: [
      {
        id: 'web-q1',
        type: 'single',
        prompt: 'Trong JavaScript ES6, từ khóa nào dùng để khai báo hằng số không thể gán lại giá trị?',
        options: ['var', 'let', 'const', 'static'],
        correctAnswer: 2,
        explanation: 'Từ khóa `const` dùng để khai báo hằng số (immutable binding). Biến khai báo bằng `const` không thể gán lại giá trị bằng toán tử gán `=`, mặc dù các thuộc tính của object khai báo bằng `const` vẫn có thể sửa đổi được.',
        hint: 'Nghĩ về từ viết tắt của "constant".',
        points: 10
      },
      {
        id: 'web-q2',
        type: 'multiple',
        prompt: 'Những phương thức nào sau đây của JavaScript Array KHÔNG làm thay đổi (mutate) mảng gốc?',
        options: ['map()', 'filter()', 'push()', 'concat()', 'splice()'],
        correctAnswer: [0, 1, 3],
        explanation: '`map()`, `filter()`, và `concat()` đều trả về một mảng mới mà không làm thay đổi mảng ban đầu (immutable). Ngược lại, `push()` và `splice()` trực tiếp làm thay đổi (mutate) mảng gốc.',
        hint: 'Các hàm thuộc lập trình hàm (functional programming) thường trả về mảng mới.',
        points: 15
      },
      {
        id: 'web-q3',
        type: 'true-false',
        prompt: 'Đoạn mã sau trả về `true` trong JavaScript: `[] == false`',
        codeSnippet: 'console.log([] == false);',
        correctAnswer: true,
        explanation: 'Trong JavaScript, khi so sánh `[] == false` bằng toán tử so sánh lỏng lẻo (`==`), cả hai vế được ép kiểu (coercion) về số (`Number([])` là 0 và `Number(false)` là 0), do đó kết quả là `true`. Để tránh lỗi này nên dùng `===`.',
        hint: 'Hãy nhớ về cơ chế ép kiểu ngầm định (Type Coercion) với toán tử ==.',
        points: 10
      },
      {
        id: 'web-q4',
        type: 'fill-blank',
        prompt: 'Trong React, Hook nào được sử dụng để quản lý các tác vụ bất đồng bộ hoặc can thiệp vào vòng đời component (Side Effects)? (Nhập tên hàm Hook)',
        correctAnswer: 'useEffect',
        explanation: '`useEffect` là Hook dùng để xử lý side effects như gọi API, lắng nghe sự kiện DOM, đăng ký subscription hoặc hẹn giờ trong Function Component.',
        hint: 'Bắt đầu bằng chữ "use" và kết thúc bằng "Effect".',
        points: 15
      },
      {
        id: 'web-q5',
        type: 'matching',
        prompt: 'Hãy ghép nối các giao thức / công nghệ web với vai trò chính xác của chúng:',
        matchingPairs: [
          { id: 'm1', left: 'HTTP / HTTPS', right: 'Giao thức truyền tải siêu văn bản an toàn giữa Client và Server' },
          { id: 'm2', left: 'WebSocket', right: 'Giao tiếp 2 chiều thời gian thực (Full-duplex real-time)' },
          { id: 'm3', left: 'CSS Flexbox / Grid', right: 'Bố cục và dàn trang giao diện người dùng đáp ứng (Responsive)' },
          { id: 'm4', left: 'Local Storage', right: 'Lưu trữ dữ liệu key-value bền vững trên trình duyệt' }
        ],
        explanation: 'HTTPS bảo mật kênh truyền, WebSocket phục vụ realtime, CSS Layout điều khiển giao diện hiển thị và Local Storage lưu dữ liệu cục bộ.',
        points: 20
      }
    ]
  },
  {
    id: 'quiz-english-master',
    title: 'Tiếng Anh Giao Tiếp & Ngữ Pháp Ứng Dụng',
    description: 'Thử thách trình độ từ vựng, ngữ pháp câu điều kiện, thì động từ và các thành ngữ tiếng Anh thông dụng.',
    category: 'english',
    difficulty: 'easy',
    timeLimitMinutes: 8,
    icon: 'Languages',
    badgeColor: '#10b981',
    author: 'Language Hub',
    createdAt: '2026-08-14',
    questions: [
      {
        id: 'eng-q1',
        type: 'single',
        prompt: 'Choose the correct form to complete the sentence: "If she _______ harder, she would have passed the final examination."',
        options: ['studied', 'had studied', 'studies', 'has studied'],
        correctAnswer: 1,
        explanation: 'Đây là câu điều kiện loại 3 (Third Conditional) diễn tả điều kiện trái với thực tế trong quá khứ. Cấu trúc mệnh đề If: `If + S + had + V3/ed, S + would have + V3/ed`.',
        hint: 'Chú ý vế sau có "would have passed" (dấu hiệu của điều kiện loại 3).',
        points: 10
      },
      {
        id: 'eng-q2',
        type: 'single',
        prompt: 'What does the idiom "Break a leg" mean in English?',
        options: ['Làm gãy chân', 'Chúc may mắn', 'Cẩn thận tai nạn', 'Bỏ cuộc'],
        correctAnswer: 1,
        explanation: '"Break a leg" là một thành ngữ phổ biến trong tiếng Anh, đặc biệt trong ngành nghệ thuật sân khấu, mang ý nghĩa chúc ai đó biểu diễn tốt hoặc chúc may mắn ("Good luck!").',
        hint: 'Đây là lời chúc dành cho diễn viên trước khi lên sân khấu.',
        points: 10
      },
      {
        id: 'eng-q3',
        type: 'multiple',
        prompt: 'Những từ nào sau đây là TÍNH TỪ (Adjectives)? (Chọn tất cả đáp án đúng)',
        options: ['Efficient', 'Quickly', 'Magnificent', 'Happiness', 'Reliable'],
        correctAnswer: [0, 2, 4],
        explanation: '`Efficient` (hiệu quả), `Magnificent` (tráng lệ), và `Reliable` (đáng tin cậy) là tính từ. `Quickly` là trạng từ (adverb) và `Happiness` là danh từ (noun).',
        hint: 'Chú ý các hậu tố phổ biến của tính từ như: -ent, -cent, -able.',
        points: 15
      },
      {
        id: 'eng-q4',
        type: 'fill-blank',
        prompt: 'Complete the sentence with the correct preposition: "She has been working as a software engineer _______ 2021."',
        correctAnswer: 'since',
        explanation: 'Trong thì Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous), "since" được dùng trước một mốc thời gian xác định (ví dụ: since 2021, since Monday), còn "for" dùng trước một khoảng thời gian (for 3 years).',
        hint: 'Từ chỉ mốc thời gian bắt đầu từ 4 chữ cái: s-i-...',
        points: 10
      },
      {
        id: 'eng-q5',
        type: 'true-false',
        prompt: 'The word "Information" can be used in plural form as "Informations".',
        correctAnswer: false,
        explanation: 'False. "Information" là một danh từ không đếm được (uncountable noun) trong tiếng Anh, không có dạng số nhiều "informations". Nếu muốn đếm, ta dùng cụm "a piece of information".',
        hint: 'Information có đếm được trực tiếp không?',
        points: 10
      }
    ]
  },
  {
    id: 'quiz-math-logic',
    title: 'Toán Học & Tư Duy Logic Ứng Dụng',
    description: 'Các bài toán đố tư duy logic, xác suất thống kê cơ bản và suy luận logic thực tế.',
    category: 'math',
    difficulty: 'hard',
    timeLimitMinutes: 12,
    icon: 'Binary',
    badgeColor: '#f59e0b',
    author: 'Math & Logic Institute',
    createdAt: '2026-08-16',
    questions: [
      {
        id: 'math-q1',
        type: 'single',
        prompt: 'Một cái gậy và một quả bóng có tổng giá tiền là 110.000 VNĐ. Cái gậy đắt hơn quả bóng 100.000 VNĐ. Hỏi quả bóng giá bao nhiêu?',
        options: ['10.000 VNĐ', '5.000 VNĐ', '15.000 VNĐ', '20.000 VNĐ'],
        correctAnswer: 1,
        explanation: 'Gọi giá quả bóng là x. Giá gậy là x + 100.000. Ta có: x + (x + 100.000) = 110.000 => 2x = 10.000 => x = 5.000 VNĐ. Khi đó gậy giá 105.000 VNĐ, chênh lệch đúng 100.000 VNĐ.',
        hint: 'Đừng để trực giác đánh lừa! Hãy đặt phương trình đại số đơn giản.',
        points: 15
      },
      {
        id: 'math-q2',
        type: 'single',
        prompt: 'Gieo đồng thời hai con xúc xắc 6 mặt cân đối. Xác suất để tổng số chấm xuất hiện bằng 7 là bao nhiêu?',
        options: ['1/6', '1/12', '7/36', '5/36'],
        correctAnswer: 0,
        explanation: 'Không gian mẫu có 6 x 6 = 36 trường hợp. Các cặp có tổng bằng 7 là: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) gồm 6 trường hợp. Xác suất = 6/36 = 1/6.',
        hint: 'Liệt kê các cặp (x, y) sao cho x + y = 7.',
        points: 15
      },
      {
        id: 'math-q3',
        type: 'true-false',
        prompt: 'Tất cả các số nguyên tố đều là số lẻ.',
        correctAnswer: false,
        explanation: 'Sai (False). Số 2 là số nguyên tố chẵn duy nhất và cũng là số nguyên tố nhỏ nhất.',
        hint: 'Hãy nhớ số nguyên tố chẵn duy nhất.',
        points: 10
      },
      {
        id: 'math-q4',
        type: 'fill-blank',
        prompt: 'Cho dãy số: 2, 6, 12, 20, 30, ... Số tiếp theo của dãy là bao nhiêu?',
        correctAnswer: '42',
        explanation: 'Quy luật của dãy số: Khoảng cách giữa các số tăng dần: +4, +6, +8, +10. Vậy bước nhảy tiếp theo là +12. 30 + 12 = 42. (Hoặc công thức n*(n+1): 1*2, 2*3, 3*4, 4*5, 5*6, 6*7 = 42).',
        hint: 'Bước nhảy giữa 2 số liên tiếp tăng thêm 2 đơn vị mỗi lần.',
        points: 20
      }
    ]
  },
  {
    id: 'quiz-informatics-skills',
    title: 'Tin Học Văn Phòng & An Toàn Số',
    description: 'Kỹ năng Excel, phím tắt năng suất, an toàn mạng và phòng chống lừa đảo trực tuyến.',
    category: 'informatics',
    difficulty: 'easy',
    timeLimitMinutes: 7,
    icon: 'ShieldCheck',
    badgeColor: '#ec4899',
    author: 'Digital Skills Academy',
    createdAt: '2026-08-17',
    questions: [
      {
        id: 'info-q1',
        type: 'single',
        prompt: 'Trong Microsoft Excel, hàm nào dùng để tìm kiếm giá trị theo chiều dọc trong một bảng dữ liệu?',
        options: ['HLOOKUP', 'VLOOKUP / XLOOKUP', 'COUNTIF', 'INDEX-MATCH'],
        correctAnswer: 1,
        explanation: '`VLOOKUP` (Vertical Lookup) và hàm mới `XLOOKUP` dùng để tra cứu giá trị theo cột dọc trong Excel.',
        hint: 'Chữ V đại diện cho "Vertical" (dọc).',
        points: 10
      },
      {
        id: 'info-q2',
        type: 'multiple',
        prompt: 'Những biện pháp nào giúp nâng cao an toàn tài khoản trực tuyến? (Chọn tất cả các đáp án đúng)',
        options: [
          'Kích hoạt xác thực 2 yếu tố (2FA / OTP)',
          'Sử dụng chung một mật khẩu cho tất cả tài khoản',
          'Sử dụng mật khẩu mạnh dài trên 12 ký tự kết hợp chữ hoa, số và ký tự đặc biệt',
          'Không bấm vào các đường link lạ trong email mạo danh ngân hàng'
        ],
        correctAnswer: [0, 2, 3],
        explanation: 'Dùng chung 1 mật khẩu là thói quen rất nguy hiểm (nếu 1 nơi rò rỉ sẽ mất hết). Bật 2FA, dùng mật khẩu phức tạp và cảnh giác phishing là các nguyên tắc cốt lõi.',
        hint: 'Hành vi dùng chung mật khẩu có an toàn không?',
        points: 15
      },
      {
        id: 'info-q3',
        type: 'fill-blank',
        prompt: 'Tổ hợp phím tắt tiêu chuẩn trên Windows để tìm kiếm nhanh nội dung trong trang web hoặc tài liệu là gì? (Ví dụ nhập: Ctrl + F)',
        correctAnswer: 'Ctrl + F',
        explanation: 'Phím tắt `Ctrl + F` (Find) dùng để mở hộp thoại tìm kiếm trên hầu hết các trình duyệt và phần mềm văn phòng.',
        hint: 'Ctrl kết hợp với chữ cái đầu của từ "Find".',
        points: 10
      }
    ]
  },
  {
    id: 'quiz-science-nature',
    title: 'Khoa Học & Trí Tuệ Tự Nhiên',
    description: 'Khám phá thế giới vật lý, hóa học, vũ trụ và môi trường sống quanh ta.',
    category: 'science',
    difficulty: 'medium',
    timeLimitMinutes: 10,
    icon: 'Sparkles',
    badgeColor: '#8b5cf6',
    author: 'Science Daily',
    createdAt: '2026-08-18',
    questions: [
      {
        id: 'sci-q1',
        type: 'single',
        prompt: 'Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?',
        options: ['Sao Kim (Venus)', 'Sao Thủy (Mercury)', 'Sao Hỏa (Mars)', 'Trái Đất (Earth)'],
        correctAnswer: 1,
        explanation: 'Sao Thủy (Mercury) là hành tinh nằm gần Mặt Trời nhất và cũng là hành tinh nhỏ nhất trong Hệ Mặt Trời.',
        hint: 'Tên của một nguyên tố kim loại ở thể lỏng ở nhiệt độ thường.',
        points: 10
      },
      {
        id: 'sci-q2',
        type: 'true-false',
        prompt: 'Âm thanh có thể truyền đi trong môi trường chân không ngoài không gian.',
        correctAnswer: false,
        explanation: 'Sai (False). Âm thanh là sóng cơ học, cần môi trường vật chất (chất rắn, lỏng, khí) có các phân tử dao động để truyền đi. Chân không không có vật chất nên âm thanh không truyền được.',
        hint: 'Sóng âm có cần hạt vật chất để dao động không?',
        points: 10
      },
      {
        id: 'sci-q3',
        type: 'fill-blank',
        prompt: 'Công thức hóa học của nước là gì? (Nhập ký hiệu)',
        correctAnswer: 'H2O',
        explanation: 'Nước được cấu tạo bởi hai nguyên tử Hydro và một nguyên tử Oxy (H2O).',
        hint: '2 nguyên tử H và 1 nguyên tử O.',
        points: 10
      }
    ]
  }
];
