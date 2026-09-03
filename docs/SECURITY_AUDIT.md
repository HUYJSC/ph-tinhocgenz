# BÁO CÁO KIỂM TOÁN AN NINH & MÔ HÌNH BẢO VỆ (SECURITY AUDIT)
## HỆ THỐNG: PH DIGITAL EDUCATION (ADMIN & LMS)
**Tiêu chuẩn đánh giá:** OWASP Top 10 (2021) & OWASP ASVS Level 2  
**Mức độ tuân thủ hiện tại:** CHƯA ĐẠT CHUẨN DO CÁC LỖ HỔNG P0 PHÍA CLIENT  

---

## 1. TỔNG HỢP DANH MỤC LỖ HỔNG BẢO MẬT THEO ĐỘ ƯU TIÊN

### 🔴 Mức P0 — Nguy cơ Khẩn cấp (Blocker)
1. **SEC-P0-01: Bypass Phân Quyền Phía Client (Client-Side RBAC)**
   - *Vị trí:* `src/App.tsx` (dòng 151–235), `src/hooks/useAuth.ts` (dòng 308–315).
   - *Mô tả:* Trạng thái phiên và vai trò được xác định bằng `localStorage.getItem('phtinhocgenz_session_active_v4')` và `user.role`. Kẻ tấn công có thể sửa đối tượng này trong DevTools để truy cập toàn bộ giao diện quản trị.
   - *Khắc phục:* Chuyển 100% việc cấp quyền và bảo vệ route sang Backend DRF qua HttpOnly Secure Cookies và Permission Classes (`IsAdmin`, `IsTeacherOrAdmin`).
2. **SEC-P0-02: Lộ Danh Mục Tài Khoản & Mật Khẩu Bản Rõ Trong JavaScript Bundle**
   - *Vị trí:* `src/hooks/useAuth.ts` (dòng 22–262).
   - *Mô tả:* Chứa danh sách tài khoản `ADMIN01`, `GV01`..`GV04` và 12 học viên với mật khẩu bản rõ `"123"`. Khi đóng gói production, các thông tin này xuất hiện nguyên vẹn trong bundle public của Vite.
   - *Khắc phục:* Xóa toàn bộ danh mục tài khoản mẫu khỏi mã nguồn frontend; lưu trữ tập trung trên PostgreSQL với băm Argon2id.
3. **SEC-P0-03: Hàm Tự Động Điền Thông Tin Quản Trị Viên (Quick-Fill Handlers)**
   - *Vị trí:* `src/components/auth/UnifiedAuthGateway.tsx` (dòng 64–69).
   - *Mô tả:* Tồn tại hàm `handleQuickFillAdmin` điền sẵn tên `'Thầy Quang Huy'` và mật khẩu `'admin123'`.
   - *Khắc phục:* Xóa bỏ toàn bộ các hàm quick-fill khỏi mã nguồn; tách thành file test fixtures riêng.
4. **SEC-P0-04: Lộ Diện Đường Dẫn Cổng Quản Trị Trên Trang Công Khai**
   - *Vị trí:* `src/components/landing/LandingPage.tsx` (dòng 358–380).
   - *Mô tả:* Thẻ `<a>` dẫn đến `/admin` được gắn công khai trên thanh điều hướng đầu trang.
   - *Khắc phục:* Gỡ bỏ hoàn toàn nút Admin khỏi Landing Page.

### 🟠 Mức P1 — Nghiêm trọng (Critical)
5. **SEC-P1-01: Lộ Đường Link Phòng Học Google Meet Trong JavaScript Bundle**
   - *Vị trí:* `src/components/admin/AdminPortal.tsx` (dòng 125, 136–145, 2138).
   - *Mô tả:* 10 link Google Meet cố định bị nhúng trực tiếp trong bundle công khai.
   - *Khắc phục:* Di chuyển link Meet vào bảng `ClassGroup` trong cơ sở dữ liệu; chỉ trả về link khi đến giờ học và người dùng đã điểm danh hợp lệ.
6. **SEC-P1-02: Kế Thừa Thẻ Meta Robots Index, Follow Trên Route Quản Trị**
   - *Vị trí:* `index.html` (dòng 22–23).
   - *Mô tả:* Toàn bộ SPA dùng chung 1 file HTML có thẻ `<meta name="robots" content="index, follow">` và canonical trỏ về trang chủ.
   - *Khắc phục:* Bổ sung dynamic meta tag quản trị và cấu hình header `X-Robots-Tag: noindex, nofollow, noarchive` cho mọi trang nội bộ.
7. **SEC-P1-03: Rò Rỉ Cơ Sở Dữ Liệu Qua Tính Năng Sao Lưu Hồ Sơ**
   - *Vị trí:* `src/components/auth/UserProfileModal.tsx` (dòng 217).
   - *Mô tả:* Tính năng xuất dữ liệu cho phép dump toàn bộ `localStorage` ra file JSON tải về máy.
   - *Khắc phục:* Bỏ trường `localStorageDump`; chỉ cho phép tải thông tin cá nhân của chính tài khoản đăng nhập.

### 🟡 Mức P2 — Trung bình (High)
8. **SEC-P2-01: Cơ Chế Khôi Phục Mật Khẩu Lưu OTP Trong Trình Duyệt**
   - *Vị trí:* `src/services/accountRecoveryService.ts` (dòng 74–75).
   - *Mô tả:* Mã OTP 6 số được sinh và lưu tạm trong `localStorage`/`sessionStorage` của trình duyệt.
   - *Khắc phục:* Chuyển luồng sinh và xác thực OTP về Backend; tích hợp dịch vụ gửi email chuẩn (Resend / AWS SES).
9. **SEC-P2-02: Thiếu Chính Sách Mật Khẩu Chuẩn Doanh Nghiệp**
   - *Vị trí:* `src/components/auth/ChangePasswordModal.tsx` (dòng 130).
   - *Mô tả:* Chỉ yêu cầu độ dài tối thiểu 6 ký tự.
   - *Khắc phục:* Nâng lên tối thiểu 12 ký tự, bắt buộc đổi mật khẩu lần đầu đối với mọi tài khoản được cấp mới.
