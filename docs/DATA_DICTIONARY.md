# TỪ ĐIỂN DỮ LIỆU HỆ THỐNG (DATA DICTIONARY)
**Dự án:** PH Digital Education LMS  
**Hệ quản trị CSDL:** PostgreSQL 16+ / Django ORM  
**Thẩm định:** Senior Data Analyst & Database Architect

---

## 1. BẢNG `accounts_user` (Người Dùng Hệ Thống)

| Tên trường | Kiểu dữ liệu | Nullable | Khóa / Index | Giá trị mặc định | Mô tả nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `UUID` | No | PK | `uuid4()` | Định danh toàn cục của người dùng |
| `username` | `VARCHAR(50)` | No | UNIQUE, INDEX | — | Mã đăng nhập (`THGZ01`, `GV01`, `ADMIN`) |
| `email` | `VARCHAR(255)` | Yes | UNIQUE | NULL | Email liên hệ và nhận thông báo |
| `password` | `VARCHAR(255)` | No | — | — | Mật khẩu đã băm Argon2id / PBKDF2 |
| `full_name` | `VARCHAR(150)` | No | — | — | Họ và tên đầy đủ |
| `phone` | `VARCHAR(20)` | No | — | `""` | Số điện thoại liên hệ |
| `role` | `VARCHAR(20)` | No | INDEX | `'student'` | Vai trò: `student`, `teacher`, `academic`, `admin` |
| `student_code` | `VARCHAR(50)` | No | — | `""` | Mã số học viên chính quy |
| `teacher_code` | `VARCHAR(50)` | No | — | `""` | Mã giảng viên đào tạo |
| `class_code` | `VARCHAR(50)` | No | INDEX | `""` | Mã lớp học đang sinh hoạt |
| `school_or_class`| `VARCHAR(255)`| No | — | `""` | Đơn vị / Trường / Lớp chi tiết |
| `program_track`| `VARCHAR(50)` | No | — | `'office-fast-3in1'` | Phân hệ chương trình đào tạo chính |
| `must_change_password`| `BOOLEAN`| No | — | `False` | Cờ ép buộc đổi mật khẩu lần đầu |
| `is_active` | `BOOLEAN` | No | — | `True` | Trạng thái tài khoản hoạt động |
| `is_staff` | `BOOLEAN` | No | — | `False` | Quyền truy cập giao diện Django Admin |
| `date_joined` | `TIMESTAMPTZ` | No | — | `now()` | Ngày giờ khởi tạo tài khoản |

---

## 2. BẢNG `courses_course` (Chương Trình Đào Tạo)

