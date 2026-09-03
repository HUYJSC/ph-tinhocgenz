# CẨM NANG NHẬP MÔN DÀNH CHO DEVELOPER MỚI (DEVELOPER ONBOARDING GUIDE)
**Dự Án:** Hệ Sinh Thái PH Digital Education (Tin Học Gen Z)  
**Phiên Bản Hệ Thống:** 2.0.0 (Production Live)  
**Tài Liệu Dành Cho:** Full-stack Developer, Frontend Engineer, Backend Python Engineer, QA Automation

---

## 1. TỔNG QUAN HỆ SINH THÁI & CÁC TÊN MIỀN (ECOSYSTEM SITEMAP)

Hệ sinh thái được chia thành 3 phân vùng độc lập:

| Phân Vùng | Tên Miền (Domain) | Công Nghệ | Nhiệm Vụ Cốt Lõi |
|:---|:---|:---:|:---|
| **PUBLIC PORTAL** | `https://tinhocgenz.io.vn` | Vite / Next.js | Marketing, SEO, Giới thiệu khóa học, Thi thử công khai, Tài liệu. |
| **LMS PLATFORM** | `https://hoctructuyen.tinhocgenz.io.vn` | Vite + React 18 + TS | Cổng học viên & giảng viên: Lộ trình học, Làm bài thi, Nộp bài tập, Điểm danh, Lịch học. |
| **ADMIN BACK-OFFICE** | `https://hoctructuyen.tinhocgenz.io.vn/admin` | React + Django DRF | Quản trị học vụ, Điều hành giảng viên, Kho đề thi, Ngân hàng câu hỏi, Zalo ZNS AI, SEO. |

---

## 2. KIẾN TRÚC MÃ NGUỒN (CODEBASE ARCHITECTURE)

```text
eduquest-study-app/
├── src/                                # FRONTEND APPLICATION (Vite + React 18 + TS)
│   ├── components/
│   │   ├── admin/                      # Cổng quản trị (StandaloneAdminApp, AdminPortal, EarlyWarning)
│   │   ├── auth/                       # Xác thực (UnifiedAuthGateway, UserProfileModal, ChangePassword)
│   │   ├── dashboard/                  # Dashboard học viên Canvas-style (StudentOnePageDashboard)
│   │   ├── landing/                    # Trang đích giới thiệu khóa học (LandingPage)
│   │   ├── layout/                     # Header, Sidebar, MobileBottomNav
│   │   ├── practice/                   # Luyện thi theo kỹ năng (PracticeBySkill)
│   │   ├── quiz/                       # Khảo thí, đồng hồ đếm ngược, chống gian lận (QuizRunner, QuizResult)
│   │   └── schedule/                   # Lịch học & Google Meet (ScheduleCalendar)
│   ├── hooks/                          # Custom React Hooks (useAuth, useQuiz, useTheme)
│   ├── services/                       # Nghiệp vụ logic & API Client (apiClient, authService, earlyWarningService)
│   ├── types/                          # TypeScript Definitions (auth, quiz, assignment, schedule, skill)
│   ├── utils/                          # Tiện ích âm thanh (audio), tính điểm, format ngày tháng
│   └── App.tsx                         # Bộ định tuyến cốt lõi & SEO Dynamic Robots Guard
├── backend/                            # BACKEND SERVICE (Django 5 + Django REST Framework)
│   ├── apps/
│   │   ├── accounts/                   # Quản lý User, Roles (SuperAdmin, Admin, Teacher, Student), JWT
│   │   ├── analytics/                  # Thống kê kết quả thi, KPI, tỷ lệ đỗ
│   │   ├── assessments/                # Đề thi trắc nghiệm, câu hỏi, phiên làm bài (Attempts)
│   │   ├── assignments/                # Bài tập thực hành Word/Excel, chấm điểm, nộp file
│   │   ├── attendance/                 # Điểm danh QR code, ca học, phòng học
│   │   ├── certificates/               # Cấp chứng chỉ điện tử, mã tra cứu QR
│   │   └── courses/                    # 10 Chương trình đào tạo chuẩn hóa quốc tế
│   └── config/                         # Cấu hình Django (settings/base.py, local.py, production.py)
├── docs/                               # 29+ Hồ sơ kiến trúc, an ninh, từ điển dữ liệu, kiểm toán
├── tests/                              # Bộ kiểm thử tự động (run-tests.mjs - 51 test suites)
└── vercel.json                         # Cấu hình định tuyến, SSL headers, X-Robots-Tag noindex
```

