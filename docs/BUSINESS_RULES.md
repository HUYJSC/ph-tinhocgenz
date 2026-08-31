# QUY TẮC NGHIỆP VỤ HỆ THỐNG (BUSINESS RULES SPECIFICATION)
**Nền tảng:** PH Digital Education  
**Phân tích bởi:** Senior Business Analyst (EdTech Domain)  
**Phiên bản:** 1.0

---

## I. NHÓM QUY TẮC XÁC THỰC & PHÂN QUYỀN (AUTHENTICATION & RBAC)

* **BR-AUTH-01 (Định danh tài khoản):** Mỗi tài khoản người dùng chỉ có một mã tài khoản duy nhất (Username / Student Code / Teacher Code). Định dạng: `THGZxx` cho học viên, `GVxx` cho giảng viên, `ADMINxx` cho quản trị.
* **BR-AUTH-02 (Bảo mật mật khẩu):** Mật khẩu người dùng bắt buộc được băm phía server bằng thuật toán Argon2id hoặc PBKDF2/SHA-256. Không chấp nhận lưu mật khẩu dạng bản rõ (plain-text) dưới bất kỳ hình thức nào.
* **BR-AUTH-03 (Bắt buộc đổi mật khẩu):** Mọi tài khoản mới được cấp mã mặc định đều có cờ `must_change_password = True`. Người dùng không thể truy cập các tính năng học tập hoặc giảng dạy cho đến khi đổi mật khẩu mới (tối thiểu 8 ký tự).
* **BR-AUTH-04 (Tách biệt Route & Thẩm quyền):**
  * `/student/*`: Chỉ dành riêng cho vai trò `student`.
  * `/teacher/*`: Dành riêng cho `teacher`. Giảng viên chỉ được xem và chấm bài của các lớp mình phụ trách.
  * `/academic/*`: Dành cho `academic` (giáo vụ) và `admin`.
  * `/admin/*`: Dành riêng cho `admin` (quản trị hệ thống).
  * Truy cập trái thẩm quyền phải bị chặn ở Backend (HTTP 403 Forbidden).

---

## II. NHÓM QUY TẮC ĐIỂM DANH & CHUYÊN CẦN (ATTENDANCE)

* **BR-ATT-01 (Ca điểm danh hợp lệ):** Ca điểm danh chỉ có hiệu lực khi giảng viên phụ trách kích hoạt `is_open = True`.
* **BR-ATT-02 (Xoay vòng mã QR động):** Mã QR điểm danh chứa token ký số HMAC và timestamp có hạn 20 giây do Backend sinh ra. Mã hết hạn hoặc ảnh chụp màn hình chuyển tiếp sẽ bị từ chối tự động.
* **BR-ATT-03 (Bảo vệ tọa độ GPS):** Với các lớp học trực tiếp tại phòng LAB, tọa độ GPS của thiết bị học viên khi quét mã phải nằm trong bán kính tối đa 100m so với tọa độ phòng LAB. Nếu vượt quá, hệ thống đánh dấu cờ `Cần giáo vụ xác minh`.
* **BR-ATT-04 (Xử lý học bù / Điểm danh bù):** Học viên có đơn xin phép được duyệt sẽ được tính trạng thái `EXCUSED` (Có phép) và không bị trừ điểm chuyên cần.

---

## III. NHÓM QUY TẮC KHẢO THÍ & CHẤM ĐIỂM (EXAMINATIONS & GRADING)

* **BR-EXAM-01 (Bảo mật khóa đáp án):** Đáp án đúng (`correct_answer_id`) và giải thích chi tiết của đề thi CHỈ ĐƯỢC LƯU TRÊN SERVER. Client chỉ nhận nội dung câu hỏi và các lựa chọn.
* **BR-EXAM-02 (Chấm điểm Server-side):** Toàn bộ việc tính điểm, tỷ lệ phần trăm và xếp loại đều được thực thi trên Backend Django sau khi học viên nộp bài.
* **BR-EXAM-03 (Giám sát chống gian lận - Anti-Cheat):**
  * Khi học viên chuyển tab hoặc thu nhỏ trình duyệt làm bài thi, sự kiện `visibilitychange` sẽ được ghi nhận và cộng dồn vào `switch_tab_count`.
  * Nếu rời tab quá 3 lần, bài thi sẽ bị tự động thu bài và đánh dấu vi phạm quy chế khảo thí.
* **BR-EXAM-04 (Tiêu chuẩn đạt chuẩn Certiport & PH EDU):**
  * Tỷ lệ đạt chuẩn (Passing Rate) mặc định là **≥ 70%** (hoặc 700/1000 điểm theo chuẩn Certiport MOS/IC3).
  * Học viên đạt kết quả từ 80% trở lên sẽ đủ điều kiện cấp Chứng nhận điện tử.

---

## IV. NHÓM QUY TẮC CẢNH BÁO HỌC VỤ SỚM (EARLY WARNING SYSTEM)

* **BR-WARN-01 (Mức độ nguy cơ):**
  * `CRITICAL` (Báo động đỏ): Vắng mặt ≥ 3 buổi học HOẶC điểm trung bình < 40%.
  * `HIGH` (Nguy cơ cao): Vắng 2 buổi liên tiếp HOẶC nợ từ 2 bài tập thực hành trở lên.
  * `MEDIUM` (Cần lưu ý): Điểm bài tập gần nhất dưới 60%.
* **BR-WARN-02 (Trách nhiệm xử lý):** Hệ thống tự động gửi thông báo cho cả Giảng viên đứng lớp và Giáo vụ phụ trách lớp để liên hệ hỗ trợ học viên trong vòng 24 giờ.

---

## V. NHÓM QUY TẮC CHỨNG CHỈ SỐ & XÁC THỰC CÔNG KHAI (DIGITAL CERTIFICATES)

* **BR-CERT-01 (Mã định danh chứng chỉ):** Mỗi chứng chỉ có một mã duy nhất định dạng: `PH-[MÃ MÔN]-[NĂM]-[MÃ HASH 4 KÝ TỰ]` (Ví dụ: `PH-MOS-2026-X89B`).
* **BR-CERT-02 (Tra cứu công khai):** Bất kỳ ai truy cập đường dẫn `https://hoctructuyen.tinhocgenz.io.vn/verify/<certificate_code>` đều có thể xem chứng chỉ gốc, tên học viên, điểm số và ngày cấp mà không cần đăng nhập.
* **BR-CERT-03 (Mã băm SHA-256):** Chứng chỉ được gắn mã băm cryptographic SHA-256 bất biến. Mọi sự can thiệp sửa đổi tên hay điểm số trên giao diện sẽ làm sai lệch mã băm đối soát.