| Tên trường | Kiểu dữ liệu | Nullable | Khóa / Index | Giá trị mặc định | Mô tả nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(50)` | No | PK | — | Mã slug chương trình (`office-fast-3in1`, `cc-cntt-basic`) |
| `code` | `VARCHAR(30)` | No | UNIQUE, INDEX | — | Ký hiệu mã môn học (`OFFICE-3IN1`, `CC-CNTT-CB`) |
| `title` | `VARCHAR(255)` | No | — | — | Tên khóa học đầy đủ |
| `short_desc` | `TEXT` | No | — | `""` | Mô tả ngắn tóm tắt mục tiêu đào tạo |
| `total_sessions`| `INTEGER` | No | — | `6` | Số buổi học theo chuẩn phân phối chương trình |
| `target_badge`| `VARCHAR(100)`| No | — | `'Certiport'` | Tên chứng nhận / chứng chỉ đầu ra |
| `is_published`| `BOOLEAN` | No | — | `True` | Trạng thái công khai tuyển sinh |
| `order_index` | `INTEGER` | No | — | `0` | Thứ tự ưu tiên hiển thị trên danh mục |

---

## 3. BẢNG `assessments_question` (Ngân Hàng Câu Hỏi)

| Tên trường | Kiểu dữ liệu | Nullable | Khóa / Index | Giá trị mặc định | Mô tả nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `VARCHAR(100)`| No | PK | — | Mã câu hỏi (Ví dụ: `q-word-01`) |
| `course_id` | `VARCHAR(50)` | Yes | FK -> courses | NULL | Khóa học liên kết |
| `skill_id` | `VARCHAR(100)`| No | INDEX | — | Kỹ năng khảo thí (Ví dụ: `excel_vlookup`) |
| `content` | `TEXT` | No | — | — | Nội dung câu hỏi thi |
| `options` | `JSONB` | No | — | `[]` | Danh sách 4 phương án `[{id, text}]` |
| `correct_answer_id`| `VARCHAR(20)`| No | — | — | **BẢO MẬT:** Khóa đáp án đúng (A/B/C/D) |
| `explanation`| `TEXT` | No | — | `""` | Lời giải chi tiết hiển thị sau thi |
| `difficulty` | `VARCHAR(20)` | No | — | `'medium'` | Mức độ: `easy`, `medium`, `hard` |

---

## 4. BẢNG `assessments_examattempt` (Lượt Thi Học Viên)

| Tên trường | Kiểu dữ liệu | Nullable | Khóa / Index | Giá trị mặc định | Mô tả nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `UUID` | No | PK | `uuid4()` | Định danh lượt thi |
| `exam_id` | `VARCHAR(100)`| No | FK -> exams | — | Đề thi thực hiện |
| `student_id` | `UUID` | No | FK -> users | — | Học viên làm bài |
| `started_at` | `TIMESTAMPTZ` | No | — | `now()` | Thời điểm bắt đầu tính giờ |
| `submitted_at`| `TIMESTAMPTZ` | Yes | — | NULL | Thời điểm nộp bài chính thức |
| `score` | `INTEGER` | No | — | `0` | Số câu trả lời chính xác |
| `total_questions`| `INTEGER` | No | — | `0` | Tổng số câu hỏi của bài thi |
| `percentage` | `FLOAT` | No | — | `0.0` | Điểm quy đổi phần trăm (%) |
| `is_passed` | `BOOLEAN` | No | — | `False` | Đạt chuẩn (≥70%) |
| `switch_tab_count`| `INTEGER` | No | — | `0` | Số lần ghi nhận rời màn hình thi |
| `answers_draft`| `JSONB` | No | — | `{}` | Tiến độ lưu nháp câu trả lời |

---

## 5. BẢNG `attendance_session` (Ca Điểm Danh)

| Tên trường | Kiểu dữ liệu | Nullable | Khóa / Index | Giá trị mặc định | Mô tả nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `UUID` | No | PK | `uuid4()` | Mã ca điểm danh |
| `course_id` | `VARCHAR(50)` | No | FK -> courses | — | Môn học diễn ra |
| `teacher_id` | `UUID` | No | FK -> users | — | Giảng viên đứng lớp phụ trách |
| `class_code` | `VARCHAR(50)` | No | INDEX | — | Mã lớp học (Ví dụ: `K26-WE01`) |
| `session_title`| `VARCHAR(255)`| No | — | — | Tên bài học của buổi |
| `session_number`| `INTEGER` | No | — | `1` | Buổi số (1 đến 12) |
| `session_date`| `DATE` | No | INDEX | — | Ngày học |
| `is_open` | `BOOLEAN` | No | — | `True` | Trạng thái mở ca nhận check-in |
| `pin_code` | `VARCHAR(10)` | No | — | `'1234'` | Mã PIN 4 chữ số dự phòng |
| `qr_token` | `VARCHAR(100)`| No | — | `""` | Token mã QR động xoay vòng 20s |

---

## 6. BẢNG `certificates_digitalcertificate` (Chứng Chỉ Điện Tử)

| Tên trường | Kiểu dữ liệu | Nullable | Khóa / Index | Giá trị mặc định | Mô tả nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `UUID` | No | PK | `uuid4()` | Mã bản ghi chứng chỉ |
| `certificate_code`| `VARCHAR(50)`| No | UNIQUE, INDEX | — | Mã tra cứu công khai (`PH-MOS-2026-X89B`) |
| `student_id` | `UUID` | No | FK -> users | — | Học viên được cấp |
| `course_id` | `VARCHAR(50)` | No | FK -> courses | — | Chương trình hoàn thành |
| `final_score` | `FLOAT` | No | — | `0.0` | Điểm thi tốt nghiệp |
| `issued_at` | `TIMESTAMPTZ` | No | — | `now()` | Thời gian cấp chứng chỉ |
| `blockchain_hash`| `VARCHAR(128)`| No | — | `""` | Mã băm SHA-256 đối soát toàn vẹn |
| `is_revoked` | `BOOLEAN` | No | — | `False` | Cờ thu hồi chứng chỉ khi vi phạm |
