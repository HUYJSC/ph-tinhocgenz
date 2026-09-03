# MA TRẬN PHÂN QUYỀN VAI TRÒ VÀ ĐỐI TƯỢNG (ADMIN RBAC & OBJECT PERMISSION MATRIX)
## HỆ THỐNG: PH DIGITAL EDUCATION
**Phiên bản:** 1.0 (Audit Chỉ Đọc - Phase 0)  
**Ngày lập:** 03/09/2026  

---

## 1. MA TRẬN PHÂN QUYỀN CHỨC NĂNG (FEATURE RBAC MATRIX)

| Phân hệ / Chức năng | Học viên (`student`) | Giảng viên (`teacher`) | Giáo vụ (`academic`) | Quản trị (`admin`) | Quản trị cấp cao (`super_admin`) |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Hồ sơ cá nhân** | Xem / Sửa chính mình | Xem / Sửa chính mình | Xem / Sửa chính mình | Theo phân quyền | Toàn quyền |
| **Xem khóa học** | Chỉ khóa đã đăng ký | Chỉ lớp được phân công | Thuộc đơn vị quản lý | Toàn bộ hệ thống | Toàn bộ hệ thống |
| **Xem điểm số** | Chỉ điểm của chính mình | Lớp được phân công | Thuộc đơn vị quản lý | Toàn bộ hệ thống | Toàn bộ hệ thống |
| **Chấm điểm & Nhận xét** | ❌ Không có quyền | Lớp được phân công | Theo nhiệm vụ học vụ | Toàn bộ lớp học | Toàn bộ lớp học |
| **Sửa điểm đã khóa** | ❌ Tuyệt đối cấm | ❌ Không có quyền | Cần cấp trên phê duyệt | Có (Kèm lý do & Audit) | Có (Kèm Audit Log) |
| **Quản lý học viên** | ❌ Không có quyền | Xem danh sách lớp mình dạy | Thêm, sửa, xếp lớp | Toàn quyền (trừ Super) | Toàn quyền |
| **Quản lý giảng viên** | ❌ Không có quyền | ❌ Không có quyền | Xem lịch dạy, phân công | Thêm, sửa tài khoản | Toàn quyền |
| **Quản lý đề thi & câu hỏi** | ❌ Không có quyền | Soạn đề lớp được giao | Soạn & duyệt ngân hàng đề | Toàn quyền | Toàn quyền |
| **Xem đáp án đề thi** | Sau khi nộp (nếu cho phép) | Đề được phân công | Đề thuộc đơn vị quản lý | Toàn bộ đề thi | Toàn bộ đề thi |
| **Cấu hình hệ thống** | ❌ Không có quyền | ❌ Không có quyền | ❌ Không có quyền | Cấu hình giới hạn | Toàn quyền (Secrets, Integrations) |
| **Phân quyền & Cấp vai trò**| ❌ Không có quyền | ❌ Không có quyền | ❌ Không có quyền | Cấp quyền đến Quản trị | Cấp mọi vai trò (kể cả Super Admin) |
| **Quản lý Super Admin** | ❌ Không có quyền | ❌ Không có quyền | ❌ Không có quyền | ❌ Tuyệt đối cấm | Toàn quyền |
| **Nhật ký hệ thống (Audit Log)**| ❌ Không có quyền | ❌ Không có quyền | Xem log lớp học của mình | Xem log vận hành | Xem toàn bộ nhật ký bất biến |

---

## 2. NGUYÊN TẮC KIỂM SOÁT ĐỐI TƯỢNG (OBJECT-LEVEL PERMISSION RULES)

1. **Từ chối mặc định (Deny by Default):** Mọi request không có token/session hợp lệ hoặc không khớp với quyền hạn đều bị chặn ngay tại tầng Middleware/Permission class của Django REST Framework.
2. **Nguồn chân lý thuộc về Cơ sở dữ liệu:** Vai trò của người dùng được truy xuất trực tiếp từ bảng `accounts_user` trên PostgreSQL qua session cookie có cờ `HttpOnly, Secure` hoặc JWT có chữ ký mật mã HMAC SHA256. Tuyệt đối không chấp nhận vai trò được gửi từ payload của client.
3. **Kiểm tra quyền cấp bản ghi (Object-Level Scoping):**
   - Học viên A không thể truy vấn thông tin, bài làm, điểm danh của Học viên B bằng cách thay đổi ID trên URL (ngăn chặn IDOR/BOLA).
   - Giảng viên X chỉ có thể truy xuất và chấm bài của các lớp học có bản ghi phân công trong `ClassGroup.teacher_id = X.id`.
   - Giáo vụ chỉ có thể truy xuất dữ liệu trong phạm vi cơ sở/đơn vị được chỉ định.
4. **Bảo vệ tính toàn vẹn của Điểm số:**
   - Điểm số sau khi đã "Chốt" (`is_locked = True`) sẽ không thể sửa đổi bằng lệnh `PUT` thông thường. Mọi cập nhật phải thông qua quy trình `GradeRevision` ghi rõ: người sửa, điểm cũ, điểm mới, lý do và chữ ký phê duyệt.
5. **Chuẩn hóa phản hồi an ninh:**
   - Chưa đăng nhập: Trả mã `401 Unauthorized` (không trả 200 kèm cờ lỗi).
   - Đăng nhập nhưng không đủ quyền: Trả mã `403 Forbidden`.
   - Tài nguyên không tồn tại hoặc không thuộc quyền xem: Trả mã `404 Not Found` (tránh tiết lộ sự tồn tại của tài nguyên thông qua Enumeration).
