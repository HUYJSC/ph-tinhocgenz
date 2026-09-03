# BÁO CÁO KHÁM PHÁ TOÀN DIỆN HỆ THỐNG (SYSTEM DISCOVERY REPORT)
## DỰ ÁN: HỆ SINH THÁI ĐÀO TẠO TIN HỌC GEN Z & PH DIGITAL EDUCATION
**Giai đoạn:** Phase 0 — Discovery (Chỉ đọc, không can thiệp mã nguồn)  
**Ngày thực hiện:** 03/09/2026  
**Đơn vị thực hiện:** Master AI Architecture, Security & QA Team  

---

## 1. PHÂN TÍCH CÔNG NGHỆ (TECHNOLOGY STACK IDENTIFICATION)

### Frontend LMS & Admin Portal (`eduquest-study-app/src`)
- **Core Framework:** React 18.3.1 (SPA) chạy trên Vite 5.4.2 & TypeScript 5.5.3.
- **Styling Architecture:** Pure Vanilla CSS Design System (`src/index.css`), CSS Custom Properties (`--bg-primary`, `--brand`, `--text-primary`, v.v.), Responsive Media Queries, Không dùng TailwindCSS.
- **UI & Iconography:** Lucide-react 1.16.0, Canvas-confetti 1.9.4.
- **Hardware Integration:** `html5-qrcode` 2.3.8 (Webcam / Mobile Camera scanner phục vụ điểm danh QR).
- **State Management & Persistence:** React State (`useState`, `useEffect`) kết hợp với Custom Hooks đọc/ghi trực tiếp `localStorage` trình duyệt (`useAuth`, `useLocalStorage`, `useAssignmentStorage`, `useAttendanceStorage`, `useScheduleStorage`).
- **Code Splitting:** React `lazy()` và dynamic imports cho tất cả các trang / modal nặng (`LandingPage`, `UnifiedAuthGateway`, `AdminPortal`, `QuizRunner`, `AttendanceManager`, v.v.).

### Backend API & Database (`eduquest-study-app/backend`)
- **Core Framework:** Python 3.11.9, Django 5.0.6, Django REST Framework 3.15.1.
- **CORS & Middleware:** `django-cors-headers` 4.3.1, WhiteNoise 6.6.0 (cho static files).
- **Authentication & Cryptography:** `argon2-cffi` 23.1.0, `pyjwt` 2.8.0, Django Session Middleware.
- **Database Engine:** SQLite (`db.sqlite3`) cho môi trường dev cục bộ; mã nguồn có sẵn driver `psycopg2-binary` 2.9.9 để sẵn sàng kết nối PostgreSQL.
- **Testing & Coverage:** `pytest` 8.2.1, `pytest-django` 4.8.0, `pytest-cov` 5.0.0 (Coverage hiện tại đạt 87%).

### Mobile Application (`eduquest-study-app/mobile`)
- **Core Framework:** Flutter 3.x (Dart) cho ứng dụng di động độc lập của Học viên & Giảng viên.

### DevOps, CI/CD & Hạ tầng Triển khai
- **Hosting Frontend:** Vercel (`eduquest-study-app`), cấu hình qua `vercel.json` với HTTP Security Headers và rewrite SPA.
- **Containerization:** Dockerfile & `docker-compose.yml` cho Backend Django và PostgreSQL.
- **CI/CD:** GitHub Actions `.github/workflows/deploy.yml` (Frontend Quality Gate, Backend Pytest Gate, Vercel Deploy).

---

## 2. CẤU TRÚC THƯ MỤC & PHÂN BỔ MÔ-ĐUN

