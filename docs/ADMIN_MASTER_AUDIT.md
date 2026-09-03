# BÁO CÁO KIỂM TOÁN HỆ THỐNG QUẢN TRỊ (ADMIN MASTER AUDIT)
## HỆ THỐNG: PH DIGITAL EDUCATION (PH-TINHOCGENZ)
**Phiên bản kiểm toán:** 1.0 (Audit Chỉ Đọc - Phase 0)  
**Ngày thực hiện:** 03/09/2026  
**Đơn vị thực hiện:** Master AI Architecture & Security Team  
**Trọng tâm:** `https://hoctructuyen.tinhocgenz.io.vn/admin` và hệ sinh thái đào tạo số PH Digital Education

---

## 1. TỔNG QUAN HIỆN TRẠNG KỸ THUẬT

Qua quá trình rà soát toàn diện mã nguồn, cấu hình hạ tầng mạng và cơ sở dữ liệu, nhóm kiểm toán ghi nhận:
1. **Kiến trúc phân mảnh (Dual-Stack De-sync):** Hệ thống có backend Python/Django REST Framework được cấu hình bài bản trong thư mục `backend/` với 9 applications (`accounts`, `courses`, `assessments`, `attendance`, `assignments`, `certificates`, `analytics`, `audit`), hỗ trợ PostgreSQL, JWT và soft delete. Tuy nhiên, toàn bộ frontend React/TypeScript (`src/`) hiện đang hoạt động độc lập bằng `localStorage` phía client, hoàn toàn chưa kết nối gọi các API endpoint của Django backend.
2. **Lộ diện cổng quản trị trên Landing Page:** Thẻ liên kết công khai trỏ đến `/admin` được gắn trực tiếp trên thanh điều hướng đầu trang của `LandingPage.tsx` (Dòng 359).
3. **Quản trị và phân quyền dựa hoàn toàn vào Client State:** Xác thực học viên, giảng viên và quản trị viên diễn ra trong browser qua hook `useAuth.ts` với mật khẩu mặc định `"123"` và mã PIN hardcode.
4. **Lưu trữ nhạy cảm trong LocalStorage:** Danh sách tài khoản, mật khẩu, phân hệ, lịch dạy, bài tập và lịch sử đăng nhập được lưu dưới dạng JSON thô trong LocalStorage của trình duyệt và có chức năng xuất toàn bộ `localStorageDump` ra file JSON.
5. **Đường dẫn Google Meet cố định trong mã nguồn:** Các đường link phòng học Google Meet cố định cho 10 môn học được lưu trực tiếp trong bundle JavaScript client (`AdminPortal.tsx`, `ScheduleCalendar.tsx`).

---

## 2. BẢNG KIỂM TOÁN CHI TIẾT (AUDIT MATRIX)

