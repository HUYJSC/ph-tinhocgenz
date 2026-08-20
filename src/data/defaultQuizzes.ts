import { Quiz } from '../types/quiz';

export const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: 'quiz-cntt-basic',
    title: '1. CNTT & Tin Học Cơ Bản (Máy Tính & Internet)',
    description: 'Chương trình chuẩn Tin học cơ bản: Cấu trúc phần cứng máy tính, hệ điều hành Windows, thao tác tệp thư mục và sử dụng Internet an toàn.',
    category: 'cntt-basic',
    difficulty: 'easy',
    timeLimitMinutes: 15,
    icon: 'Cpu',
    badgeColor: '#10b981',
    author: 'PH- TINHOCGENZ Cơ Bản Unit',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'basic-q1',
        type: 'single',
        prompt: 'Tổ hợp phím tắt tiêu chuẩn nào trong hệ điều hành Windows dùng để mở nhanh File Explorer (Trình quản lý tệp tin)?',
        options: ['Windows + E', 'Windows + R', 'Windows + D', 'Ctrl + Shift + Esc'],
        correctAnswer: 0,
        explanation: 'Phím `Windows + E` (Explorer) mở ngay cửa sổ quản lý thư mục và tệp tin trong Windows.',
        hint: 'Chữ E viết tắt của Explorer.',
        points: 10
      },
      {
        id: 'basic-q2',
        type: 'single',
        prompt: 'Thành phần nào sau đây là thiết bị ĐẦU VÀO (Input Device) của hệ thống máy tính?',
        options: ['Bàn phím (Keyboard)', 'Màn hình (Monitor)', 'Máy in (Printer)', 'Loa (Speaker)'],
        correctAnswer: 0,
        explanation: 'Bàn phím, chuột, máy quét (scanner) là thiết bị đầu vào (Input). Màn hình, máy in, loa là thiết bị đầu ra (Output).',
        hint: 'Thiết bị truyền thông tin từ người dùng vào máy tính.',
        points: 10
      },
      {
        id: 'basic-q3',
        type: 'multiple',
        prompt: 'Những đuôi mở rộng nào sau đây là định dạng tệp nén dữ liệu phổ biến?',
        options: ['.zip', '.rar', '.7z', '.exe'],
        correctAnswer: [0, 1, 2],
        explanation: '.zip, .rar và .7z là các định dạng nén tệp tin thông dụng. .exe là tệp thực thi chương trình.',
        hint: '.exe là file chạy phần mềm.',
        points: 15
      },
      {
        id: 'basic-q4',
        type: 'true-false',
        prompt: 'Thao tác nhấn phím `Shift + Delete` khi xóa một tệp tin trong Windows sẽ chuyển tệp đó vào thùng rác (Recycle Bin).',
        correctAnswer: false,
        explanation: 'Sai. Phím `Shift + Delete` sẽ xóa vĩnh viễn tệp tin khỏi ổ cứng mà KHÔNG đưa vào thùng rác Recycle Bin.',
        hint: 'Shift + Delete là xóa vĩnh viễn không qua thùng rác.',
        points: 10
      }
    ]
  },
  {
    id: 'quiz-mos-office',
    title: '2. Tin Học Văn Phòng Quốc Tế MOS (Word, Excel, PowerPoint)',
    description: 'Chuyên đề ôn luyện thi chứng chỉ MOS: Kỹ năng định dạng văn bản hành chính Word, bảng tính Excel và thiết kế trình chiếu PowerPoint.',
    category: 'mos-office',
    difficulty: 'medium',
    timeLimitMinutes: 15,
    icon: 'Table',
    badgeColor: '#2563eb',
    author: 'PH- TINHOCGENZ MOS Master',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'mos-q1',
        type: 'single',
        prompt: 'Trong Microsoft Excel, cú pháp chuẩn của hàm tìm kiếm theo cột `VLOOKUP` là gì?',
        options: [
          'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
          'VLOOKUP(table_array, lookup_value, row_index_num, [range_lookup])',
          'VLOOKUP(lookup_value, col_index_num, table_array, [exact_match])',
          'VLOOKUP(range_lookup, lookup_value, table_array, col_index_num)'
        ],
        correctAnswer: 0,
        explanation: 'Cú pháp chuẩn của VLOOKUP là: `VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])`.',
        hint: 'Giá trị tìm kiếm luôn đứng ở vị trí đầu tiên.',
        points: 10
      },
      {
        id: 'mos-q2',
        type: 'single',
        prompt: 'Trong Microsoft Word, để tạo mục lục tự động (Table of Contents), văn bản tiêu đề cần áp dụng định dạng nào?',
        options: ['Các thẻ Heading trong nhóm Styles', 'Chữ in đậm và màu đỏ', 'Tăng font size lên 18pt', 'Gõ phím Tab thủ công'],
        correctAnswer: 0,
        explanation: 'Word tự động quét các tiêu đề được gán Heading 1, Heading 2... trong Styles để tạo mục lục tự động.',
        points: 10
      },
      {
        id: 'mos-q3',
        type: 'multiple',
        prompt: 'Những tính năng nào sau đây của Excel cho phép phân tích và tổng hợp dữ liệu đa chiều tự động?',
        options: [
          'PivotTable (Bảng tổng hợp động)',
          'Slicer (Bộ lọc trực quan)',
          'Track Changes',
          'PivotChart (Biểu đồ động)'
        ],
        correctAnswer: [0, 1, 3],
        explanation: 'PivotTable, Slicer và PivotChart là bộ ba công cụ phân tích dữ liệu đa chiều hàng đầu của Excel.',
        points: 15
      },
      {
        id: 'mos-q4',
        type: 'fill-blank',
        prompt: 'Trong PowerPoint, hiệu ứng chuyển trang mượt mà giúp biến đổi hình khối giữa 2 slide liên tiếp có tên là gì?',
        correctAnswer: 'Morph',
        explanation: 'Hiệu ứng Morph Transition tự động biến đổi vị trí, kích thước đối tượng mượt mà giữa các slide.',
        points: 15
      }
    ]
  },
  {
    id: 'quiz-ic3-gs6',
    title: '3. Chuẩn Tin Học Quốc Tế IC3 GS6 (Global Standard)',
    description: 'Bộ câu hỏi chuẩn thế giới IC3: Điện toán đám mây Cloud Computing, an toàn thông tin số, bản quyền số và ứng dụng then chốt.',
    category: 'ic3-gs',
    difficulty: 'medium',
    timeLimitMinutes: 15,
    icon: 'ShieldCheck',
    badgeColor: '#3b82f6',
    author: 'PH- TINHOCGENZ IC3 Dept',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'ic3-q1',
        type: 'single',
        prompt: 'Bộ nhớ nào sau đây sẽ bị xóa sạch toàn bộ dữ liệu khi ngắt nguồn cấp điện (Volatile Memory)?',
        options: ['RAM', 'ROM', 'Ổ cứng SSD', 'Thẻ nhớ Flash USB'],
        correctAnswer: 0,
        explanation: 'RAM là bộ nhớ truy xuất ngẫu nhiên tạm thời, dữ liệu trong RAM sẽ biến mất ngay khi mất nguồn điện.',
        points: 10
      },
      {
        id: 'ic3-q2',
        type: 'multiple',
        prompt: 'Những hành động nào sau đây giúp đảm bảo an toàn thông tin trên không gian mạng?',
        options: [
          'Kích hoạt xác thực 2 lớp (2FA / Multi-Factor Authentication)',
          'Không nhấp vào đường link lạ trong Email mạo danh (Phishing)',
          'Sử dụng chung một mật khẩu cho tất cả tài khoản ngân hàng và mạng xã hội',
          'Sử dụng VPN khi truy cập Wi-Fi công cộng không có mật khẩu'
        ],
        correctAnswer: [0, 1, 3],
        explanation: 'Bật 2FA, cảnh giác Phishing và dùng VPN bảo vệ an toàn trên mạng.',
        points: 15
      },
      {
        id: 'ic3-q3',
        type: 'true-false',
        prompt: 'Điện toán đám mây (Cloud Computing) cho phép người dùng truy cập dữ liệu và tài nguyên từ bất kỳ đâu có kết nối Internet.',
        correctAnswer: true,
        explanation: 'Đúng. Tài nguyên trên đám mây được lưu trữ máy chủ từ xa và truy xuất mọi lúc mọi nơi.',
        points: 10
      }
    ]
  },
  {
    id: 'quiz-cntt-advanced',
    title: '4. CNTT Nâng Cao & Xử Lý Dữ Liệu Chuyên Sâu',
    description: 'Chuyên đề nâng cao: Hàm INDEX-MATCH lồng phức hợp, Data Validation nâng cao, xử lý mảng động Dynamic Arrays và Tự động hóa bảng tính.',
    category: 'cntt-advanced',
    difficulty: 'hard',
    timeLimitMinutes: 20,
    icon: 'Layers',
    badgeColor: '#ea580c',
    author: 'PH- TINHOCGENZ Advanced Lab',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'adv-q1',
        type: 'single',
        prompt: 'Ưu điểm vượt trội của cặp hàm `INDEX & MATCH` so với hàm `VLOOKUP` truyền thống trong Excel là gì?',
        options: [
          'Có thể tra cứu dữ liệu sang trái của cột tìm kiếm và không bị ảnh hưởng khi chèn/xóa cột',
          'Chỉ chạy được trên hệ điều hành MacOS',
          'Không hỗ trợ tìm kiếm chính xác tuyệt đối',
          'Tự động in đậm kết quả tìm được'
        ],
        correctAnswer: 0,
        explanation: 'INDEX & MATCH tra cứu dữ liệu 2 chiều sang trái hoặc phải linh hoạt và không bị vỡ công thức khi thay đổi cấu trúc cột.',
        points: 15
      },
      {
        id: 'adv-q2',
        type: 'multiple',
        prompt: 'Những hàm mảng động (Dynamic Array Functions) nào sau đây được bổ sung trong các phiên bản Excel mới (Excel 365 / 2021)?',
        options: ['FILTER()', 'UNIQUE()', 'SORT()', 'SUM()'],
        correctAnswer: [0, 1, 2],
        explanation: 'FILTER, UNIQUE, SORT, XLOOKUP là các hàm mảng động thế hệ mới mạnh mẽ của Microsoft Excel.',
        points: 15
      },
      {
        id: 'adv-q3',
        type: 'fill-blank',
        prompt: 'Nhập tên hàm trong Excel dùng để bẫy và thay thế các giá trị lỗi (#N/A, #DIV/0!) bằng một giá trị tùy biến:',
        correctAnswer: 'IFERROR',
        explanation: 'Hàm `IFERROR(value, value_if_error)` dùng để bẫy và xử lý mọi lỗi phát sinh trong công thức tính toán.',
        points: 15
      }
    ]
  },
  {
    id: 'quiz-programming',
    title: '5. Lập Trình Python & Thuật Toán Tin Học Trẻ',
    description: 'Chương trình đào tạo lập trình: Cú pháp Python 3, cấu trúc dữ liệu List/Dict/Set, giải thuật tìm kiếm, sắp xếp và tư duy giải quyết bài toán.',
    category: 'programming',
    difficulty: 'hard',
    timeLimitMinutes: 20,
    icon: 'Code2',
    badgeColor: '#f59e0b',
    author: 'PH- TINHOCGENZ Coding Lab',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'py-q1',
        type: 'single',
        prompt: 'Cho đoạn mã Python sau. Kết quả in ra màn hình là gì?',
        codeSnippet: 'numbers = [1, 2, 3, 4, 5]\nresult = [x**2 for x in numbers if x % 2 != 0]\nprint(result)',
        options: ['[1, 9, 25]', '[4, 16]', '[1, 4, 9, 16, 25]', '[1, 3, 5]'],
        correctAnswer: 0,
        explanation: 'List comprehension duyệt qua các số lẻ trong numbers (1, 3, 5) và bình phương lên cho ra `[1, 9, 25]`.',
        points: 15
      },
      {
        id: 'py-q2',
        type: 'single',
        prompt: 'Độ phức tạp thời gian trung bình (Average Time Complexity) của thuật toán QuickSort là:',
        options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(1)'],
        correctAnswer: 0,
        explanation: 'QuickSort có độ phức tạp thời gian trung bình là `O(n log n)`.',
        points: 15
      },
      {
        id: 'py-q3',
        type: 'fill-blank',
        prompt: 'Nhập từ khóa trong Python dùng để định nghĩa một hàm (Function Definition):',
        correctAnswer: 'def',
        explanation: 'Từ khóa `def` dùng để khai báo hàm trong Python.',
        points: 15
      }
    ]
  },
  {
    id: 'quiz-cyber-security',
    title: '6. Mạng Máy Tính & An Toàn Thông Tin Số',
    description: 'Chương trình mạng & bảo mật: Hệ thống phân giải DNS, địa chỉ IP, mô hình mạng, mã hóa SSL/TLS và các phương thức bảo mật hệ thống.',
    category: 'cyber-security',
    difficulty: 'medium',
    timeLimitMinutes: 15,
    icon: 'Network',
    badgeColor: '#6366f1',
    author: 'PH- TINHOCGENZ Security Lab',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'net-q1',
        type: 'single',
        prompt: 'Hệ thống phân giải tên miền (DNS - Domain Name System) có vai trò chính là gì trong mạng Internet?',
        options: [
          'Chuyển đổi tên miền dạng chữ (vd: tinhocgenz.io.vn) sang địa chỉ IP máy chủ (vd: 76.76.21.21)',
          'Tăng tốc độ dây cáp quang',
          'Quét virus máy tính',
          'Nén dung lượng ảnh'
        ],
        correctAnswer: 0,
        explanation: 'DNS chuyển đổi tên miền dạng ký tự dễ nhớ của con người sang địa chỉ IP máy tính.',
        points: 10
      },
      {
        id: 'net-q2',
        type: 'single',
        prompt: 'Địa chỉ IPv4 chuẩn được tạo thành bởi bao nhiêu bit nhị phân?',
        options: ['32 bits', '64 bits', '128 bits', '16 bits'],
        correctAnswer: 0,
        explanation: 'IPv4 có độ dài 32 bit, chia thành 4 Octets (mỗi octet 8 bit). IPv6 có độ dài 128 bit.',
        points: 10
      },
      {
        id: 'net-q3',
        type: 'true-false',
        prompt: 'Giao thức HTTPS sử dụng chứng chỉ SSL/TLS để mã hóa dữ liệu truyền tải giữa trình duyệt và máy chủ web.',
        correctAnswer: true,
        explanation: 'Đúng. HTTPS mã hóa đường truyền nhằm chống nghe lén và bảo vệ an toàn thông tin.',
        points: 10
      }
    ]
  }
];
