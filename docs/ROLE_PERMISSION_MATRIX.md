# MA TRẬN PHÂN QUYỀN VAI TRÒ (ROLE-PERMISSION MATRIX - RBAC)
**Hệ thống:** PH Digital Education  
**Tiêu chuẩn:** Security Architecture (NIST RBAC & OWASP ASVS)  
**Phiên bản:** 1.0

---

## I. ĐỊNH NGHĨA CÁC VAI TRÒ HỆ THỐNG (SYSTEM ROLES)

1. **Học Viên (`ROLE_STUDENT`):**
   * Người học đăng ký các khóa đào tạo Tin học. Chỉ truy cập dữ liệu của chính mình (lớp đã đăng ký, bài tập nộp, kết quả thi, chứng nhận).
2. **Giảng Viên Đứng Lớp (`ROLE_TEACHER`):**
   * Giảng viên trực tiếp phụ trách giảng dạy. Có quyền quản lý ca điểm danh lớp mình dạy, chấm điểm bài tập lớp mình, xem đề thi trong phân hệ phụ trách. Không có quyền sửa tài khoản hay cấu hình hệ thống.
3. **Giáo Vụ Học Vụ (`ROLE_ACADEMIC`):**
   * Nhân sự quản lý đào tạo. Quản lý danh sách khóa học, tạo lớp học (Cohorts), xếp thời khóa biểu, phân công giảng viên đứng lớp, quản lý hồ sơ học viên, xem báo cáo cảnh báo học vụ sớm (Early Warning).
4. **Quản Trị Viên Hệ Thống (`ROLE_ADMIN` / Superadmin):**
   * Quản trị kỹ thuật và phân quyền. Quản lý tài khoản cán bộ, thiết lập phân quyền RBAC, xem Audit Logs, cấu hình tích hợp (Google Drive, Meet Hub, SEO, SMTP, Object Storage).

---

## II. MA TRẬN PHÂN QUYỀN CHI TIẾT (CRUD PERMISSIONS)

| Phân hệ / Tài nguyên | Thao tác (Operation) | Student | Teacher | Academic | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Tài khoản cá nhân** | Đổi mật khẩu, cập nhật profile | ✅ | ✅ | ✅ | ✅ |
| **Quản lý học viên** | Xem danh sách học viên | ❌ | ✅ *(lớp mình)* | ✅ *(toàn trường)* | ✅ |
| | Tạo mới / Chỉnh sửa tài khoản | ❌ | ❌ | ✅ | ✅ |
| | Reset mật khẩu học viên | ❌ | ❌ | ✅ | ✅ |
| **Quản lý giảng viên** | Xem danh sách giảng viên | ❌ | ❌ | ✅ | ✅ |
| | Tạo mới / Phân công giảng viên | ❌ | ❌ | ❌ | ✅ |
| **Khóa học & Chương trình** | Xem danh mục khóa học public | ✅ | ✅ | ✅ | ✅ |
| | Tạo mới / Chỉnh sửa nội dung | ❌ | ❌ | ✅ | ✅ |
| **Lớp học (Cohorts)** | Xem lớp học được phân công | ✅ *(lớp học)* | ✅ *(lớp dạy)* | ✅ *(tất cả)* | ✅ |
| | Tạo lớp học, gán giảng viên | ❌ | ❌ | ✅ | ✅ |
| **Lịch dạy & Phòng học** | Xem lịch học / lịch dạy | ✅ *(lớp học)* | ✅ *(lớp dạy)* | ✅ | ✅ |
| | Xếp lịch, đổi phòng, đổi link Meet | ❌ | ❌ | ✅ | ✅ |
| **Điểm danh (Attendance)** | Quét QR / Check-in buổi học | ✅ | ❌ | ❌ | ❌ |
| | Mở ca, xoay QR, điểm danh bù | ❌ | ✅ *(lớp dạy)* | ✅ | ✅ |
| **Ngân hàng câu hỏi & Đề** | Xem câu hỏi đề thi | ❌ | ✅ *(môn dạy)* | ✅ | ✅ |
| | Soạn câu hỏi mới, xuất bản đề | ❌ | ✅ *(môn dạy)* | ✅ | ✅ |
| **Làm bài thi (Assessment)**| Thi thử / Khảo thí chính thức | ✅ | ❌ | ❌ | ❌ |
| | Xem bài làm của học viên | ✅ *(của mình)* | ✅ *(lớp dạy)* | ✅ | ✅ |
| **Chấm điểm & Bài tập** | Nộp bài tập thực hành | ✅ | ❌ | ❌ | ❌ |
| | Chấm điểm, nhận xét bài nộp | ❌ | ✅ *(lớp dạy)* | ✅ | ✅ |
| **Cảnh báo học vụ (Risk)** | Nhận thông báo nhắc nhở | ✅ | ❌ | ❌ | ❌ |
| | Xem Dashboard học viên nguy cơ | ❌ | ✅ *(lớp dạy)* | ✅ | ✅ |
| **Chứng chỉ số (Certificate)**| Nhận chứng chỉ của mình | ✅ | ❌ | ❌ | ❌ |
| | Cấp phát / Thu hồi chứng chỉ | ❌ | ❌ | ✅ | ✅ |
| | Tra cứu công khai (`/verify/`) | ✅ *(public)* | ✅ *(public)* | ✅ *(public)* | ✅ *(public)* |
| **Cấu hình hệ thống & SEO** | Google Meet Hub, SEO, GSC | ❌ | ❌ | ❌ | ✅ |
| **Nhật ký Audit Logs** | Xem lịch sử thao tác hệ thống | ❌ | ❌ | ❌ | ✅ |

---

## III. QUY TẮC BẢO VỆ CHỐNG TRUY CẬP TRÁI PHÉP (SECURITY GUARDS)

1. **Chống IDOR (Insecure Direct Object Reference):**
   * Mọi truy vấn lấy điểm thi, bài nộp, hay chứng chỉ phải được lọc theo `request.user.id` nếu người dùng là Student.
   * Giảng viên chỉ có quyền truy xuất bài nộp của học viên thuộc các lớp mà giảng viên đó được phân công trong `ClassAssignment`.
2. **Không phân quyền tại Frontend:**
   * Frontend chỉ ẩn/hiện nút bấm phục vụ UX.
   * Toàn bộ API Backend (Django DRF / Views) bắt buộc gắn decorator kiểm tra quyền:
     * `@permission_classes([IsAuthenticated, IsTeacherUser])`
     * `@permission_classes([IsAuthenticated, IsAcademicStaff])`
     * `@permission_classes([IsAuthenticated, IsSuperAdminUser])`