---

## 3. THIẾT LẬP MÔI TRƯỜNG PHÁT TRIỂN (QUICK START)

### A. Khởi Chạy Frontend
```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy dev server tại http://localhost:5173
npm run dev

# 3. Kiểm tra lỗi type trước khi commit
npx tsc --noEmit

# 4. Chạy toàn bộ 51 bài test tự động
npm test
```

### B. Khởi Chạy Backend Python
```bash
# 1. Kích hoạt môi trường ảo Python
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 2. Cài đặt thư viện
pip install -r requirements.txt

# 3. Chạy migration cơ sở dữ liệu
python manage.py migrate

# 4. Khởi chạy máy chủ API tại http://localhost:8000
python manage.py runserver
```

---

## 4. TÀI KHOẢN MẪU DÙNG ĐỂ KIỂM THỬ (TEST CREDENTIALS)

| Vai Trò (Role) | Tên Đăng Nhập / Mã Số | Mật Khẩu Chuẩn | Quyền Hạn Trong Hệ Thống |
|:---|:---:|:---:|:---|
| **Super Admin** | `admin` *(hoặc `ADMIN01`)* | `Admin@PH2026!Secure` *(hoặc `123`)* | Toàn quyền 10 phân hệ, quản lý tài khoản GV/HV, SEO, Meet Hub. |
| **Giảng Viên Trưởng** | `GV03` *(Thầy Quang Huy)* | `123` *(hoặc `Teacher@2026`)* | Quản lý lịch dạy, chấm điểm bài tập, phát thông báo học vụ. |
| **Giảng Viên** | `GV01` *(Cô Hoàng Mai)* | `123` | Phụ trách môn Word, Excel, PowerPoint. |
| **Học Viên Cấp Tốc**| `THGZ01` *(Nguyễn Văn An)* | `123` | Làm bài khảo thí MOS, nộp bài thực hành, xem bảng điểm. |
| **Học Viên CNTT CB** | `THGZ04` *(Đỗ Thu Hà)* | `123` | Lộ trình CC CNTT Cơ bản 6 buổi. |

---

## 5. QUY CHUẨN KỸ THUẬT BẮT BUỘC (ENGINEERING STANDARDS)

1. **Nguyên Tắc An Ninh (Security P0):**
   - **Không bao giờ** đặt link dẫn đến `/admin` trên bất kỳ giao diện công khai nào.
   - Khi xuất file Excel/CSV, luôn bọc hàm `escapeCsv` khử độc formula injection `^[=+\-@\t\r]`.
   - Tất cả request từ Frontend gọi về Backend phải đi qua [apiClient.ts](file:///f:/PR_%20Tin%20H%E1%BB%8Dc/eduquest-study-app/src/services/api/apiClient.ts) để tự động đính kèm CSRF Token.
2. **Nguyên Tắc Giao Diện (UI/UX):**
   - Không tạo các thanh điều hướng trùng lặp (No Duplicate Navigation). Mọi chức năng quản trị tuân theo Left Sidebar của `StandaloneAdminApp`.
   - Các form nhập mật khẩu luôn phải có icon con mắt 👁️ (Hiện/Ẩn) bằng component `Eye / EyeOff` của `lucide-react`.
3. **Quy Trình Kiểm Thử & Triển Khai (Quality Gates):**
   - Mọi thay đổi code trước khi push đều phải vượt qua:
     ```bash
     npx tsc --noEmit && npm test
     ```
   - Không được phép đẩy code làm gãy bất kỳ bài test nào trong số 51 automated tests.
