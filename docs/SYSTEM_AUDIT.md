# BÁO CÁO KIỂM TOÁN CHUYÊN SÂU TOÀN DIỆN (SYSTEM AUDIT)
## HỆ THỐNG: PH DIGITAL EDUCATION & TIN HỌC GEN Z
**Ngày thực hiện:** 03/09/2026  
**Tiêu chuẩn:** Đánh giá đa chiều từ 12 vai trò chuyên gia  

---

## 1. ĐÁNH GIÁ TỔNG QUAN ĐA VAI TRÒ

### 1.1. Góc Nhìn Business Analyst (BA) & Product Manager (PO)
- **Điểm mạnh:** Lộ trình 10 khóa học được thiết kế sát với nhu cầu thị trường (MOS Word/Excel/PPT, IC3 GS6, CNTT Cơ bản/Nâng cao, AI Văn phòng). Có mô hình phân loại phụ huynh / học viên theo độ tuổi (<25 tuổi gửi phụ huynh, >=25 tuổi gửi trực tiếp).
- **Khiếm khuyết:** Luồng người dùng giữa website marketing (`tinhocgenz.io.vn`) và hệ thống LMS (`hoctructuyen.tinhocgenz.io.vn`) chưa có cơ chế bàn giao lead và chuyển đổi người dùng tự động sau thanh toán.

### 1.2. Góc Nhìn UX Researcher & UI Designer
- **Điểm mạnh:** Giao diện áp dụng bảng màu xanh thương hiệu (`#2563EB`) hiện đại, bố cục To-Do Hub theo chuẩn Canvas LMS giúp học viên định hướng học tập tốt. Có thanh điều hướng đáy di động (Mobile Bottom Nav 5 tab).
- **Khiếm khuyết:**
  - Nút `/admin` lộ diện công khai trên thanh menu của trang đích gây hoang mang cho học viên và tạo cảm giác thiếu chuyên nghiệp.
  - Màn hình quản trị `AdminPortal.tsx` quá tải thông tin (hơn 2200 dòng mã nhồi nhét 11 tab vào một component).
  - Chưa có trạng thái rỗng (Empty State) và thông báo lỗi thân thiện khi mất kết nối mạng.

### 1.3. Góc Nhìn Frontend Engineer
- **Điểm mạnh:** Áp dụng code splitting (`React.lazy()`) rất tốt cho các component lớn; build production nhanh (8.84s); cấu hình TypeScript chặt chẽ (0 lỗi).
- **Khiếm khuyết:** Toàn bộ dữ liệu nằm trong `localStorage`, không có API client service (Axios/Fetch) kết nối với máy chủ; dữ liệu biến mất khi đổi trình duyệt hoặc xóa cache.

### 1.4. Góc Nhìn Backend & Database Architect
- **Điểm mạnh:** Backend Django được thiết kế module hóa thành 9 apps rõ ràng, mô hình hóa quan hệ đầy đủ (Course, ClassGroup, AttendanceSession, Assignment, Exam, Question, AuditLog), test coverage đạt 87%.
- **Khiếm khuyết:** Chưa cấu hình file `production.py` để kết nối PostgreSQL; vẫn đang chạy SQLite cục bộ; thiếu vai trò `super_admin`.

### 1.5. Góc Nhìn Application Security Engineer (AppSec)
- **Lỗ hổng P0:**
  1. Phân quyền Admin hoàn toàn ở client, dễ bị vượt qua bằng DevTools.
  2. Mật khẩu bản rõ `"123"` của học viên và quản trị viên bị nhúng trong mã nguồn JavaScript.
  3. Hàm quick-fill tự động điền thông tin admin trong `UnifiedAuthGateway.tsx`.
- **Lỗ hổng P1:** 10 link Google Meet cố định bị lộ trong mã nguồn; `UserProfileModal` cho phép trích xuất toàn bộ dữ liệu storage ra file JSON.

### 1.6. Góc Nhìn SEO Technical Specialist
- **Điểm mạnh:** `index.html` có đầy đủ thẻ OpenGraph, Twitter Card, JSON-LD Schema `EducationalOrganization`. File `public/sitemap.xml` chuẩn hóa 10 khóa học.
- **Khiếm khuyết:** `/admin` dùng chung `index.html` nên kế thừa thẻ meta `<meta name="robots" content="index, follow">` và canonical trỏ về trang chủ.

### 1.7. Góc Nhìn Performance & Mobile Engineer
- **Điểm mạnh:** Bundle Vite đã chia nhỏ (`vendor-react`, `vendor-icons`, `vendor-qrcode`).
- **Khiếm khuyết:** `vendor-qrcode` có kích thước lớn (334KB chưa nén); các bảng dữ liệu quản trị lớn chưa tối ưu dạng Card View trên màn hình nhỏ (<375px).

### 1.8. Góc Nhìn QA Automation Engineer
- **Điểm mạnh:** Có 51 bài test frontend (`tests/run-tests.mjs`) và 16 bài test backend (`backend/tests`), tất cả đều đạt 100% pass.
- **Khiếm khuyết:** Test frontend chủ yếu kiểm tra sự tồn tại của file và chuỗi ký tự trong mã nguồn, chưa có integration tests và E2E tests thực tế trên trình duyệt mô phỏng luồng đăng nhập - làm bài thi.

### 1.9. Góc Nhìn DevOps & SRE
- **Điểm mạnh:** Có sẵn Dockerfile, Docker Compose và cấu hình Vercel Security Headers.
- **Khiếm khuyết:** Workflow GitHub Actions `.github/workflows/deploy.yml` chứa lỗi đường dẫn cài đặt requirements (`base.txt` thay vì `requirements.txt`).
