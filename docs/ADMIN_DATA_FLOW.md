# KIẾN TRÚC VÀ LUỒNG DỮ LIỆU HỆ THỐNG (ADMIN DATA FLOW)
## HỆ THỐNG: PH DIGITAL EDUCATION
**Phiên bản:** 1.0 (Audit Chỉ Đọc - Phase 0)  
**Ngày lập:** 03/09/2026  

---

## 1. SO SÁNH LUỒNG DỮ LIỆU HIỆN TẠI VS LUỒNG DỮ LIỆU MỤC TIÊU

### A. Luồng Dữ Liệu Hiện Tại (Current State - Client Heavy / Disconnected)
```text
[ Trình Duyệt / Người Dùng ]
      │
      ▼
[ Giao Diện React / TypeScript (SPA) ]
      │
      ├─► useAuth.ts ───────► Đọc/Ghi LocalStorage ('phtinhocgenz_student_accounts_v11', 'phtinhocgenz_auth_user_v11')
      │                       (So khớp mật khẩu client '123' hoặc mã PIN)
      │
      ├─► useAttendance.ts ──► Đọc/Ghi LocalStorage ('phtgz_attendance_sessions_v4')
      │
      ├─► useAssignment.ts ──► Đọc/Ghi LocalStorage ('phtgz_assignments_v4', 'phtgz_submissions_v4')
      │
      ├─► useSchedule.ts ────► Đọc/Ghi LocalStorage ('phtgz_schedules_v4')
      │
      └─► Hardcode Links ────► Google Meet tĩnh ('https://meet.google.com/tgz-master-live')

[ Backend Django / PostgreSQL ]  ◄── (HOÀN TOÀN TÁCH RỜI, CHƯA ĐƯỢC FRONTEND GỌI API)
```

**Rủi ro nghiêm trọng:**
1. Toàn bộ dữ liệu nằm trong thiết bị học viên/giảng viên; khi xóa cache trình duyệt hoặc đổi máy tính, dữ liệu biến mất hoàn toàn.
2. Học viên có thể sửa đổi kết quả thi cử, điểm danh hoặc vai trò tài khoản trực tiếp qua bảng điều khiển Storage của trình duyệt.

---

### B. Luồng Dữ Liệu Mục Tiêu Chuẩn Doanh Nghiệp (Target Enterprise Architecture)
```text
[ Trình Duyệt / Mobile App ]
      │
      ▼ HTTPS (TLS 1.3 / Strict-Transport-Security)
[ Vercel Edge / Reverse Proxy / Cloudflare ]
      │
      ├─► Static Content / SPA Bundle ──► CDN Caching (immutable assets)
      │
      └─► API Requests (/api/v1/*) ─────► Django REST Framework Application
                                                │
         ┌──────────────────────────────────────┴──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
[ Tầng Xác Thực & Phân Quyền ]           [ Tầng Xử Lý Nghiệp Vụ ]               [ Tầng Bất Biến & Giám Sát ]
 - Argon2id Password Check                - Transaction Management                - Immutable AuditLog Engine
 - MFA Device Check (TOTP)                - Grade Lock & Revision                 - User Activity Correlation
 - HttpOnly Secure Cookie / JWT           - Object Permission Validator           - Security Threat Event Log
         │                                      │                                      │
         └──────────────────────────────────────┼──────────────────────────────────────┘
                                                ▼
                                   [ Cơ Sở Dữ Liệu PostgreSQL ]
                                    - Master Relational Store
                                    - Row-Level Locks (SELECT FOR UPDATE)
                                    - Soft Delete Filters
                                    - Foreign Key Integrity
                                                │
                        ┌───────────────────────┴───────────────────────┐
                        ▼                                               ▼
             [ Redis Cache & Queue ]                          [ S3 / Vercel Blob ]
              - Session Storage & Revocation                   - Private File Submissions
              - Rate Limiting (Token Bucket)                   - Signed Download URLs
              - Asynchronous Notification Jobs                 - Anti-Virus / MIME Check
```

---

## 2. CHI TIẾT LUỒNG DỮ LIỆU XÁC THỰC (AUTHENTICATION FLOW)

```text
1. Người dùng nhập Mã cán bộ/Mã học viên + Mật khẩu
2. Client gửi HTTP POST (JSON) -> /api/v1/accounts/login/ kèm CSRF Token
3. Django Backend:
   a. Kiểm tra Rate Limiting IP và Username (Chống Brute Force)
   b. Truy vấn User theo username trong PostgreSQL
   c. Xác minh mật khẩu bằng thuật toán Argon2id
   d. Kiểm tra trạng thái is_active, is_deleted
   e. Nếu là tài khoản đặc quyền (Academic, Admin, Super Admin): Yêu cầu bước MFA (TOTP)
   f. Tạo mới Session ID, ghi nhận LoginAttempt thành công, rotate Session
   g. Thiết lập Set-Cookie: sessionid (HttpOnly, Secure, SameSite=Lax)
   h. Trả về thông tin User Profile tối giản (Không chứa mật khẩu hay thông tin nhạy cảm)
4. Frontend lưu User Context trong RAM (React Context / Zustand), không lưu mật khẩu trong LocalStorage
```

---

## 3. CHI TIẾT LUỒNG DỮ LIỆU KHẢO THÍ VÀ CHẤM ĐIỂM (EXAM & GRADING FLOW)

