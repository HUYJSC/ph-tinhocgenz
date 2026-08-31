# PRODUCT BACKLOG — PH DIGITAL EDUCATION (LMS & KHẢO THÍ HỌC VỤ)
**Tiêu chuẩn tài liệu:** Senior Business Analyst (Agile/Scrum User Story Mapping)  
**Phiên bản:** 1.0  
**Ngày cập nhật:** 31/08/2026

---

## I. DANH SÁCH CÁC EPIC CHÍNH (EPIC OVERVIEW)

| Mã Epic | Tên Epic | Phân hệ phụ trách | Mục tiêu nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **EPIC-01** | Quản lý Tài khoản & Phân quyền RBAC | `apps/accounts` | Xác thực người dùng, bảo mật mật khẩu Argon2id, phân chia 4 vai trò rõ rệt (Student, Teacher, Academic, Admin), MFA. |
| **EPIC-02** | Quản lý Khóa học & Chương trình đào tạo | `apps/courses` | Quản lý 10 chương trình Tin học (MOS, IC3 GS6, CNTT Cơ bản & Nâng cao, AI Văn phòng), modules và bài học. |
| **EPIC-03** | Quản lý Lớp học & Thời khóa biểu | `apps/classes`, `apps/schedules` | Quản lý cohorts, xếp lịch dạy, phân công giảng viên, bảo mật URL phòng học Google Meet theo ca. |
| **EPIC-04** | Điểm danh Thông minh & Giám sát lớp học | `apps/attendance` | Điểm danh tự động qua QR động (xoay vòng token 15-30s server-side), đối chiếu định vị GPS, phê duyệt học bù. |
| **EPIC-05** | Ngân hàng Câu hỏi & Khảo thí Trực tuyến | `apps/question_banks`, `apps/assessments` | Soạn đề thi trắc nghiệm & thực hành, giám sát chống gian lận (cheat detection), tự động chấm điểm tức thời. |
| **EPIC-06** | Quản lý Bài tập Thực hành & Nộp bài | `apps/assignments`, `apps/grading` | Giao bài tập Word/Excel/PowerPoint, nộp file an toàn qua S3/Drive private, phân quyền chấm điểm và phản hồi. |
| **EPIC-07** | Phân tích Học tập & Cảnh báo Học vụ Sớm | `apps/analytics` | Radar chẩn đoán năng lực, phát hiện học viên có nguy cơ bỏ học (Critical/High Risk), To-Do Hub cho học viên. |
| **EPIC-08** | Cấp Chứng chỉ Số & Xác thực Blockchain | `apps/certificates` | Tự động phát hành chứng chỉ điện tử đạt chuẩn (≥80%), tra cứu công khai qua `/verify/<cert_code>`. |
| **EPIC-09** | Audit Logging & Nhật ký Hệ thống | `apps/audit` | Ghi nhận bất biến mọi thay đổi điểm số, sửa tài khoản, truy cập quản trị. |

---

## II. CHI TIẾT USER STORIES & TIÊU CHÍ CHẤP NHẬN (ACCEPTANCE CRITERIA)

### EPIC-01: TÀI KHOẢN & PHÂN QUYỀN (ACCOUNTS & RBAC)

#### US-01.1: Đăng nhập Cổng Thống Nhất & Tách Biệt Vai Trò
* **Mô tả:** Là người dùng (Học viên / Giảng viên / Giáo vụ / Quản trị), tôi muốn đăng nhập bằng mã tài khoản và mật khẩu để truy cập đúng cổng chức năng của mình.
* **Business Rules:**
  * BR-01: Mật khẩu bắt buộc được băm bằng thuật toán Argon2id hoặc PBKDF2/SHA-256. Không lưu plain-text.
  * BR-02: Sau khi đăng nhập thành công:
    * `role == 'student'` ➔ chuyển hướng tới `/student/dashboard`.
    * `role == 'teacher'` ➔ chuyển hướng tới `/teacher/dashboard`.
    * `role == 'academic'` ➔ chuyển hướng tới `/academic/dashboard`.
    * `role == 'admin'` ➔ chuyển hướng tới `/admin/dashboard`.
  * BR-03: Session được lưu trữ trong HttpOnly, Secure, SameSite Cookie. Không lưu JWT hoặc secret trong `localStorage`.
* **Acceptance Criteria:**
  * `AC-01.1.1`: Nhập sai thông tin quá 5 lần trong 15 phút sẽ kích hoạt Rate Limit (HTTP 429).
  * `AC-01.1.2`: Người dùng vai trò Student không thể truy cập bất kỳ route nào thuộc `/teacher/*`, `/academic/*`, hoặc `/admin/*` (HTTP 403 Forbidden).
  * `AC-01.1.3`: F5 trang hoặc mở tab mới vẫn duy trì phiên làm việc đúng với vai trò.

