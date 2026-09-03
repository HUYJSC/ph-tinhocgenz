# BẢN ĐỒ KIẾN TRÚC HIỆN TẠI (SYSTEM ARCHITECTURE CURRENT)
## HỆ THỐNG: PH DIGITAL EDUCATION & TIN HỌC GEN Z
**Ngày lập:** 03/09/2026  
**Tiêu chuẩn:** Solution Architect & Security Engineer  

---

## 1. SƠ ĐỒ KIẾN TRÚC TỔNG THỂ (CURRENT DISCONNECTED STACK)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TẦNG TRÌNH DUYỆT                                 │
│                                                                                        │
│  [ React 18 + Vite SPA ]                                                               │
│    ├── LandingPage.tsx ──────────► Lộ link /admin trên Navbar (P0)                     │
│    ├── UnifiedAuthGateway.tsx ───► Có hàm quickFill Thầy Quang Huy / admin123 (P0)     │
│    ├── useAuth.ts ───────────────► Chứa danh sách tài khoản & password '123' (P0)      │
│    └── AdminPortal.tsx ──────────► Chứa 10 Google Meet URLs cố định (P1)               │
│                                                                                        │
│  [ LocalStorage Trình Duyệt ]                                                          │
│    ├── 'phtinhocgenz_student_accounts_v11' ──► Plaintext Accounts & Passwords (P0)    │
│    ├── 'phtinhocgenz_teacher_accounts_v11' ──► Plaintext Staff & Admin Credentials    │
│    ├── 'phtgz_attendance_sessions_v4'     ──► Lịch sử điểm danh học viên              │
│    ├── 'phtgz_assignments_v4'             ──► Bài tập & bài nộp                       │
│    └── 'phtgz_recovery_session'           ──► Chứa OTP 6 số trong browser (P2)        │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                  KHÔNG CÓ KẾT NỐI API
                                  (CHƯA GỌI ENDPOINT NÀO)
                                            │
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             BACKEND PYTHON TẦNG MÁY CHỦ                                │
│                                                                                        │
│  [ Django REST Framework ] (Port 8000)                                                 │
│    ├── Apps: accounts, courses, assessments, attendance, assignments, analytics, audit│
│    ├── Security: Argon2id băm mật khẩu, JWT + Session Auth, Soft-delete BaseModel      │
│    ├── Database Engine: SQLite (db.sqlite3) trong local.py (P2: Chưa bật PostgreSQL)   │
│    └── Test Suite: Pytest đạt 87% coverage (16 tests)                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. BẢN ĐỒ PHÂN QUYỀN VAI TRÒ (ROLE MAP)

Hệ thống có 5 vai trò theo mục tiêu kinh doanh, nhưng hiện tại:
- **Client (`src/types/auth.ts`):** Chỉ hỗ trợ 2 vai trò `student` và `admin` (trong đó `admin` bao gồm cả Giảng viên và Quản trị viên).
- **Backend (`apps.accounts.models.User.Role`):** Đã phân thành 4 vai trò:
  - `student` (Học viên)
  - `teacher` (Giảng viên)
  - `academic` (Giáo vụ học vụ)
  - `admin` (Quản trị hệ thống)
- **Khoảng cách (Gap):** Backend còn thiếu vai trò `super_admin` độc lập để bảo vệ các cấu hình tối mật và ngăn Quản trị viên thường tự nâng quyền.

---

## 3. BẢN ĐỒ API HIỆN CÓ CỦA BACKEND (API ENDPOINT MAP)

| Phân hệ | Endpoint | Method | Quyền hạn (DRF Permission) | Chức năng nghiệp vụ |
|:---|:---|:---:|:---|:---|
| **Accounts** | `/api/v1/accounts/login/` | POST | `AllowAny` | Đăng nhập lấy JWT và Set-Cookie Session |
| | `/api/v1/accounts/refresh/` | POST | `AllowAny` | Làm mới Access Token từ Refresh Token |
| | `/api/v1/accounts/logout/` | POST | `IsAuthenticated` | Đăng xuất và vô hiệu hóa phiên |
| | `/api/v1/accounts/me/` | GET | `IsAuthenticated` | Lấy hồ sơ tài khoản hiện tại |
| | `/api/v1/accounts/change-password/` | POST | `IsAuthenticated` | Đổi mật khẩu tài khoản |
| | `/api/v1/accounts/users/` | CRUD | `IsAdmin` / `IsTeacherOrAdmin` | Quản lý danh sách học viên & giảng viên |
| **Courses** | `/api/v1/courses/` | GET | `AllowAny` | Xem danh sách 10 chương trình đào tạo |
| | `/api/v1/courses/classes/` | CRUD | `IsTeacherOrAdmin` | Quản lý lớp học và danh sách ghi danh |
| | `/api/v1/courses/schedules/` | CRUD | `IsTeacherOrAdmin` | Quản lý thời khóa biểu và phòng học |
| **Assessments** | `/api/v1/assessments/exams/` | CRUD | `IsTeacherOrAdmin` | Quản lý ngân hàng đề thi |
| | `/api/v1/assessments/exams/{id}/start/` | POST | `IsAuthenticated` | Học viên bắt đầu làm bài thi |
| | `/api/v1/assessments/exams/{id}/submit/` | POST | `IsAuthenticated` | Học viên nộp bài thi tính điểm |
| **Attendance** | `/api/v1/attendance/sessions/` | CRUD | `IsTeacherOrAdmin` | Quản lý ca học, xoay mã QR token |
| | `/api/v1/attendance/check-in/` | POST | `IsAuthenticated` | Học viên quét mã QR điểm danh |
| **Assignments**| `/api/v1/assignments/` | CRUD | `IsTeacherOrAdmin` | Giao bài tập thực hành |
| | `/api/v1/assignments/submissions/` | POST/PUT | `IsAuthenticated` | Học viên nộp bài, Giảng viên chấm điểm |
| **Certificates**| `/api/v1/certificates/` | GET | `IsAuthenticated` | Danh sách chứng chỉ của học viên |
| | `/api/v1/certificates/verify/{code}/` | GET | `AllowAny` | Tra cứu chứng nhận số công khai |
| **Audit** | `/api/v1/audit/logs/` | GET | `IsAdmin` | Xem nhật ký bất biến hệ thống |

---

## 4. BẢN ĐỒ HẠ TẦNG TRIỂN KHAI (DEPLOYMENT MAP)

- **Frontend:** Vercel Project `eduquest-study-app` (Domain: `hoctructuyen.tinhocgenz.io.vn`).
- **Backend:** Thiết kế chạy độc lập qua Docker Container (Django WSGI + Gunicorn + Nginx + PostgreSQL).
- **Trạng thái kết nối hạ tầng:** Cần cấu hình reverse proxy hoặc biến môi trường `VITE_API_BASE_URL` trên Vercel để kết nối Frontend với Backend API qua giao thức HTTPS bảo mật.