```text
1. Bắt đầu bài thi:
   - Học viên gửi POST /api/v1/assessments/exams/{id}/start/
   - Backend tạo bản ghi ExamAttempt, xáo trộn thứ tự câu hỏi và đáp án dựa trên Seed bảo mật
   - Trả về câu hỏi và các phương án KHÔNG KÈM ĐÁP ÁN ĐÚNG

2. Trong quá trình làm bài:
   - Client gửi Heartbeat định kỳ 30 giây lưu StudentAnswer lên Server (thay vì chỉ lưu localStorage)
   - Nếu xảy ra sự kiện rời tab (visibilitychange), ghi nhận ProctoringEvent (Rời màn hình thi)

3. Nộp bài và Khóa bài:
   - Học viên nhấn Nộp bài -> POST /api/v1/assessments/exams/{id}/submit/
   - Backend chấm điểm tự động đối với trắc nghiệm, chốt điểm tạm thời
   - Đối với bài tập tự luận/Office thực hành: Chuyển trạng thái sang `pending_grading`

4. Giảng viên chấm bài:
   - Giảng viên được phân công mở bài chấm -> Nhập điểm theo Rubric, ghi nhận xét
   - Nhấn "Lưu & Khóa điểm" -> Hệ thống ghi nhận GradeRevision và kích hoạt AuditLog
   - Thông báo kết quả qua hệ thống Notification nội bộ và Zalo ZNS
```

---

## 4. CHI TIẾT LUỒNG DỮ LIỆU TÍCH HỢP BÊN NGOÀI (EXTERNAL INTEGRATIONS)

1. **Google Meet:**
   - Link phòng học không được lưu cứng trong frontend bundle.
   - Mỗi lớp học (`ClassGroup`) có trường `online_meeting_url` cấu hình trong cơ sở dữ liệu.
   - Chỉ học viên đã điểm danh hoặc đã ghi danh trong lớp mới được backend trả về link phòng học khi đến giờ học (`Schedule.start_time - 15m`).
2. **Tổng Đài Zalo ZNS:**
   - Khi phát hiện cảnh báo học vụ (vắng học 2 buổi liên tiếp hoặc trễ hạn nộp bài):
   - Logic phân tách độ tuổi:
     - Học viên < 25 tuổi: Định tuyến tin nhắn đến Zalo của Phụ huynh.
     - Học viên >= 25 tuổi: Gửi trực tiếp cho Học viên.
   - Bản tin được đẩy vào hàng đợi background, gửi qua Zalo Business API chính thức, lưu log trạng thái vào `ZaloNotificationLog`.

---

## 5. QUY TRÌNH TỰ KHÔI PHỤC MẬT KHẨU QUẢN TRỊ VIÊN & CÁN BỘ (ADMIN PASSWORD SELF-RECOVERY FLOW)

```text
               ┌─────────────────────────────────────────────────────────┐
               │ 1. Admin/Cán bộ bấm "Quên mật khẩu? Lấy lại qua Gmail"  │
               └──────────────────────────┬──────────────────────────────┘
                                          │
                                          ▼
               ┌─────────────────────────────────────────────────────────┐
               │ 2. Nhập định danh: Mã tài khoản (ADMIN01/admin),       │
               │    Gmail (admin@tinhocgenz.io.vn) hoặc SĐT (0988999888) │
               └──────────────────────────┬──────────────────────────────┘
                                          │
                                          ▼
                   ┌───────────────────────────────────────────────┐
                   │ 3. Chọn Kênh Nhận Mã Xác Nhận OTP:            │
                   ├──────────────────────┬────────────────────────┤
                   │  📧 Hộp thư Gmail    │  📱 SĐT / SMS / Zalo   │
                   │  (ad***n@...io.vn)   │  (0988****888)         │
                   └──────────────────────┴────────────────────────┘
                                          │
                                          ▼
               ┌─────────────────────────────────────────────────────────┐
               │ 4. Hệ thống sinh mã OTP 6 số bảo mật (TTL 10 phút)      │
               │    - Redis Cache: key 'pwd_reset_otp_{USER}', ttl=600s │
               │    - Giới hạn 5 lần nhập sai chống Brute-force          │
               │    - Tự động phát mã OTP qua kênh đã chọn               │
               └──────────────────────────┬──────────────────────────────┘
                                          │
                                          ▼
               ┌─────────────────────────────────────────────────────────┐
               │ 5. Người dùng nhập OTP 6 số + Mật khẩu mới (≥ 6 ký tự)  │
               └──────────────────────────┬──────────────────────────────┘
                                          │
                                          ▼
               ┌─────────────────────────────────────────────────────────┐
               │ 6. Backend băm mật khẩu mới bằng Argon2id / PBKDF2      │
               │    - Hủy bỏ phiên OTP cũ trong Cache                   │
               │    - Ghi nhận AuditLog hành động Reset Password         │
               │    - Mật khẩu mới có hiệu lực ngay lập tức              │
               │    - Đồng bộ trên cả 2 cổng quản trị của hệ thống       │
               └──────────────────────────┴──────────────────────────────┘
```

### Chi Tiết Cấu Hình Thông Tin Khôi Phục:
| Phân Vùng Hệ Thống | Cổng Quản Trị | Trường Định Danh Bắt Buộc | Kênh Khôi Phục Hỗ Trợ |
|:---|:---|:---|:---|
| 🏢 **Website Chính (Next.js / Django)** | `https://tinhocgenz.io.vn/admin` | `email` (Gmail), `phone` (SĐT) | Django Password Reset qua Email OTP + SMS Gateway |
| 🎓 **Cổng Học Vụ LMS (React / Vite SPA)** | `https://hoctructuyen.tinhocgenz.io.vn/admin` | `email` (`admin@tinhocgenz.io.vn`), `phone` (`0988999888`) | Modal Wizard khôi phục trực tiếp qua Gmail OTP & SĐT SMS |