#### US-01.2: Bắt Buộc Đổi Mật Khẩu Lần Đầu
* **Mô tả:** Là học viên hoặc giảng viên mới nhận tài khoản mặc định, tôi bắt buộc phải đổi mật khẩu an toàn trong lần đăng nhập đầu tiên.
* **Acceptance Criteria:**
  * `AC-01.2.1`: Nếu cờ `must_change_password = True`, mọi request đến các tính năng học tập sẽ bị chặn và chuyển về `/auth/change-password`.
  * `AC-01.2.2`: Mật khẩu mới phải có độ dài tối thiểu 8 ký tự, không được trùng mật khẩu mặc định.

---

### EPIC-04: ĐIỂM DANH THÔNG MINH (ATTENDANCE MANAGEMENT)

#### US-04.1: Giảng Viên Mở Ca Điểm Danh & Xoay Mã QR Động
* **Mô tả:** Là giảng viên đứng lớp, tôi muốn kích hoạt ca điểm danh tạo mã QR động xoay vòng mỗi 20 giây để học viên trong lớp quét mã điểm danh.
* **Business Rules:**
  * BR-04: Mã QR chứa token ký số HMAC kết hợp timestamp hết hạn do Backend sinh ra. Ảnh chụp màn hình QR cũ sẽ bị từ chối khi hết hạn.
  * BR-05: Toạ độ GPS của học viên khi quét mã phải nằm trong bán kính cho phép (ví dụ 100m) so với phòng LAB nếu lớp học offline.
* **Acceptance Criteria:**
  * `AC-04.1.1`: Giảng viên chọn lớp học ➔ Nhấn "Bắt đầu điểm danh" ➔ Backend tạo `AttendanceSession` với `is_open = True`.
  * `AC-04.1.2`: Mỗi 20 giây, client giảng viên nhận token mới qua WebSocket/Server-Sent Events hoặc polling có chữ ký.
  * `AC-04.1.3`: Danh sách học viên có mặt hiển thị thời gian thực (Real-time update).

---

### EPIC-05: NGÂN HÀNG CÂU HỎI & KHẢO THÍ TRỰC TUYẾN (ASSESSMENTS)

#### US-05.1: Học Viên Làm Bài Thi & Giám Sát Rời Màn Hình
* **Mô tả:** Là học viên, tôi muốn làm bài thi trắc nghiệm tính giờ với cơ chế tự động lưu bài (Autosave) và cảnh báo khi rời tab thi.
* **Business Rules:**
  * BR-06: Thời gian thi được quản lý bằng server-timestamp (tránh gian lận chỉnh đồng hồ client).
  * BR-07: Khi bài nộp gửi lên, Backend tự động chấm điểm dựa trên khóa đáp án bảo mật (không gửi đáp án đúng về frontend trước khi thi xong).
* **Acceptance Criteria:**
  * `AC-05.1.1`: Mỗi câu trả lời được tự động lưu tạm (Autosave draft) sau 5 giây hoặc ngay khi chọn đáp án.
  * `AC-05.1.2`: Sự kiện `visibilitychange` (rời tab thi) được ghi nhận vào `ExamAttempt.switch_tab_count`. Quá 3 lần sẽ tự động khóa và nộp bài.
  * `AC-05.1.3`: Kết quả thi trả về điểm số, tỷ lệ phần trăm và danh mục kỹ năng cần cải thiện (Weak Skills).

---

### EPIC-08: CẤP PHÁT & XÁC THỰC CHỨNG CHỈ SỐ (CERTIFICATES)

#### US-08.1: Tự Động Cấp Chứng Chỉ & Tra Cứu Công Khai
* **Mô tả:** Là học viên đạt kết quả thi ≥80%, tôi muốn nhận được chứng chỉ số có mã QR để chia sẻ lên CV và nộp xét chuẩn đầu ra.
* **Acceptance Criteria:**
  * `AC-08.1.1`: Khi hoàn thành bài thi với điểm ≥80%, Backend tự động sinh bản ghi `DigitalCertificate` với mã hash duy nhất (UUID/Nanoid).
  * `AC-08.1.2`: Người tuyển dụng hoặc nhà trường truy cập `https://hoctructuyen.tinhocgenz.io.vn/verify/<certificate_code>` để xem chứng chỉ chính thức không cần đăng nhập.
