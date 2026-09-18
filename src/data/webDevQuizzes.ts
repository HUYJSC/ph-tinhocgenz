import { Quiz } from '../types/quiz';

export const webDevQuizzes: Quiz[] = [
  {
    id: 'quiz-fe-react',
    title: 'Khảo Thí Frontend Web: HTML5, CSS3, JavaScript ES6 & React 18',
    description: 'Đánh giá kiến thức cốt lõi về Virtual DOM, React Hooks, JSX, State Management, CSS Flexbox/Grid và tối ưu giao diện Responsive.',
    category: 'web-frontend',
    difficulty: 'medium',
    timeLimitMinutes: 20,
    icon: 'Layout',
    badgeColor: '#0057b8',
    questions: [
      {
        id: 'q-fe-1',
        type: 'single',
        prompt: 'Trong React 18, Hook nào được sử dụng để lưu trữ giá trị có thể thay đổi mà không làm kích hoạt quá trình re-render component?',
        options: [
          'useState',
          'useRef',
          'useEffect',
          'useMemo'
        ],
        correctAnswer: 1,
        explanation: 'useRef trả về một đối tượng ref có thuộc tính .current có thể thay đổi giá trị mà không kích hoạt re-render component.',
        points: 10,
        difficulty: 'medium',
        skillId: 'react-hooks'
      },
      {
        id: 'q-fe-2',
        type: 'single',
        prompt: 'Thuộc tính CSS nào cho phép dàn layout 2 chiều (cả hàng và cột) mạnh mẽ nhất trong thiết kế web hiện đại?',
        options: [
          'display: flex',
          'display: grid',
          'display: inline-block',
          'float: left'
        ],
        correctAnswer: 1,
        explanation: 'CSS Grid là hệ thống layout 2 chiều (Two-dimensional), cho phép điều khiển đồng thời cả hàng (rows) và cột (columns), trong khi Flexbox là hệ thống 1 chiều.',
        points: 10,
        difficulty: 'easy',
        skillId: 'css-layout'
      },
      {
        id: 'q-fe-3',
        type: 'multiple',
        prompt: 'Các phương thức nào sau đây của mảng JavaScript ES6 KHÔNG làm đột biến (mutate) mảng gốc?',
        options: [
          'map()',
          'filter()',
          'push()',
          'concat()'
        ],
        correctAnswer: [0, 1, 3],
        explanation: 'map(), filter() và concat() trả về mảng mới mà không làm thay đổi mảng ban đầu. Ngược lại, push() sẽ thay đổi trực tiếp mảng gốc.',
        points: 15,
        difficulty: 'medium',
        skillId: 'js-immutability'
      },
      {
        id: 'q-fe-4',
        type: 'true-false',
        prompt: 'Trong React, thuộc tính "key" khi render danh sách chỉ cần là duy nhất trong phạm vi các phần tử anh em (siblings), không nhất thiết phải duy nhất trên toàn bộ ứng dụng.',
        correctAnswer: true,
        explanation: 'Chính xác. Key trong React giúp thuật toán Reconciliation so khớp các phần tử giữa các lần render. Key chỉ cần duy nhất trong cùng danh sách anh em.',
        points: 10,
        difficulty: 'easy',
        skillId: 'react-keys'
      },
      {
        id: 'q-fe-5',
        type: 'single',
        prompt: 'Vòng lặp sự kiện (Event Loop) trong JavaScript ưu tiên thực thi hàng đợi nào trước khi xử lý Macrotask (như setTimeout)?',
        options: [
          'Microtask queue (Promises, queueMicrotask)',
          'I/O queue',
          'Check queue (setImmediate)',
          'Close callback queue'
        ],
        correctAnswer: 0,
        explanation: 'Event loop luôn thực thi toàn bộ các task trong Microtask Queue (bao gồm Promise.then, await) cho đến khi rỗng trước khi chuyển sang Macrotask tiếp theo.',
        points: 15,
        difficulty: 'hard',
        skillId: 'js-event-loop'
      }
    ]
  },
  {
    id: 'quiz-be-django',
    title: 'Khảo Thí Backend Web: Python, Django REST, SQL & RESTful API',
    description: 'Kiểm tra kiến thức về thiết kế kiến trúc RESTful API, HTTP Status Codes, CSDL SQL, Khóa chính/ngoại, Middleware và Cơ chế Bảo mật JWT/Session.',
    category: 'web-backend',
    difficulty: 'hard',
    timeLimitMinutes: 20,
    icon: 'Server',
    badgeColor: '#0057b8',
    questions: [
      {
        id: 'q-be-1',
        type: 'single',
        prompt: 'Mã trạng thái HTTP (Status Code) nào là chuẩn RESTful nhất để phản hồi khi một tài nguyên mới được tạo thành công trên Server?',
        options: [
          '200 OK',
          '201 Created',
          '204 No Content',
          '202 Accepted'
        ],
        correctAnswer: 1,
        explanation: 'HTTP 201 Created chỉ định yêu cầu đã hoàn tất thành công và dẫn đến việc tạo mới một hoặc nhiều tài nguyên trên server.',
        points: 10,
        difficulty: 'easy',
        skillId: 'http-standards'
      },
      {
        id: 'q-be-2',
        type: 'single',
        prompt: 'Trong cơ sở dữ liệu quan hệ SQL, câu lệnh nào được sử dụng để tối ưu hóa tốc độ truy vấn trên các cột thường xuyên xuất hiện trong mệnh đề WHERE?',
        options: [
          'CREATE INDEX',
          'CREATE TRIGGER',
          'CREATE VIEW',
          'ALTER TABLE DROP COLUMN'
        ],
        correctAnswer: 0,
        explanation: 'Chỉ mục (Index) tạo cấu trúc dữ liệu tra cứu (thường là B-Tree) giúp database định vị nhanh dữ liệu mà không cần quét toàn bộ bảng (Table Scan).',
        points: 10,
        difficulty: 'medium',
        skillId: 'sql-optimization'
      },
      {
        id: 'q-be-3',
        type: 'single',
        prompt: 'Trong kiến trúc RESTful API, phương thức HTTP nào bắt buộc phải có tính chất Idempotent (thực hiện nhiều lần cùng kết quả)?',
        options: [
          'POST',
          'PUT',
          'PATCH',
          'CONNECT'
        ],
        correctAnswer: 1,
        explanation: 'Theo đặc tả HTTP RFC, PUT và DELETE có tính Idempotent (gọi 1 lần hay 100 lần với cùng payload thì trạng thái server vẫn như nhau). POST không idempotent.',
        points: 15,
        difficulty: 'medium',
        skillId: 'rest-idempotency'
      },
      {
        id: 'q-be-4',
        type: 'true-false',
        prompt: 'Lưu trữ JWT Authentication Token trong HttpOnly Cookie có khả năng phòng chống tấn công Cross-Site Scripting (XSS) đánh cắp token tốt hơn LocalStorage.',
        correctAnswer: true,
        explanation: 'Đúng. Thuộc tính HttpOnly ngăn cản JavaScript trên trình duyệt truy cập vào cookie, giúp giảm thiểu rủi ro khi website bị tấn công XSS.',
        points: 10,
        difficulty: 'medium',
        skillId: 'web-security'
      },
      {
        id: 'q-be-5',
        type: 'multiple',
        prompt: 'Những cơ chế nào sau đây giúp chống tấn công DDoS và Brute-force mật khẩu trên Backend API?',
        options: [
          'Rate Limiting (Giới hạn số request/phút theo IP hoặc user)',
          'Mã hóa mật khẩu bằng thuật toán băm chậm có salt (bcrypt, argon2)',
          'Tắt toàn bộ CORS (Cross-Origin Resource Sharing)',
          'Sử dụng CAPTCHA sau nhiều lần đăng nhập thất bại'
        ],
        correctAnswer: [0, 1, 3],
        explanation: 'Rate limiting, thuật toán băm chậm có salt và CAPTCHA là các phòng tuyến chính chống tấn công vét cạn Brute-force và DDoS. Tắt CORS không ngăn được các script tự động trực tiếp.',
        points: 15,
        difficulty: 'hard',
        skillId: 'api-defense'
      }
    ]
  }
];

