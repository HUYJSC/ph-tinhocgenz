# MÔ HÌNH ĐE DỌA AN NINH VÀ BẢO MẬT HỆ THỐNG (SECURITY THREAT MODEL)
## HỆ THỐNG: PH DIGITAL EDUCATION (ADMIN & LMS)
**Tiêu chuẩn áp dụng:** OWASP Top 10 (2021) & OWASP ASVS Level 2  
**Phiên bản:** 1.0 (Audit Chỉ Đọc - Phase 0)  
**Ngày lập:** 03/09/2026  

---

## 1. PHÂN TÍCH RỦI RO THEO KHUNG OWASP TOP 10

### A01:2021 — Broken Access Control (Lỗi Kiểm Soát Truy Cập)
- **Điểm yếu hiện tại:** Việc phân quyền (`role === 'admin'`) diễn ra ở phía client trong `src/App.tsx` và `src/hooks/useAuth.ts`. Bất kỳ ai sửa đổi đối tượng trong `localStorage` hoặc can thiệp bằng browser console đều có thể kích hoạt quyền hiển thị cổng quản trị (`AdminPortal.tsx`).
- **Nguy cơ khai thác:** Học viên tự gán vai trò `admin`, truy cập vào danh sách học viên, xóa đề thi hoặc xem trước đáp án.
- **Biện pháp khắc phục:** Chuyển 100% việc cấp quyền sang Backend Django qua Permission Classes (`IsAdmin`, `IsTeacherOrAdmin`). Mỗi API request phải kiểm tra quyền đối tượng (Object-level Permission) trước khi trả về dữ liệu.

---

### A02:2021 — Cryptographic Failures & Credential Exposure (Lộ Lọt Thông Tin Xác Thực)
- **Điểm yếu hiện tại:** 
  1. Mật khẩu học viên và cán bộ giảng viên được lưu trữ dưới dạng bản rõ (plaintext) trong tệp nguồn `src/hooks/useAuth.ts` (`password: '123'`).
  2. Toàn bộ thông tin tài khoản được lưu trong `localStorage` của trình duyệt, không được mã hóa.
  3. Mã PIN quản trị ngắn được sử dụng làm mật khẩu chính thức.
- **Nguy cơ khai thác:** Lộ danh tính, rò rỉ dữ liệu cá nhân (PII) học viên, tấn công đánh cắp phiên (Session Hijacking).
- **Biện pháp khắc phục:** 
  - Băm toàn bộ mật khẩu trên máy chủ bằng thuật toán **Argon2id** với thông số an toàn (tối thiểu 12 ký tự).
  - Triển khai xác thực hai yếu tố (MFA - TOTP) bắt buộc cho Giáo vụ, Quản trị và Super Admin.
  - Xóa bỏ hoàn toàn mật khẩu khỏi LocalStorage và JavaScript bundle.

---

### A03:2021 — Injection (Tấn Công Chèn Mã & Formula Injection)
- **Điểm yếu hiện tại:**
  - Chức năng xuất danh sách bảng điểm hoặc học viên ra định dạng CSV/Excel chưa xử lý kiểm tra các ký tự kích hoạt công thức (`=`, `+`, `-`, `@`, `\t`, `\r`).
- **Nguy cơ khai thác:** Kẻ tấn công đặt tên học viên hoặc nội dung bài nộp bắt đầu bằng công thức `=CMD|' /C calc'!A0`. Khi giáo vụ/quản trị mở file CSV bằng Microsoft Excel, mã độc có thể được kích hoạt trên máy tính quản trị viên (CSV/Excel Formula Injection).
- **Biện pháp khắc phục:** Bọc dấu nháy đơn (`'`) hoặc tiền tố an toàn trước mọi trường văn bản bắt đầu bằng ký tự điều khiển công thức khi xuất file bảng tính.

---

