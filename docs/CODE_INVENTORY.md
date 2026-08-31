# DANH MỤC KIỂM KÊ MÃ NGUỒN (CODE INVENTORY)
**Dự án:** PH Digital Education  
**Ngày cập nhật:** 31/08/2026  
**Thẩm định:** Senior Software Architect & Tech Lead

---

## I. TỔNG QUAN TỆP MÃ NGUỒN HIỆN TẠI

* **Tổng số tệp TypeScript/React (`src/`):** 52 tệp (~18.500 dòng mã)
* **Tổng số tệp Python Backend (`backend/`):** 38 tệp (~2.800 dòng mã)
* **Tổng số tệp tài sản tĩnh (`public/`):** 24 tệp (~6.2 MB)
* **Tài liệu đặc tả (`docs/`):** 6 tệp

---

## II. BẢNG CHI TIẾT TỪNG PHÂN HỆ VÀ TRẠNG THÁI KIỂM KÊ

### 1. Phân Hệ Frontend React (`src/`)

| Tệp / Thư mục | Số dòng | Trách nhiệm chính | Đánh giá kiến trúc |
| :--- | :---: | :--- | :--- |
| `src/App.tsx` | 748 | Điều phối ứng dụng, phân trang & router | Cần tách router thành các route độc lập theo vai trò. |
| `src/index.css` | 1.100 | Design system & bảng màu EdTech | Tốt, giữ lại tokens màu sắc. Cần loại bỏ inline styles dư. |
| `src/components/admin/AdminPortal.tsx` | 2.531 | Cổng quản trị tập trung (10 tabs) | God Component — Đã fix scrollbar & banner; cần module hóa. |
| `src/components/admin/AttendanceManager.tsx` | 834 | Quản lý điểm danh QR & GPS | Logic client-side tốt; cần chuyển xác thực QR sang Python API. |
| `src/components/admin/TeacherAssignmentManager.tsx` | 1.230 | Quản lý bài tập & chấm điểm | Cần chuyển lưu trữ file và điểm sang Backend API. |
| `src/components/admin/EarlyWarningDashboard.tsx` | 212 | Bảng cảnh báo học vụ sớm | Thuật toán nhận diện tốt; cần nạp data từ Django Analytics. |
| `src/components/auth/UnifiedAuthGateway.tsx` | 680 | Cổng đăng nhập phân hệ 2 cột | Giao diện chuẩn; cần đổi login call sang `/api/v1/accounts/login/`. |
| `src/components/landing/LandingPage.tsx` | 1.389 | Trang chủ giới thiệu 10 khóa học | Đạt chuẩn thẩm mỹ và thương hiệu PH Digital Education. |
| `src/components/quiz/QuizRunner.tsx` | 720 | Giao diện làm bài thi & chống gian lận | Cần đổi submit bài thi sang `/api/v1/assessments/exams/{id}/submit/`. |
| `src/components/dashboard/StudentOnePageDashboard.tsx` | 640 | Bàn làm việc học viên | Tốt, cần lấy tiến độ từ database thay vì localStorage. |
| `src/hooks/useAuth.ts` | 695 | Mock xác thực & phân quyền client | **P0 VULNERABILITY**: Cần thay bằng ApiAuthContext gọi Django. |
| `src/hooks/use*Storage.ts` | ~1.400 | Quản lý localStorage | Cần chuyển sang API client adapter. |

---

### 2. Phân Hệ Python Backend (`backend/`)

| Ứng dụng Django | Tệp cốt lõi | Chức năng nghiệp vụ | Trạng thái test |
| :--- | :--- | :--- | :---: |
| `apps.accounts` | `models.py`, `views.py`, `serializers.py` | Quản lý người dùng, Argon2/PBKDF2, Session Auth | ✅ Đã test (3/3 pass) |
| `apps.courses` | `models.py`, `views.py`, `serializers.py` | 10 Chương trình đào tạo chuẩn Certiport | ✅ Đã test & seed data |
| `apps.assessments` | `models.py`, `views.py`, `serializers.py` | Ngân hàng đề thi, chấm điểm server-side bảo mật | ✅ Đã test (1/1 pass) |
| `apps.attendance` | `models.py`, `views.py`, `serializers.py` | Ca điểm danh, mã PIN, lưu vết GPS | ✅ Sẵn sàng hoạt động |
| `apps.certificates`| `models.py`, `views.py`, `serializers.py` | Cấp phát chứng chỉ số, tra cứu SHA-256 | ✅ Sẵn sàng hoạt động |
| `apps.assignments` | `models.py` | Bài tập thực hành Word/Excel/PPT & bài nộp | ✅ Schema hoàn tất |
| `apps.analytics` | `models.py` | Cảnh báo học vụ nguy cơ (Early Warning) | ✅ Schema hoàn tất |
| `apps.audit` | `models.py` | Ghi vết nhật ký quản trị & sửa điểm | ✅ Schema hoàn tất |
