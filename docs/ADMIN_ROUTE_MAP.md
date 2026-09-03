# BẢN ĐỒ ROUTE VÀ KIỂM SOÁT TRUY CẬP (ADMIN ROUTE MAP)
## HỆ THỐNG: PH DIGITAL EDUCATION
**Phiên bản:** 1.0 (Audit Chỉ Đọc - Phase 0)  
**Ngày lập:** 03/09/2026  

---

## 1. BẢNG TỔNG HỢP ROUTE TOÀN HỆ THỐNG

| Tuyến đường (Route) | Cấp độ truy cập | Vai trò được phép (Roles) | Cơ chế kiểm soát (Middleware / Guard) | HTTP Method | Dữ liệu Đọc / Ghi | Đánh dấu Noindex? | Chính sách Cache | Ghi nhận Audit Log? |
|:---|:---:|:---|:---|:---:|:---|:---:|:---|:---:|
| `/` | Public | Mọi đối tượng (Guest, Học viên, Giảng viên) | SPA Router (`App.tsx`) | GET | Đọc: Khóa học, bài mẫu, feedback, tin tức công khai | Không (Index, Follow) | Public CDN Cache (1 năm cho static assets) | Không |
| `/login` | Public | Mọi đối tượng chưa đăng nhập | `UnifiedAuthGateway.tsx` | POST / GET | Đọc: Form đăng nhập, danh mục môn học. Ghi: Phiên xác thực | Có (`noindex, nofollow`) | `no-store, private` | Có (Ghi nhận `LoginAttempt`) |
| `/student` | Private | Học viên (`student`), Quản trị (`admin`) | Client Guard (`App.tsx` dòng 220) | GET / POST | Đọc: Khóa học, điểm, lịch học, bài tập. Ghi: Nộp bài, điểm danh | Có (`noindex, nofollow`) | `no-store, private` | Có (Học vụ) |
| `/student/dashboard` | Private | Học viên (`student`) | Client Guard | GET | Đọc: Tiến độ, lộ trình, việc cần làm hôm nay | Có | `no-store, private` | Không |
| `/student/attendance`| Private | Học viên (`student`) | Client Guard | GET / POST | Đọc: Lịch sử điểm danh. Ghi: Mã QR Check-in, nhập PIN | Có | `no-store, private` | Có |
| `/student/assignments`| Private | Học viên (`student`) | Client Guard | GET / POST | Đọc: Danh sách bài tập. Ghi: Nộp file Google Drive | Có | `no-store, private` | Có |
| `/student/quiz` | Private | Học viên (`student`) | Client Guard | GET / POST | Đọc: Đề thi, câu hỏi. Ghi: Kết quả thi, autosave | Có | `no-store, private` | Có |
| `/teacher` | Private | Giảng viên (`teacher`), Quản trị (`admin`) | Staff Guard (`App.tsx` dòng 228) | GET / POST | Đọc: Lớp phụ trách, bài chờ chấm. Ghi: Chấm bài, mở ca | Có (`noindex, nofollow`) | `no-store, private` | Có |
| `/teacher/attendance`| Private | Giảng viên (`teacher`), Quản trị (`admin`) | Staff Guard | GET / POST / PUT | Đọc: Danh sách lớp. Ghi: Tạo ca, xoay mã QR, chốt điểm danh | Có | `no-store, private` | Có |
| `/teacher/grading` | Private | Giảng viên (`teacher`), Quản trị (`admin`) | Staff Guard | GET / POST / PUT | Đọc: Bài nộp. Ghi: Nhập điểm, feedback, khóa điểm | Có | `no-store, private` | Có (Bắt buộc) |
| `/academic` | Private | Giáo vụ (`academic`), Quản trị (`admin`) | Backend Permission `IsAcademicOrAdmin` | GET / POST / PUT | Đọc: Toàn bộ danh sách lớp, cảnh báo. Ghi: Xếp lịch, duyệt | Có (`noindex, nofollow`) | `no-store, private` | Có (Bắt buộc) |
| `/admin` | Phân quyền cao cấp | Quản trị viên (`admin`), Super Admin | `StandaloneAdminApp.tsx` / `AdminPortal.tsx` | GET / POST / PUT / DELETE | Đọc: Toàn bộ hệ thống, KPI, tài khoản. Ghi: Cấu hình, phân quyền | Có (`noindex, nofollow`) | `no-store, private, must-revalidate` | Có (Bất biến) |
| `/admin/users` | Phân quyền cao cấp | Quản trị viên (`admin`), Super Admin | Backend Permission `IsAdmin` | GET / POST / PUT / DELETE | Đọc: Danh sách người dùng. Ghi: Thêm, sửa, khóa, xóa mềm | Có | `no-store, private` | Có |
| `/admin/courses` | Phân quyền cao cấp | Quản trị viên (`admin`), Super Admin | Backend Permission `IsAdmin` | GET / POST / PUT / DELETE | Đọc: Danh mục môn. Ghi: Thêm phiên bản, sửa cấu trúc | Có | `no-store, private` | Có |
| `/admin/zalo` | Phân quyền cao cấp | Quản trị viên (`admin`), Super Admin | Backend Permission `IsAdmin` | GET / POST | Đọc: Lịch sử tin nhắn. Ghi: Gửi tin thông báo ZNS tự động | Có | `no-store, private` | Có |
| `/admin/settings` | Độc quyền | Chỉ Super Admin (`super_admin`) | Backend Permission `IsSuperAdmin` | GET / POST / PUT | Đọc: Biến hệ thống, tích hợp. Ghi: Đổi secret, bảo mật | Có | `no-store, private` | Có (Cấp độ khẩn) |
| `/api/v1/accounts/*` | API (Token/Session) | Theo endpoint chi tiết | DRF `JWTAuthentication`, `SessionAuthentication` | ALL | Đọc/Ghi: Dữ liệu tài khoản, phân quyền, đăng nhập | N/A (JSON API) | `no-store, private` | Có |
| `/api/v1/courses/*` | API (Token/Session) | Phân tầng theo RBAC | DRF `IsAuthenticatedOrReadOnly` / `IsAdmin` | GET / POST / PUT | Đọc: Khóa học, bài học. Ghi: Cập nhật nội dung | N/A | `no-store, private` | Có |
| `/api/v1/assessments/*`| API | Giảng viên, Giáo vụ, Quản trị | DRF `IsTeacherOrAdmin` | GET / POST / PUT | Đọc: Đề thi, đáp án. Ghi: Chấm bài, cập nhật câu hỏi | N/A | `no-store, private` | Có |
| `/api/v1/attendance/*` | API | Phân tầng theo lớp được giao | DRF `IsTeacherOrAdmin` | GET / POST / PUT | Đọc: Danh sách điểm danh. Ghi: Bản ghi điểm danh | N/A | `no-store, private` | Có |
| `/verify/:id` | Public | Mọi đối tượng xác thực chứng nhận | `CertificateVerificationModal.tsx` | GET | Đọc: Thông tin chứng nhận số, mã định danh, người cấp | Không (Hỗ trợ xác minh) | Public Cache (1 ngày) | Có |

---

## 2. KHIẾM KHUYẾT BẢO MẬT ĐƯỢC PHÁT HIỆN TẠI TẦNG ROUTING

1. **Client-side Routing Bypass:** Tuyến đường `/admin` và `/teacher` chỉ được bảo vệ bởi React state (`isSessionActive && isStaff`). Người dùng có thể sửa biến trong React DevTools hoặc chỉnh sửa `localStorage.setItem('phtinhocgenz_auth_user_v11', ...)` để vượt qua màn hình kiểm tra.
2. **Kế thừa thẻ Meta Robots:** Do toàn bộ SPA được tải qua `index.html` duy nhất, bot tìm kiếm khi cào đường dẫn `/admin` có thể đọc thấy thẻ `<meta name="robots" content="index, follow">`. Dù `vercel.json` có cấu hình header `X-Robots-Tag: noindex`, thẻ trong DOM vẫn là rủi ro tiềm tàng.
3. **Thiếu Endpoint Giáo Vụ Riêng Biệt:** Chưa có route riêng biệt phân quyền cho Giáo vụ (`/academic`), hiện tại Giáo vụ bị gộp chung vào giao diện Giảng viên hoặc Quản trị viên.
