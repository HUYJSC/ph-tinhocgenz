# TÀI LIỆU REST API (OPENAPI SPECIFICATION CATALOG)
## PH DIGITAL EDUCATION — HỆ THỐNG ĐÀO TẠO & KHẢO THÍ

Base URL: `https://hoctructuyen.tinhocgenz.io.vn/api/v1`

Xác thực: Bearer Token trong header `Authorization: Bearer <access_token>`

---

## 1. Phân Hệ Xác Thực & Tài Khoản (`/api/v1/accounts/`)

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/accounts/login/` | `AllowAny` | Đăng nhập tài khoản, nhận JWT token pair |
| `POST` | `/accounts/token/refresh/` | `AllowAny` | Làm mới Access Token qua Refresh Token |
| `GET` | `/accounts/me/` | `IsAuthenticated` | Lấy thông tin cá nhân của người dùng hiện tại |
| `POST` | `/accounts/change-password/`| `IsAuthenticated` | Đổi mật khẩu tài khoản |
| `GET` | `/accounts/users/` | `IsTeacherOrAdmin`| Danh sách người dùng (học viên, giảng viên) |
| `POST` | `/accounts/users/` | `IsAdmin` | Tạo tài khoản mới |
| `DELETE` | `/accounts/users/<id>/` | `IsAdmin` | Xóa mềm tài khoản người dùng (`is_deleted=True`) |

---

## 2. Phân Hệ Khóa Học & Lớp Học (`/api/v1/courses/`)

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/courses/` | `AllowAny` | Danh sách 10 chương trình đào tạo |
| `GET` | `/courses/<id>/` | `AllowAny` | Chi tiết một chương trình đào tạo |
| `GET` | `/courses/api/classes/` | `IsAuthenticated` | Danh sách lớp học thực tế (`ClassGroup`) |
| `POST` | `/courses/api/classes/` | `IsAdmin` | Tạo lớp học mới |
| `POST` | `/courses/api/enrollments/`| `IsTeacherOrAdmin`| Ghi danh học viên vào lớp học |

---

## 3. Phân Hệ Điểm Danh Điện Tử (`/api/v1/attendance/`)

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/attendance/sessions/` | `IsAuthenticated` | Danh sách ca điểm danh mở |
| `POST` | `/attendance/sessions/` | `IsTeacherOrAdmin`| Mở ca điểm danh mới kèm mã PIN & QR |
| `POST` | `/attendance/sessions/<id>/checkin/` | `IsAuthenticated` | Học viên check-in bằng PIN hoặc QR token |
| `GET` | `/attendance/sessions/<id>/records/` | `IsTeacherOrAdmin`| Giảng viên xem danh sách học viên có mặt |

---

## 4. Phân Hệ Bài Tập Thực Hành (`/api/v1/assignments/`)

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/assignments/tasks/` | `IsAuthenticated` | Danh sách bài tập thực hành |
| `POST` | `/assignments/tasks/` | `IsTeacherOrAdmin`| Tạo đề bài tập thực hành mới |
| `POST` | `/assignments/submissions/`| `IsStudent` | Học viên nộp file bài tập (Google Drive / Link) |
| `POST` | `/assignments/submissions/<id>/grade/` | `IsTeacherOrAdmin`| Giảng viên chấm điểm (0-10) và phản hồi |

---

## 5. Phân Hệ Khảo Thí & Thi Thử Certiport (`/api/v1/assessments/`)

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/assessments/exams/` | `AllowAny` | Danh sách đề thi đang mở |
| `GET` | `/assessments/questions/` | `AllowAny` | Ngân hàng câu hỏi trắc nghiệm (ẩn đáp án đúng) |
| `POST` | `/assessments/exams/<id>/submit/` | `IsAuthenticated` | Nộp bài thi, chấm điểm tự động & ghi nhận rời tab |
| `GET` | `/assessments/attempts/` | `IsAuthenticated` | Lịch sử các lần thi thử của học viên |

---

## 6. Phân Hệ Chứng Chỉ Số (`/api/v1/certificates/`)

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/certificates/` | `IsAuthenticated` | Danh sách chứng nhận đã cấp của học viên |
| `GET` | `/certificates/<code_or_hash>/` | `AllowAny` | Tra cứu & xác minh tính toàn vẹn SHA-256 |

---

## 7. Phân Hệ Nhắc Nhở & Cảnh Báo Zalo AI (`/api/v1/analytics/`)

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/analytics/reminders/` | `IsAuthenticated` | Cài đặt chu kỳ nhắc nhở học tập |
| `POST` | `/analytics/reminders/` | `IsAuthenticated` | Cập nhật cài đặt nhận tin Zalo |
| `GET` | `/analytics/warnings/` | `IsTeacherOrAdmin`| Danh sách cảnh báo học vụ nguy cơ vắng/kém |
| `GET` | `/analytics/zalo-logs/` | `IsTeacherOrAdmin`| Nhật ký phát tin Zalo ZNS phân loại độ tuổi |