### A04:2021 — Insecure Design (Thiết Kế Không An Toàn)
- **Điểm yếu hiện tại:** Hệ thống cho phép xuất toàn bộ cơ sở dữ liệu `localStorage` bao gồm mật khẩu và lịch sử điểm danh ra file JSON tải về (`UserProfileModal.tsx` dòng 217: `localStorageDump`).
- **Nguy cơ khai thác:** Người dùng vô tình chia sẻ file cấu hình hoặc kẻ tấn công mượn máy trích xuất file sao lưu chứa toàn bộ tài khoản hệ thống.
- **Biện pháp khắc phục:** Loại bỏ tính năng trích xuất toàn bộ dữ liệu hệ thống tại client; thay thế bằng API sao lưu có phân quyền Super Admin trên máy chủ.

---

### A05:2021 — Security Misconfiguration (Cấu Hình Sai Lệch Về An Ninh)
- **Điểm yếu hiện tại:**
  1. `backend/config/settings/base.py` có `SECRET_KEY` mặc định mang tiền tố `django-insecure-`.
  2. `backend/config/settings/local.py` bật `DEBUG = True` và cấu hình SQLite thay vì PostgreSQL.
  3. `CORS_ALLOW_ALL_ORIGINS` trong môi trường dev có thể bị nhầm lẫn khi triển khai.
  4. Chưa thiết lập `SECURE_HSTS_SECONDS`, `SESSION_COOKIE_SECURE = True`, `CSRF_COOKIE_SECURE = True` trên production.
- **Nguy cơ khai thác:** Rò rỉ traceback mã nguồn, tấn công sniffing phiên qua giao thức HTTP không mã hóa.
- **Biện pháp khắc phục:** Tạo cấu hình `production.py` tách biệt; kiểm soát chặt chẽ danh sách domain được phép truy cập CORS (`CORS_ALLOWED_ORIGINS`); nạp `SECRET_KEY` duy nhất từ biến môi trường máy chủ.

---

### A07:2021 — Identification and Authentication Failures (Lỗi Nhận Diện & Xác Thực)
- **Điểm yếu hiện tại:**
  1. Cho phép tài khoản duy trì mật khẩu mặc định `"123"` mà không có cơ chế cưỡng chế đổi mật khẩu mạnh ngay lần đăng nhập đầu tiên.
  2. Chưa có cơ chế khóa tài khoản tạm thời sau nhiều lần đăng nhập sai (Brute-force protection) tại tầng API.
  3. Chưa có session rotation sau khi đăng nhập thành công.
- **Biện pháp khắc phục:**
  - Cưỡng chế đổi mật khẩu lần đầu với chính sách tối thiểu 12 ký tự, đa dạng ký tự.
  - Tích hợp Progressive Delay và khóa tài khoản 15 phút sau 5 lần nhập sai liên tiếp.
  - Tự động hủy phiên cũ và tạo Session ID mới sau khi người dùng đăng nhập.

---

### A09:2021 — Security Logging and Monitoring Failures (Thiếu Hụt Nhật Ký An Ninh)
- **Điểm yếu hiện tại:** Mọi hoạt động thêm/sửa/xóa học viên, sửa điểm chỉ diễn ra trong React component state hoặc LocalStorage; không có máy chủ ghi nhận nhật ký tập trung.
- **Nguy cơ khai thác:** Khi xảy ra sự cố can thiệp điểm thi hoặc rò rỉ dữ liệu, đội ngũ vận hành không có bằng chứng lịch sử (Digital Forensics) để quy trách nhiệm.
- **Biện pháp khắc phục:** Bắt buộc mọi thao tác nhạy cảm (Đăng nhập, Đổi điểm, Khóa tài khoản, Cấp chứng nhận) phải tạo bản ghi trong bảng `audit_auditlog` với: ID người thực hiện, vai trò, địa chỉ IP, User-Agent, hành động, dữ liệu trước/sau (Diff JSON) và thời gian UTC.

---

## 2. CHÍNH SÁCH HEADER AN NINH BẮT BUỘC (HTTP SECURITY HEADERS)

Mọi phản hồi từ hệ thống web và API phải đính kèm:
```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://hoctructuyen.tinhocgenz.io.vn; frame-ancestors 'self';
```

Đối với các endpoint nội bộ (`/admin`, `/academic`, `/api`):
```http
X-Robots-Tag: noindex, nofollow, noarchive, nosnippet
Cache-Control: no-store, no-cache, must-revalidate, private
Pragma: no-cache
Expires: 0
```
