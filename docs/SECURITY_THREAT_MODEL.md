# MÔ HÌNH ĐE DỌA AN NINH THÔNG TIN (SECURITY THREAT MODEL)
**Hệ thống:** PH Digital Education LMS  
**Tiêu chuẩn:** OWASP Top 10 (2021) & STRIDE Threat Model  
**Thẩm định:** Senior Security Engineer / AppSec

---

## I. MA TRẬN PHÂN TÍCH ĐE DỌA STRIDE

| Danh mục STRIDE | Nguy cơ tiềm ẩn tại hệ thống cũ | Mức độ rủi ro | Biện pháp giảm thiểu đã áp dụng trong Python Backend |
| :--- | :--- | :---: | :--- |
| **Spoofing (Giả mạo danh tính)** | Học viên tự đổi mã `THGZ01` trong `localStorage` để mạo danh học viên khác. Mật khẩu admin hardcoded `admin@phedu2026`. | 🔴 Critical | • Xóa sạch mật khẩu hardcoded.<br>• Mật khẩu băm Argon2id/PBKDF2.<br>• Session Authentication qua HttpOnly Cookie.<br>• Định danh người dùng lấy từ `request.user` server-side. |
| **Tampering (Can thiệp sửa dữ liệu)** | Sửa điểm thi, tự cấp chứng chỉ hoặc sửa kết quả điểm danh trực tiếp qua DevTools. | 🔴 Critical | • Chuyển toàn bộ logic chấm điểm lên Django Backend.<br>• Khóa đáp án đúng chỉ lưu ở database backend.<br>• Chứng chỉ số gắn mã băm SHA-256 đối soát bất biến. |
| **Repudiation (Chối bỏ trách nhiệm)** | Giảng viên hoặc admin sửa điểm học viên mà không để lại bất kỳ dấu vết nào. | 🟡 High | • Triển khai bảng `apps_audit.AuditLog` ghi nhận Actor, Timestamp, Action, IP Address và Payload chi tiết mọi thay đổi điểm/tài khoản. |
| **Information Disclosure (Lộ lọt thông tin)** | File JavaScript bundle chứa toàn bộ danh sách tài khoản học viên, số điện thoại và mật khẩu mẫu. | 🔴 Critical | • Tách biệt dữ liệu nhạy cảm hoàn toàn khỏi Client bundle.<br>• Client chỉ nhận data qua API có phân quyền và token session hợp lệ. |
| **Denial of Service (Từ chối dịch vụ)** | Quét mã QR liên tục hoặc brute-force mật khẩu làm cạn kiệt tài nguyên. | 🟡 High | • Tích hợp Rate Limiting trên API xác thực (tối đa 5 lần thử/15 phút).<br>• Token QR xoay vòng 20s hạn chế lạm dụng. |
| **Elevation of Privilege (Leo thang đặc quyền)** | Học viên sửa `role: "admin"` trong React state để mở giao diện quản trị. | 🔴 Critical | • Frontend chỉ ẩn/hiện view phục vụ UX.<br>• Mọi endpoint bảo mật đều được kiểm soát bởi Django Permission Classes (`IsTeacherUser`, `IsAdminUser`). |

---

## II. BẢO MẬT API & GIAO DIỆN CHỐNG IDOR (INSECURE DIRECT OBJECT REFERENCE)

1. **Nguyên tắc truy vấn an toàn (Safe Query Scoping):**
   * Endpoint xem bài tập: Học viên chỉ được truy vấn `Submission.objects.filter(student=request.user)`.
   * Endpoint giảng viên: Chỉ xem bài của lớp được phân công `Submission.objects.filter(assignment__course__in=request.user.assigned_courses)`.
2. **Không tin tưởng dữ liệu đầu vào từ Client:**
   * Mọi dữ liệu ID người gửi bài, người chấm, thời gian nộp đều do Server tự động gán từ `request.user` và `timezone.now()`.
