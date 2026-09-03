# LỘ TRÌNH TRIỂN KHAI VÀ TÁI CẤU TRÚC HỆ THỐNG (IMPLEMENTATION ROADMAP)
## HỆ THỐNG: PH DIGITAL EDUCATION & TIN HỌC GEN Z
**Chiến lược:** Phân kỳ an toàn (Zero Breaking Changes), kiểm thử tự động tại từng chặng  

---

## 1. TỔNG QUAN CÁC GIAI ĐOẠN TRIỂN KHAI

```text
GIAI ĐOẠN 0: DISCOVERY & AUDIT CHỈ ĐỌC (ĐÃ HOÀN THÀNH 100%)
      │
      ▼
GIAI ĐOẠN 1: CÔ LẬP & KHÓA LỖ HỔNG P0 (SECURITY LOCKDOWN)
      │
      ▼
GIAI ĐOẠN 2: CHUYỂN ĐỔI XÁC THỰC SANG BACKEND PYTHON & POSTGRESQL
      │
      ▼
GIAI ĐOẠN 3: TÍCH HỢP RBAC, OBJECT-LEVEL PERMISSION & API CLIENT SDK
      │
      ▼
GIAI ĐOẠN 4: TÁCH RỜI MÔ-ĐUN QUẢN TRỊ & BẢO VỆ GOOGLE MEET/DRIVE
      │
      ▼
GIAI ĐOẠN 5: TỐI ƯU HÓA GIAO DIỆN UI/UX, MOBILE-FIRST & ACCESSIBILITY
      │
      ▼
GIAI ĐOẠN 6: DỌN DẸP CODE THỪA & TỐI ƯU HIỆU NĂNG BUNDLE
      │
      ▼
GIAI ĐOẠN 7: TỰ ĐỘNG HÓA KIỂM THỬ TOÀN DIỆN (E2E & REGRESSION TESTS)
      │
      ▼
GIAI ĐOẠN 8: TRIỂN KHAI PRODUCTION, SMOKE TEST & BÀN GIAO VẬN HÀNH
```

---

## 2. CHI TIẾT TỪNG GIAI ĐOẠN TRIỂN KHAI

### Giai đoạn 0: Discovery & Audit Chỉ Đọc (Đã Hoàn Thành)
- Quét toàn bộ repository, phát hiện sự phân mảnh giữa Frontend (LocalStorage) và Backend (Django DRF).
- Lập bảng phân loại lỗ hổng bảo mật P0–P3.
- Tạo trọn bộ 7 tài liệu kiến trúc và kiểm toán trong thư mục `docs/`.

### Giai đoạn 1: Cô Lập & Khóa Lỗ Hổng P0 (Security Lockdown)
- Xóa bỏ thẻ `<a>` liên kết `/admin` trên navbar công khai của `LandingPage.tsx`.
- Xóa hàm quick-fill `handleQuickFillAdmin` khỏi `UnifiedAuthGateway.tsx`.
- Loại bỏ toàn bộ tài khoản và mật khẩu hardcode (`INITIAL_STUDENT_ACCOUNTS`, `INITIAL_TEACHER_ACCOUNTS`) khỏi bundle JavaScript client.
- Thiết lập dynamic meta tag và header `X-Robots-Tag: noindex, nofollow, noarchive` cho mọi trang nội bộ.
- *Cổng nghiệm thu:* Build production không còn chứa chuỗi mật khẩu; test `npm test` và `npx tsc --noEmit` đạt 100% pass.

### Giai đoạn 2: Xác Thực Backend Python & PostgreSQL Migration
- Chuyển cấu hình cơ sở dữ liệu sang PostgreSQL production thông qua biến môi trường.
- Chạy toàn bộ migrations trên máy chủ và thực thi kịch bản `migrate_all_legacy_data.py` để nạp dữ liệu mẫu sạch với mật khẩu đã băm Argon2id.
- Xây dựng API Client SDK trên Frontend (`src/services/api/`) giao tiếp với `/api/v1/accounts/login/` qua HttpOnly Secure Cookie Session.
- *Cổng nghiệm thu:* Đăng nhập thành công qua Backend API; không còn đọc mật khẩu từ LocalStorage.

### Giai đoạn 3: Phân Quyền RBAC & Object-Level Permission
- Phân định rõ 5 vai trò: Học viên (`student`), Giảng viên (`teacher`), Giáo vụ (`academic`), Quản trị (`admin`), Quản trị cấp cao (`super_admin`).
- Bảo vệ toàn bộ các endpoint CRUD trên Django bằng các Permission Classes và Object Scoping (ngăn chặn IDOR).
- Triển khai middleware ghi nhật ký bất biến `AuditLog` cho mọi thao tác sửa điểm, đổi quyền, thêm/xóa người dùng.
- *Cổng nghiệm thu:* Chạy kịch bản IDOR test và Role Escalation test; 100% các request can thiệp trái phép bị chặn bằng HTTP 403.

### Giai đoạn 4: Tách Rời Mô-đun Quản Trị & Di Trú Meet/Drive
- Tách `AdminPortal.tsx` (127KB) thành 11 sub-components chuyên biệt độc lập.
- Di chuyển toàn bộ URL Google Meet cố định vào bảng `ClassGroup` trên database, chỉ cấp phát link khi đến giờ học và học viên đã ghi danh hợp lệ.
- Loại bỏ tính năng trích xuất toàn bộ storage `localStorageDump` ra file JSON trong `UserProfileModal.tsx`.
- *Cổng nghiệm thu:* Bundle `AdminPortal` giảm dung lượng >50%; không còn link Meet tĩnh trong mã nguồn.

### Giai đoạn 5: Tối Ưu Hóa UI/UX, Mobile-First & Chuẩn Hóa Thương Hiệu
- Chuẩn hóa phân cấp thương hiệu: **TIN HỌC GEN Z — Hệ Thống Đào Tạo Trực Tuyến Chuẩn Quốc Tế**.
- Hoàn thiện luồng To-Do Hub cho Học viên, Dashboard điều hành ca học cho Giảng viên và Operating Dashboard cho Quản trị viên.
- Kiểm thử và tinh chỉnh responsive trên 13 kích thước màn hình từ 320px đến 1920px.

### Giai đoạn 6: Dọn Dẹp Mã Nguồn & Tối Ưu Hiệu Năng Bundle
- Rà soát các component, CSS và imports không sử dụng.
- Tối ưu hóa thư viện quét QR `html5-qrcode` (334KB) bằng dynamic lazy loading chỉ nạp khi mở modal quét mã.
- Tinh chỉnh Core Web Vitals (LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms).

### Giai đoạn 7: Tự Động Hóa Kiểm Thử Toàn Diện (QA Automation)
- Mở rộng bộ test case tự động bao quát 4 luồng người dùng chính (Visitor, Student, Teacher, Admin).
- Chạy full regression test và security regression test.
- Đảm bảo chất lượng kiểm thử đạt tiêu chí Release Gate (0 P0, 0 P1).

### Giai đoạn 8: Triển Khai Production & Bàn Giao Vận Hành
- Triển khai Vercel Production cho Frontend và Cloud Server/Docker cho Backend PostgreSQL.
- Thực hiện Smoke Test trực tiếp trên domain chính thức.
- Bàn giao tài liệu vận hành và kế hoạch giám sát hệ thống.
