import { Quiz } from '../types/quiz';

export const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: 'quiz-mos-excel',
    title: 'Luyện Thi MOS Excel Specialist & Xử Lý Bảng Tính',
    description: 'Chuyên đề ôn luyện các hàm VLOOKUP, INDEX-MATCH, IF lồng, PivotTable, Định dạng có điều kiện và Quản lý dữ liệu trong Microsoft Excel.',
    category: 'mos-excel',
    difficulty: 'medium',
    timeLimitMinutes: 15,
    icon: 'Table',
    badgeColor: '#10b981',
    author: 'PH- TINHOCGENZ MOS Master',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'excel-q1',
        type: 'single',
        prompt: 'Trong Microsoft Excel, cú pháp chuẩn của hàm tìm kiếm theo cột `VLOOKUP` là gì?',
        options: [
          'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
          'VLOOKUP(table_array, lookup_value, row_index_num, [range_lookup])',
          'VLOOKUP(lookup_value, col_index_num, table_array, [exact_match])',
          'VLOOKUP(range_lookup, lookup_value, table_array, col_index_num)'
        ],
        correctAnswer: 0,
        explanation: 'Cú pháp chuẩn của VLOOKUP là: `VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])`, trong đó `range_lookup` là 0 (hoặc FALSE) để tìm kiếm chính xác tuyệt đối.',
        hint: 'Giá trị cần tìm kiếm (lookup_value) luôn đứng ở vị trí tham số đầu tiên.',
        points: 10
      },
      {
        id: 'excel-q2',
        type: 'single',
        prompt: 'Để cố định tuyệt đối cả cột và dòng của ô $C$5 trong công thức Excel, bạn sử dụng phím tắt nào?',
        options: ['F2', 'F4', 'F9', 'Ctrl + Shift + $'],
        correctAnswer: 1,
        explanation: 'Phím F4 (hoặc Fn + F4 trên laptop) dùng để chuyển đổi nhanh giữa các kiểu địa chỉ: Tương đối (C5), Tuyệt đối ($C$5), Hỗn hợp ($C5 hoặc C$5).',
        hint: 'Phím chức năng từ F1 đến F12 ở hàng trên cùng của bàn phím.',
        points: 10
      },
      {
        id: 'excel-q3',
        type: 'multiple',
        prompt: 'Những tính năng nào sau đây của Excel cho phép bạn tổng hợp, phân tích và lọc dữ liệu đa chiều tự động?',
        options: [
          'PivotTable (Bảng tổng hợp động)',
          'Slicer (Bộ lọc trực quan)',
          'Track Changes',
          'PivotChart (Biểu đồ động liên kết)'
        ],
        correctAnswer: [0, 1, 3],
        explanation: 'PivotTable, Slicer và PivotChart là bộ ba công cụ mạnh mẽ nhất của Excel để phân tích dữ liệu đa chiều, báo cáo tổng hợp và dashboard.',
        hint: 'Chọn các công cụ có chữ Pivot hoặc bộ lọc Slicer.',
        points: 15
      },
      {
        id: 'excel-q4',
        type: 'true-false',
        prompt: 'Trong Excel, hàm `COUNTIF(range, criteria)` có thể đếm số ô thỏa mãn nhiều điều kiện cùng lúc trên nhiều vùng khác nhau.',
        correctAnswer: false,
        explanation: 'Sai. Hàm `COUNTIF` chỉ đếm theo 1 điều kiện duy nhất. Để đếm thỏa mãn nhiều điều kiện trên nhiều vùng dữ liệu khác nhau, bạn phải dùng hàm `COUNTIFS`.',
        hint: 'Chú ý chữ "S" ở cuối tên hàm khi xử lý số nhiều.',
        points: 10
      },
      {
        id: 'excel-q5',
        type: 'fill-blank',
        prompt: 'Nhập tên hàm trong Excel dùng để tính trung bình cộng có điều kiện (ví dụ: tính lương trung bình của phòng Kỹ Thuật):',
        correctAnswer: 'AVERAGEIF',
        explanation: 'Hàm `AVERAGEIF` dùng để tính giá trị trung bình cộng của các ô thỏa mãn một tiêu chí nhất định.',
        hint: 'Ghép từ "AVERAGE" và "IF".',
        points: 15
      },
      {
        id: 'excel-q6',
        type: 'matching',
        prompt: 'Hãy ghép nối các hàm Excel với công dụng chính xác:',
        matchingPairs: [
          { id: 'm1', left: 'INDEX & MATCH', right: 'Tìm kiếm dữ liệu linh hoạt sang trái/phải không giới hạn' },
          { id: 'm2', left: 'CONCATENATE / TEXTJOIN', right: 'Ghép nối các chuỗi văn bản từ nhiều ô' },
          { id: 'm3', left: 'IFERROR', right: 'Bẫy và xử lý các giá trị lỗi (#N/A, #VALUE!) trong bảng tính' },
          { id: 'm4', left: 'DATA VALIDATION', right: 'Thiết lập danh sách thả xuống (Drop-down) và giới hạn nhập liệu' }
        ],
        explanation: 'INDEX-MATCH thay thế VLOOKUP linh hoạt, TEXTJOIN ghép chuỗi, IFERROR bẫy lỗi và Data Validation kiểm soát dữ liệu.',
        points: 20
      }
    ]
  },
  {
    id: 'quiz-ic3-gs6',
    title: 'Luyện Thi Chuẩn Tin Học Quốc Tế IC3 GS6 Global Standard',
    description: 'Bộ câu hỏi chuẩn quốc tế IC3: Kiến thức phần cứng máy tính, Mạng Internet, An toàn thông tin số, Bản quyền số và Điện toán đám mây.',
    category: 'ic3-gs',
    difficulty: 'medium',
    timeLimitMinutes: 15,
    icon: 'Cpu',
    badgeColor: '#3b82f6',
    author: 'PH- TINHOCGENZ IC3 Dept',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'ic3-q1',
        type: 'single',
        prompt: 'Thiết bị nào sau đây đóng vai trò là "bộ não" xử lý tất cả các chỉ thị và phép toán logic của máy vi tính?',
        options: [
          'CPU (Central Processing Unit)',
          'RAM (Random Access Memory)',
          'HDD / SSD (Ổ cứng lưu trữ)',
          'GPU (Card đồ họa)'
        ],
        correctAnswer: 0,
        explanation: 'CPU (Bộ xử lý trung tâm) là cơ quan đầu não thực hiện việc giải mã và thực thi toàn bộ các lệnh phần mềm của máy tính.',
        hint: 'Viết tắt của Central Processing Unit.',
        points: 10
      },
      {
        id: 'ic3-q2',
        type: 'single',
        prompt: 'Khi mất nguồn điện đột ngột, dữ liệu lưu trong thành phần bộ nhớ nào của máy tính sẽ bị xóa sạch hoàn toàn (Volatile Memory)?',
        options: ['ROM', 'RAM', 'Ổ cứng SSD', 'Thẻ nhớ Flash USB'],
        correctAnswer: 1,
        explanation: 'RAM là bộ nhớ truy xuất ngẫu nhiên tạm thời, dữ liệu trong RAM sẽ biến mất ngay khi mất nguồn cấp điện (khác với ROM, SSD lưu trữ cố định).',
        hint: 'Bộ nhớ tạm thời đọc ghi tốc độ cao.',
        points: 10
      },
      {
        id: 'ic3-q3',
        type: 'multiple',
        prompt: 'Những hành vi nào sau đây giúp bảo vệ an toàn thông tin cá nhân trên không gian mạng (Digital Security)?',
        options: [
          'Bật tính năng xác thực 2 lớp (2FA / Multi-Factor Authentication)',
          'Không nhấp vào các liên kết lạ hoặc tệp đính kèm trong Email mạo danh (Phishing)',
          'Đặt mật khẩu trùng với ngày sinh và số điện thoại để dễ nhớ',
          'Sử dụng mạng riêng ảo (VPN) khi truy cập Wi-Fi công cộng không có mật khẩu'
        ],
        correctAnswer: [0, 1, 3],
        explanation: 'Bật 2FA, cảnh giác với Phishing và dùng VPN trên mạng công cộng là 3 nguyên tắc vàng về an ninh mạng.',
        hint: 'Đặt mật khẩu theo ngày sinh là hành vi mất an toàn.',
        points: 15
      },
      {
        id: 'ic3-q4',
        type: 'true-false',
        prompt: 'Điện toán đám mây (Cloud Computing) cho phép người dùng truy cập dữ liệu và ứng dụng từ bất kỳ đâu chỉ cần có kết nối Internet.',
        correctAnswer: true,
        explanation: 'Đúng. Điện toán đám mây (như Google Drive, Microsoft OneDrive, AWS) lưu trữ tài nguyên trên máy chủ Internet và truy cập mọi lúc mọi nơi.',
        points: 10
      },
      {
        id: 'ic3-q5',
        type: 'matching',
        prompt: 'Hãy ghép nối các đơn vị đo lường dung lượng máy tính theo đúng giá trị byte:',
        matchingPairs: [
          { id: 'm1', left: '1 Kilobyte (KB)', right: '1,024 Bytes' },
          { id: 'm2', left: '1 Megabyte (MB)', right: '1,024 Kilobytes' },
          { id: 'm3', left: '1 Gigabyte (GB)', right: '1,024 Megabytes' },
          { id: 'm4', left: '1 Terabyte (TB)', right: '1,024 Gigabytes' }
        ],
        explanation: 'Trong hệ nhị phân tin học, các đơn vị dung lượng tăng theo lũy thừa của 2 (2^10 = 1024).',
        points: 20
      }
    ]
  },
  {
    id: 'quiz-mos-word',
    title: 'Luyện Thi MOS Word & Soạn Thảo Văn Bản Chuyên Nghiệp',
    description: 'Chuyên đề định dạng văn bản chuẩn hành chính, Mail Merge (Trộn thư), Mục lục tự động, Header/Footer phân trang Section Breaks.',
    category: 'mos-word',
    difficulty: 'easy',
    timeLimitMinutes: 12,
    icon: 'FileText',
    badgeColor: '#2563eb',
    author: 'PH- TINHOCGENZ Word Team',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'word-q1',
        type: 'single',
        prompt: 'Để tạo mục lục tự động (Automatic Table of Contents) chuẩn trong Word, các tiêu đề đoạn văn cần được gán định dạng gì?',
        options: [
          'Các kiểu Heading (Heading 1, Heading 2, Heading 3...) trong nhóm Styles',
          'Đổi màu chữ thành màu đỏ và in đậm (Bold)',
          'Tăng cỡ chữ (Font size) lên 18pt',
          'Gõ mục lục thủ công bằng phím Tab'
        ],
        correctAnswer: 0,
        explanation: 'Tính năng Table of Contents trong Word tự động quét và thu thập các văn bản được áp dụng thẻ Styles Heading (Heading 1, 2, 3...) để tạo mục lục tự động.',
        hint: 'Tìm nhóm công cụ Styles trên thanh Ribbon tab Home.',
        points: 10
      },
      {
        id: 'word-q2',
        type: 'single',
        prompt: 'Để ngắt trang sao cho trang sau có thể xoay khổ giấy Ngang (Landscape) mà các trang trước vẫn giữ khổ Dọc (Portrait), bạn dùng loại ngắt nào?',
        options: [
          'Section Break (Next Page)',
          'Page Break thông thường (Ctrl + Enter)',
          'Column Break',
          'Line Break (Shift + Enter)'
        ],
        correctAnswer: 0,
        explanation: 'Section Break (Next Page) phân tách tài liệu thành các phân vùng độc lập, cho phép đổi hướng giấy (Orientation), Header/Footer hoặc viền trang riêng biệt cho từng Section.',
        hint: 'Cần phân chia Section (Phân vùng) thay vì chỉ ngắt trang Page thông thường.',
        points: 10
      },
      {
        id: 'word-q3',
        type: 'multiple',
        prompt: 'Tính năng Mail Merge (Trộn thư) trong Microsoft Word hỗ trợ lấy dữ liệu danh sách người nhận từ các nguồn nào?',
        options: [
          'Bảng tính Microsoft Excel (.xlsx)',
          'Danh bạ Outlook Contacts',
          'File âm thanh MP3',
          'Bảng dữ liệu Word Table hoặc Access Database'
        ],
        correctAnswer: [0, 1, 3],
        explanation: 'Mail Merge liên kết với các nguồn dữ liệu có cấu trúc như Excel, Outlook Contacts, Access Database, Word Table hoặc file CSV.',
        hint: 'File âm thanh không thể chứa bảng danh sách dữ liệu.',
        points: 15
      },
      {
        id: 'word-q4',
        type: 'fill-blank',
        prompt: 'Nhập tổ hợp phím tắt dùng để căn đều 2 bên lề đoạn văn bản trong Microsoft Word (ví dụ: Ctrl + ...):',
        correctAnswer: 'Ctrl + J',
        explanation: 'Phím tắt `Ctrl + J` (Justify) dùng để căn đều văn bản sang cả 2 bên mép lề trái và phải chuẩn văn bản hành chính.',
        hint: 'Chữ J viết tắt của Justify.',
        points: 15
      },
      {
        id: 'word-q5',
        type: 'matching',
        prompt: 'Hãy ghép nối phím tắt Microsoft Word với chức năng định dạng tương ứng:',
        matchingPairs: [
          { id: 'm1', left: 'Ctrl + E', right: 'Căn giữa đoạn văn bản (Center Align)' },
          { id: 'm2', left: 'Ctrl + K', right: 'Chèn siêu liên kết (Insert Hyperlink)' },
          { id: 'm3', left: 'Ctrl + H', right: 'Mở hộp thoại Tìm kiếm và Thay thế (Find & Replace)' },
          { id: 'm4', left: 'Ctrl + Shift + C', right: 'Sao chép định dạng (Copy Formatting / Format Painter)' }
        ],
        explanation: 'Ctrl + E căn giữa, Ctrl + K chèn link, Ctrl + H thay thế từ ngữ và Ctrl+Shift+C sao chép nhanh định dạng.',
        points: 20
      }
    ]
  },
  {
    id: 'quiz-python-programming',
    title: 'Lập Trình Python & Thuật Toán Tin Học Trẻ',
    description: 'Kiểm tra kiến thức cú pháp Python 3, cấu trúc dữ liệu List/Dict/Set, giải thuật tìm kiếm, sắp xếp và tư duy lập trình căn bản.',
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
        explanation: 'List comprehension duyệt qua các phần tử số lẻ trong `numbers` (1, 3, 5) và bình phương chúng lên (1^2=1, 3^2=9, 5^2=25), cho ra `[1, 9, 25]`.',
        hint: 'Điều kiện `x % 2 != 0` lọc ra các số lẻ.',
        points: 15
      },
      {
        id: 'py-q2',
        type: 'single',
        prompt: 'Độ phức tạp thời gian trung bình (Average Time Complexity) của thuật toán sắp xếp nhanh QuickSort là bao nhiêu?',
        options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)'],
        correctAnswer: 0,
        explanation: 'QuickSort có độ phức tạp thời gian trung bình là `O(n log n)`. Trường hợp xấu nhất (worst case khi mảng đã sắp xếp và chọn pivot không tối ưu) là `O(n^2)`.',
        hint: 'Tương tự như Merge Sort và Heap Sort.',
        points: 15
      },
      {
        id: 'py-q3',
        type: 'multiple',
        prompt: 'Những kiểu dữ liệu nào sau đây trong Python thuộc nhóm Bất Biến (Immutable - Không thể thay đổi giá trị sau khi tạo)?',
        options: [
          'tuple (Bộ giá trị cố định)',
          'str (Chuỗi ký tự)',
          'list (Danh sách mảng)',
          'int / float (Số nguyên và số thực)'
        ],
        correctAnswer: [0, 1, 3],
        explanation: 'Trong Python: `tuple`, `str`, `int`, `float`, `frozenset` là immutable. Ngược lại, `list`, `dict`, `set` là mutable (có thể thay đổi được).',
        hint: 'Kiểu list cho phép dùng hàm .append() để sửa đổi nên là mutable.',
        points: 15
      },
      {
        id: 'py-q4',
        type: 'fill-blank',
        prompt: 'Nhập từ khóa trong Python dùng để định nghĩa một hàm tự tạo (Function Definition):',
        correctAnswer: 'def',
        explanation: 'Từ khóa `def` (viết tắt của define) dùng để khai báo hàm trong Python, theo cú pháp: `def function_name(params):`',
        hint: 'Có 3 chữ cái, viết tắt của "define".',
        points: 15
      },
      {
        id: 'py-q5',
        type: 'true-false',
        prompt: 'Trong Python, kiểu dữ liệu `set` cho phép chứa các phần tử trùng lặp và duy trì thứ tự chèn ban đầu.',
        correctAnswer: false,
        explanation: 'Sai. `set` trong Python là tập hợp các phần tử KHÔNG trùng lặp (duy nhất) và không có thứ tự chỉ mục (unordered).',
        hint: 'Set tự động loại bỏ các giá trị trùng nhau.',
        points: 10
      }
    ]
  },
  {
    id: 'quiz-mos-powerpoint',
    title: 'Luyện Thi MOS PowerPoint & Kỹ Năng Thuyết Trình Đỉnh Cao',
    description: 'Thiết kế Slide Master, hiệu ứng chuyển trang Morph, lồng ghép Video/Audio và thiết lập xuất bản bài thuyết trình chuẩn quốc tế.',
    category: 'mos-powerpoint',
    difficulty: 'easy',
    timeLimitMinutes: 12,
    icon: 'Presentation',
    badgeColor: '#ea580c',
    author: 'PH- TINHOCGENZ Presentation Unit',
    createdAt: '2026-08-20',
    questions: [
      {
        id: 'ppt-q1',
        type: 'single',
        prompt: 'Chế độ xem nào trong PowerPoint cho phép bạn tạo một mẫu thiết kế chung (Logo, Font, Màu nền) tự động áp dụng cho tất cả slide con?',
        options: [
          'Slide Master View',
          'Reading View',
          'Outline View',
          'Slide Sorter View'
        ],
        correctAnswer: 0,
        explanation: 'Slide Master (trong tab View) là slide mẹ quy định bố cục, font chữ, logo và hình nền cho toàn bộ bài thuyết trình.',
        hint: 'Tìm từ có chữ "Master" (Slide mẹ).',
        points: 10
      },
      {
        id: 'ppt-q2',
        type: 'single',
        prompt: 'Hiệu ứng chuyển trang (Transition) đột phá nào trong PowerPoint giúp tạo chuyển động mượt mà biến đổi hình khối giữa 2 slide liên tiếp?',
        options: ['Morph', 'Fade', 'Push', 'Wipe'],
        correctAnswer: 0,
        explanation: 'Hiệu ứng Morph Transition tự động nhận diện đối tượng ở slide trước và biến đổi vị trí, kích thước, hình dáng mượt mà sang slide kế tiếp.',
        hint: 'Hiệu ứng có tên Morph.',
        points: 10
      },
      {
        id: 'ppt-q3',
        type: 'multiple',
        prompt: 'Khi trình chiếu PowerPoint trước khán giả, những phím tắt nào sau đây hữu ích để điều khiển màn hình?',
        options: [
          'Phím B: Làm đen màn hình tạm thời (Black screen) để khán giả tập trung vào diễn giả',
          'Phím W: Làm trắng màn hình tạm thời (White screen)',
          'Phím F5: Bắt đầu trình chiếu từ slide đầu tiên',
          'Phím Shift + F5: Bắt đầu trình chiếu từ slide hiện tại đang chọn'
        ],
        correctAnswer: [0, 1, 2, 3],
        explanation: 'Tất cả 4 phím tắt trên đều là các phím trình chiếu tiêu chuẩn cực kỳ quan trọng trong PowerPoint.',
        hint: 'Tất cả các lựa chọn đều chính xác.',
        points: 20
      }
    ]
  },
  {
    id: 'quiz-general-it-security',
    title: 'Tin Học Cơ Sở, Mạng Máy Tính & An Toàn Thông Tin',
    description: 'Kiến thức về địa chỉ IP, tên miền DNS, mô hình Client-Server, mã hóa dữ liệu, tường lửa và phòng chống mã độc/mã hóa tống tiền Ransomware.',
    category: 'general-it',
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
        prompt: 'Hệ thống phân giải tên miền (DNS - Domain Name System) có nhiệm vụ chính là gì trong mạng Internet?',
        options: [
          'Chuyển đổi tên miền dạng chữ (vd: tinhocgenz.io.vn) sang địa chỉ IP dạng số (vd: 76.76.21.21)',
          'Tăng tốc độ đường truyền dây cáp quang',
          'Quét và diệt virus trên máy tính người dùng',
          'Nén dung lượng file gửi qua email'
        ],
        correctAnswer: 0,
        explanation: 'DNS giống như một cuốn "Danh bạ điện thoại" của Internet, giúp ánh xạ tên miền dễ nhớ của con người sang địa chỉ IP của máy chủ máy tính.',
        hint: 'DNS giúp kết nối tên miền với IP máy chủ.',
        points: 10
      },
      {
        id: 'net-q2',
        type: 'single',
        prompt: 'Địa chỉ IPv4 chuẩn được tạo thành bởi bao nhiêu bit nhị phân và chia thành mấy nhóm (Octets)?',
        options: [
          '32 bits, chia thành 4 nhóm (mỗi nhóm 8 bits)',
          '64 bits, chia thành 8 nhóm',
          '128 bits, chia thành 16 nhóm',
          '16 bits, chia thành 2 nhóm'
        ],
        correctAnswer: 0,
        explanation: 'Địa chỉ IPv4 có độ dài 32 bit, biểu diễn dưới dạng 4 số thập phân cách nhau bằng dấu chấm (ví dụ: 192.168.1.1). IPv6 có độ dài 128 bit.',
        hint: 'IPv4 gồm 4 số thập phân từ 0 đến 255.',
        points: 10
      },
      {
        id: 'net-q3',
        type: 'true-false',
        prompt: 'Giao thức HTTPS sử dụng chứng chỉ SSL/TLS để mã hóa dữ liệu truyền giữa trình duyệt của người dùng và máy chủ web nhằm chống nghe lén.',
        correctAnswer: true,
        explanation: 'Đúng. Chữ "S" trong HTTPS là "Secure", dữ liệu được mã hóa đầu cuối bằng SSL/TLS ngăn chặn kẻ tấn công đánh cắp mật khẩu và thông tin trên đường truyền.',
        points: 10
      },
      {
        id: 'net-q4',
        type: 'matching',
        prompt: 'Hãy ghép nối các cổng dịch vụ mạng (Network Port) tiêu chuẩn với giao thức tương ứng:',
        matchingPairs: [
          { id: 'm1', left: 'Port 80', right: 'HTTP (Web không mã hóa)' },
          { id: 'm2', left: 'Port 443', right: 'HTTPS (Web bảo mật SSL/TLS)' },
          { id: 'm3', left: 'Port 22', right: 'SSH (Truy cập dòng lệnh máy chủ từ xa an toàn)' },
          { id: 'm4', left: 'Port 53', right: 'DNS (Phân giải tên miền mạng)' }
        ],
        explanation: 'Port 80 HTTP, Port 443 HTTPS, Port 22 SSH và Port 53 DNS là các cổng mạng tiêu chuẩn thế giới.',
        points: 20
      }
    ]
  }
];