```text
eduquest-study-app/
├── backend/
│   ├── apps/
│   │   ├── accounts/          # Model User (UUID PK), Role (student, teacher, academic, admin), JWT & Session auth
│   │   ├── analytics/         # Model AcademicWarning, StudentReminder, ZaloNotificationLog
│   │   ├── assessments/       # Model Exam, Question, AnswerOption, ExamAttempt, StudentAnswer
│   │   ├── assignments/       # Model Assignment, Submission (Rubric, điểm, phản hồi)
│   │   ├── attendance/        # Model AttendanceSession, AttendanceRecord (QR token, GPS check-in)
│   │   ├── audit/             # Model AuditLog (Bất biến, lưu actor, action, diff JSON)
│   │   ├── certificates/      # Model DigitalCertificate (Blockchain-ready verification)
│   │   ├── common/            # BaseModel (UUID, is_deleted, created_at, updated_at)
│   │   └── courses/           # Model Course (10 tracks), ClassGroup, ClassEnrollment
│   ├── config/
│   │   ├── settings/          # base.py, local.py
│   │   ├── urls.py            # API routing v1
│   │   └── wsgi.py / asgi.py
│   ├── scripts/               # migrate_all_legacy_data.py
│   ├── tests/                 # 16 test cases kiểm thử API
│   └── requirements.txt
├── src/
│   ├── components/
│   │   ├── admin/             # AdminPortal (127KB), StandaloneAdminApp, AttendanceManager, ZaloNotificationManager
│   │   ├── auth/              # UnifiedAuthGateway, ForgotPasswordModal, ChangePasswordModal, UserProfileModal
│   │   ├── dashboard/         # StudentOnePageDashboard (To-Do hub, lộ trình, điểm danh nhanh)
│   │   ├── landing/           # LandingPage (1439 dòng, giới thiệu 10 tracks, cam kết đầu ra)
│   │   ├── layout/            # Header, TeacherAcademicHeader, UserDropdown, MobileBottomNav (5 tabs)
│   │   ├── quiz/              # QuizRunner (Autosave, chống gian lận rời tab), QuizResult, QuizCatalog
│   │   └── ...
│   ├── hooks/                 # useAuth, useQuizEngine, useLocalStorage, useAttendanceStorage, useScheduleStorage
│   ├── services/              # weakSkillService, recommendationService, certificateService, aiZaloNotificationService
│   ├── types/                 # auth.ts, quiz.ts, assignment.ts, schedule.ts, edtech.ts
│   ├── App.tsx                # Client Routing, State Coordinator (968 dòng)
│   └── main.tsx
├── public/                    # robots.txt, sitemap.xml, manifest.json, logo assets
└── docs/                      # Tài liệu hệ thống và kiến trúc
```

---

## 3. ĐÁNH GIÁ LUỒNG NGHIỆP VỤ CỐT LÕI

1. **Luồng Khách vãng lai (Visitor Journey):**  
   Khách truy cập `https://tinhocgenz.io.vn/` xem 10 khóa học, bảng giá, kết quả học viên -> Click tư vấn / Thi thử -> Chuyển tiếp tới LMS `https://hoctructuyen.tinhocgenz.io.vn/`. Hiện tại nút Admin vẫn xuất hiện trên navbar công khai của `LandingPage.tsx` dòng 359 (Lỗ hổng P0).
2. **Luồng Học viên (Student Journey):**  
   Học viên đăng nhập tại `/login` bằng mã học viên (ví dụ `THGZ01`) và mật khẩu (mặc định `"123"`) -> Vào `StudentOnePageDashboard` xem To-Do Hub, tiến độ 10 tracks, mở đề thi, quét QR điểm danh, nộp bài qua Google Drive link.
3. **Luồng Giảng viên (Teacher Journey):**  
   Giảng viên đăng nhập bằng mã cán bộ (ví dụ `GV01`..`GV04`) -> Vào `TeacherAcademicPortal` -> Xem danh sách lớp được phân công, mở ca điểm danh xoay mã QR, chấm bài tập, gửi thông báo.
4. **Luồng Quản trị viên (Admin Journey):**  
   Truy cập `/admin` -> Nhập mã cán bộ `ADMIN01` -> Xem `AdminPortal` gồm 11 phân hệ: Tổng quan, Học viên, Giảng viên, Lịch dạy, Chấm điểm, Đề thi, Ngân hàng câu hỏi, Cảnh báo học vụ, Zalo AI, Google Meet Hub, Cấu hình SEO.

---

## 4. BẢN ĐỒ LIÊN KẾT GIỮA HAI TÊN MIỀN

- **Website Thương hiệu / SEO (`https://tinhocgenz.io.vn/`):**  
  Chịu trách nhiệm Marketing, giới thiệu khóa học, bài viết blog, bảng học phí, form thu thập lead.
- **Hệ thống LMS & Khảo thí (`https://hoctructuyen.tinhocgenz.io.vn/`):**  
  Chịu trách nhiệm xác thực, học tập cá nhân hóa, làm bài thi, nộp bài, điểm danh và quản trị back-office (`/admin`).
- **Liên kết hiện tại:**  
  Website marketing dẫn link sang LMS qua nút "Vào Lớp Học" và "Thi Thử". Chưa có cơ chế Single Sign-On (SSO) hoặc chia sẻ session cookie giữa hai subdomains.
