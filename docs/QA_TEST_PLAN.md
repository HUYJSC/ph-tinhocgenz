# KẾ HOẠCH KIỂM THỬ TOÀN DIỆN & TIÊU CHÍ CHẤP NHẬN (QA TEST PLAN)
## HỆ THỐNG: PH DIGITAL EDUCATION & TIN HỌC GEN Z
**Phiên bản:** 1.0 (Phase 0 Baseline)  
**Tiêu chuẩn:** Senior QA Automation Engineer & AppSec Tester  

---

## 1. CHIẾN LƯỢC KIỂM THỬ ĐA TẦNG (MULTI-LAYER TEST STRATEGY)

```text
       ┌────────────────────────┐
       │   E2E & Flow Tests     │  (Visitor, Student, Teacher, Admin journeys)
       ├────────────────────────┤
       │ Security & IDOR Tests  │  (Role escalation, session hijack, formula injection)
       ├────────────────────────┤
       │ Responsive & UI Tests  │  (320px, 375px, 390px, 768px, 1024px, 1440px)
       ├────────────────────────┤
       │   API Contract Tests   │  (DRF endpoints, status codes, payload validation)
       ├────────────────────────┤
       │ Component & Unit Tests │  (State transitions, business rules, calculations)
       └────────────────────────┘
```

---

## 2. MA TRẬN TEST CASES CHO CÁC LUỒNG NGHIỆP VỤ CỐT LÕI (CRITICAL FLOWS)

### 2.1. Luồng Xác Thực & Phân Quyền (Authentication & RBAC)
| Mã Test | Kịch bản kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi | Mức độ |
|:---|:---|:---|:---|:---:|
| `TC-AUTH-01` | Đăng nhập học viên hợp lệ | Mã SV: `THGZ01`, Pass chuẩn | Đăng nhập thành công -> Vào Student Dashboard; cookie HttpOnly được gán | P0 |
| `TC-AUTH-02` | Đăng nhập sai mật khẩu | Mã SV: `THGZ01`, Pass sai | Báo lỗi chung "Sai tài khoản hoặc mật khẩu"; không leak sự tồn tại của user | P0 |
| `TC-AUTH-03` | Brute force login | Nhập sai quá 5 lần | Kích hoạt HTTP 429 Rate Limit; khóa tạm thời 15 phút | P1 |
| `TC-RBAC-01` | Học viên cố truy cập `/admin` | Session vai trò `student` | Chặn đứng bằng HTTP 403 Forbidden; chuyển hướng về `/student/dashboard` | P0 |
| `TC-RBAC-02` | Giảng viên cố đổi role trong request | Body: `role: 'admin'` | Backend bỏ qua hoặc trả HTTP 403; không cho phép tự nâng quyền | P0 |
| `TC-RBAC-03` | Sửa IDOR học viên khác | `GET /api/v1/students/102/` | Trả về HTTP 403 / 404 (Không thể xem hồ sơ hoặc bài thi của người khác) | P0 |

### 2.2. Luồng Khảo Thí & Chấm Điểm (Exam & Assessments)
| Mã Test | Kịch bản kiểm thử | Thao tác | Kết quả mong đợi | Mức độ |
|:---|:---|:---|:---|:---:|
| `TC-EXAM-01` | Bắt đầu bài thi tính giờ | Bấm "Vào thi" | Nhận đề thi KHÔNG KÈM ĐÁP ÁN ĐÚNG; đồng hồ server đếm ngược | P0 |
| `TC-EXAM-02` | Rời tab thi (Cheating Detection) | Chuyển tab hoặc thu nhỏ | Ghi nhận sự kiện `visibilitychange`; cảnh báo vi phạm; quá 3 lần tự nộp bài | P1 |
| `TC-EXAM-03` | Mất mạng hoặc tải lại trang | F5 trình duyệt | Khôi phục bài làm từ draft Autosave; không mất các câu đã tích chọn | P1 |
| `TC-EXAM-04` | Sửa điểm đã khóa | `PUT /api/v1/assignments/submissions/{id}/` | Bị từ chối nếu không qua quy trình `GradeRevision` có chữ ký quản trị | P1 |

### 2.3. Luồng Điểm Danh & Lịch Học (Attendance & Schedule)
| Mã Test | Kịch bản kiểm thử | Thao tác | Kết quả mong đợi | Mức độ |
|:---|:---|:---|:---|:---:|
| `TC-ATT-01` | Giảng viên mở ca xoay mã QR | Bấm "Mở ca học" | Mã QR tự động cập nhật token mới mỗi 20 giây | P1 |
| `TC-ATT-02` | Quét mã QR chụp lại cũ | Quét token đã quá 20s | Hệ thống từ chối điểm danh; yêu cầu quét lại mã mới | P1 |

---

## 3. MA TRẬN THIẾT BỊ & KÍCH THƯỚC MÀN HÌNH (RESPONSIVE VIEWPORTS)

Hệ thống phải được kiểm thử đạt chuẩn không có lỗi vỡ giao diện (Zero horizontal overflow) trên các kích thước:
- **Mobile Cực Nhỏ:** 320×568 (iPhone SE cũ)
- **Mobile Tiêu Chuẩn:** 360×800 (Samsung Galaxy), 375×667 (iPhone SE 2020), 390×844 (iPhone 13/14)
- **Mobile Màn Hình Lớn:** 412×915 (Pixel 7), 430×932 (iPhone 14/15 Pro Max)
- **Tablet / iPad:** 768×1024 (iPad Mini), 820×1180 (iPad Air)
- **Laptop / Desktop:** 1024×768, 1280×800, 1366×768 (Phổ biến tại VN), 1440×900, 1920×1080 (Full HD)

---

## 4. TIÊU CHÍ XUẤT XƯỞNG (RELEASE QUALITY GATES)

Tuyệt đối KHÔNG deploy lên môi trường Production nếu vi phạm bất kỳ điều kiện nào sau đây:
1. Có ít nhất 1 lỗi mức **P0 (Blocker)** hoặc **P1 (Critical)** chưa được xử lý.
2. Bộ kiểm thử tự động thất bại (`npm test` hoặc `pytest` có lỗi).
3. Biên dịch TypeScript (`npx tsc --noEmit`) hoặc đóng gói Vite (`npm run build`) gặp lỗi.
4. Phát hiện mật khẩu, mã PIN hoặc Google Meet URLs bị hardcode trong public bundle.
5. Trang quản trị `/admin` có thể truy cập mà không qua xác thực máy chủ.
6. Xuất hiện lỗi cuộn ngang (Horizontal scrollbar) trên các màn hình di động chuẩn.