| ID | URL / File | Vấn đề phát hiện | Bằng chứng mã nguồn | Mức độ | Nguyên nhân cốt lõi | Biện pháp khắc phục chuẩn | Rủi ro triển khai | Phụ trách |
|:---|:---|:---|:---|:---:|:---|:---|:---|:---|
| **SEC-01** | `src/components/landing/LandingPage.tsx` | Nút liên kết trực tiếp vào `/admin` lộ diện trên thanh điều hướng công khai | Dòng 358–380: `<a href="/admin" onClick={...} title="Cổng Quản Trị (/admin)"> <Shield size={14} /> Admin</a>` | **P0** | Đặt đường dẫn nội bộ công khai cho người dùng vãng lai | Xóa hoàn toàn nút Admin khỏi Landing Page; chỉ cho phép đăng nhập qua đường dẫn bí mật hoặc sau khi xác thực | Người dùng quản trị phải nhớ URL hoặc đăng nhập qua cổng phân quyền | Senior UI Designer & Security Eng |
| **SEC-02** | `src/hooks/useAuth.ts` | Tài khoản Quản trị và Giảng viên được hardcode với mật khẩu trống/mặc định trong mã nguồn | Dòng 201–262: `INITIAL_TEACHER_ACCOUNTS` chứa `ADMIN01` (role: `admin`), `GV01`..`GV04` với `password: '123'` | **P0** | Dùng mock accounts ban đầu nhưng để lọt vào production client bundle | Di chuyển toàn bộ danh mục tài khoản sang PostgreSQL; xác thực qua Django DRF với băm Argon2id | Học viên/GV cũ cần kích hoạt tài khoản hoặc đặt lại mật khẩu | Senior Full-stack Python & AppSec |
| **SEC-03** | `src/components/auth/UnifiedAuthGateway.tsx` | Chứa hàm kiểm thử điền sẵn tên quản trị viên và mật khẩu trong mã nguồn | Dòng 64–69: `handleQuickFillAdmin` điền `'Thầy Quang Huy'`, `'admin123'`, `'all'` | **P0** | Mã kiểm thử nhanh (quick-fill) không được bóc tách trước khi đóng gói | Xóa hoàn toàn các hàm `quickFill` khỏi mã nguồn; chuyển sang fixtures kiểm thử tự động riêng biệt | Cần cập nhật bộ test tự động (`run-tests.mjs`) | Senior AppSec & QA Automation |
| **SEC-04** | `src/hooks/useAuth.ts` & `src/App.tsx` | Phân quyền vai trò (RBAC) thực hiện tại client, dễ dàng bị thao túng qua DevTools | `App.tsx` dòng 151–170, 220–235 đọc `SESSION_ACTIVE_KEY` và `user.role` từ `localStorage` | **P0** | Frontend tự quyết định trạng thái đăng nhập và vai trò | Chuyển quyền xác thực sang Backend; sử dụng HttpOnly Secure Cookie Session/JWT có chữ ký HMAC SHA256 | Cần cấu hình CORS và cookie domain giữa Frontend và Backend | Senior Software Architect |
| **SEC-05** | `index.html` & `vercel.json` | Khách truy cập `/admin` kế thừa thẻ meta `index, follow` và canonical trỏ về trang chủ | `index.html` dòng 22–23: `<meta name="robots" content="index, follow..." />`, `<link rel="canonical" href="..."/>` | **P1** | Ứng dụng Single Page Application (SPA) dùng chung 1 file HTML gốc cho mọi route | Thêm logic dynamic meta tag hoặc tiêm header `X-Robots-Tag: noindex, nofollow, noarchive` cho mọi trang quản trị | Bot tìm kiếm có thể đã lập chỉ mục nếu chưa cấu hình header | Senior DevOps & SRE |
| **SEC-06** | `src/components/admin/StandaloneAdminApp.tsx` | Lộ liên kết công khai đến trang quản trị Django Backend trên giao diện | Dòng 424–427: `<a href="https://tinhocgenz.io.vn/admin" target="_blank">` | **P1** | Đặt shortcut tiện ích cho quản trị viên chưa qua xác thực | Gỡ bỏ liên kết URL Django Admin công khai khỏi giao diện client; bảo vệ Django Admin bằng IP whitelist/VPN | Tiết lộ bề mặt tấn công của backend CMS | Senior Security Engineer |
| **SEC-07** | `src/components/admin/AdminPortal.tsx` | Hardcode toàn bộ URL Google Meet của 10 môn học trong JavaScript bundle | Dòng 125, 136–145: `https://meet.google.com/tgz-master-live`, `tgz-we01-live`... | **P1** | Cấu hình phòng học tĩnh được gắn thẳng vào component React | Di chuyển cấu hình phòng học và Meet URL vào bảng `ClassGroup`/`Schedule` trên PostgreSQL | Giảng viên cần nhập link phòng học trong bảng điều khiển | Senior Data Architect |
| **SEC-08** | `src/components/auth/UserProfileModal.tsx` | Cho phép trích xuất (dump) toàn bộ cơ sở dữ liệu `localStorage` bao gồm mật khẩu ra file | Dòng 217: `localStorageDump: { ...localStorage }` | **P1** | Tính năng sao lưu phía client vô tình xuất dữ liệu nhạy cảm của mọi tài khoản | Loại bỏ trường `localStorageDump` chứa tài khoản và mật khẩu; chỉ cho phép tải dữ liệu cá nhân của chính mình | Thay đổi định dạng file backup hồ sơ người dùng | Senior AppSec & Full-stack |
| **SEC-09** | `backend/config/settings/local.py` | Cấu hình cơ sở dữ liệu mặc định là SQLite thay vì PostgreSQL | Dòng 9–14: `DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3"}}` | **P2** | Chưa có file cấu hình môi trường production chuẩn hóa | Bổ sung `production.py` nạp cấu hình PostgreSQL từ biến môi trường `DATABASE_URL` | Cần triển khai PostgreSQL cluster hoặc managed DB | Senior DevOps/SRE |
| **SEC-10** | `.github/workflows/deploy.yml` | Lệnh cài đặt dependencies backend trong CI/CD trỏ sai đường dẫn tệp requirements | Dòng 85: `pip install -r backend/requirements/base.txt` (thư mục thực tế là `backend/requirements.txt`) | **P2** | Lỗi đường dẫn tương đối trong kịch bản GitHub Actions | Sửa thành `pip install -r backend/requirements.txt` | Pipeline CI/CD sẽ lỗi khi kích hoạt tự động trên GitHub Actions | Senior DevOps/SRE |
| **SEC-11** | `backend/apps/accounts/models.py` | Chưa có phân tách giữa Quản trị viên (Admin) và Quản trị viên cấp cao (Super Admin) | Dòng 26–31: `Role.choices` chỉ có `STUDENT`, `TEACHER`, `ACADEMIC`, `ADMIN` | **P2** | Thiết kế Role Model chưa phản ánh đúng yêu cầu 5 cấp bậc quản trị | Mở rộng `Role.SUPER_ADMIN = "super_admin"`, phân định quyền cấu hình hệ thống chuyên biệt | Cần tạo migration mới cho model User | Senior Software Architect |
| **SEC-12** | `src/components/auth/ChangePasswordModal.tsx` | Độ dài mật khẩu tối thiểu chỉ yêu cầu 6 ký tự | Dòng 130: `length < 6` | **P2** | Quy định chính sách mật khẩu lỏng lẻo | Nâng chuẩn độ dài mật khẩu lên tối thiểu 12 ký tự, kèm đánh giá độ mạnh Zxcvbn | Người dùng hiện tại có mật khẩu ngắn phải cập nhật | Senior AppSec Engineer |
| **SEC-13** | Toàn bộ ứng dụng Frontend `src/` | Frontend và Backend hoạt động phân mảnh, không có API client service | Không có module `axios` hoặc `fetch` kết nối đến `http://localhost:8000/api/v1/` | **P1** | Giai đoạn xây dựng giao diện hoàn thiện trước giai đoạn tích hợp backend | Xây dựng API Client SDK chuẩn (Axios/Fetch with interceptors) kết nối React sang Django | Cần đồng bộ trạng thái state quản lý | Senior Full-stack Developer |
| **SEC-14** | `src/services/accountRecoveryService.ts` | Khôi phục tài khoản qua OTP email giả lập lưu log mã xác nhận trong browser | Dòng 74–75, 211–212: Sử dụng `STORAGE_KEY` và `EMAIL_LOGS_KEY` để mô phỏng gửi email | **P2** | Chưa tích hợp nhà cung cấp SMTP / Email API thực tế | Kết nối dịch vụ gửi email chuẩn (Resend / SendGrid / AWS SES) qua Django backend | Cần cấu hình API key dịch vụ email | Senior Full-stack Developer |

---

## 3. ĐÁNH GIÁ MỨC ĐỘ ƯU TIÊN (PRIORITY CLASSIFICATION)

- **P0 (Cực kỳ nghiêm trọng - Khóa ngay lập tức):** SEC-01, SEC-02, SEC-03, SEC-04.
- **P1 (Nghiêm trọng - Cần giải quyết trong Giai đoạn 1):** SEC-05, SEC-06, SEC-07, SEC-08, SEC-13.
- **P2 (Trung bình - Cần giải quyết trong Giai đoạn 2 & 3):** SEC-09, SEC-10, SEC-11, SEC-12, SEC-14.
- **P3 (Thấp - Tối ưu hóa UI/UX & Refactor mã nguồn):** Dọn dẹp dead code, tối ưu kích thước bundle, chuẩn hóa CSS tokens.
