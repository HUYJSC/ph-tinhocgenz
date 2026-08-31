# DANH SÁCH THÀNH PHẦN CẦN LOẠI BỎ & THAY THẾ (REMOVAL CANDIDATES)
**Dự án:** PH Digital Education  
**Tiêu chuẩn rà soát:** Không xóa bừa bãi — Phải kiểm tra dependency, migration an toàn và có rollback.

---

## I. CÁC THÀNH PHẦN BẢO MẬT NGUY HIỂM CẦN LOẠI BỎ TRIỆT ĐỂ (P0)

1. **Mật khẩu Hardcoded trong `src/hooks/useAuth.ts`:**
   * Dòng 390: `const isAdminPass = cleanPin === 'admin@phedu2026' || cleanPin === 'admin123';`
   * Toàn bộ danh sách `INITIAL_STUDENT_ACCOUNTS` và `INITIAL_TEACHER_ACCOUNTS` chứa password plain-text `'123'`.
   * **Phương án thay thế:** Đã seed vào Django backend qua `backend/scripts/migrate_legacy_data.py` với mật khẩu băm chuẩn; loại bỏ việc lưu password trong bundle frontend.

2. **Lưu trữ phiên và dữ liệu điểm trong `localStorage`:**
   * Các khóa: `phtinhocgenz_auth_user_v11`, `phtinhocgenz_student_accounts_v11`, `phtgz_assignments_v4`, `phtgz_attendance_sessions_v1`.
   * **Phương án thay thế:** Thay thế bằng API endpoints Django với HttpOnly Cookie Session.

---

## II. CÁC TỆP PROXY & TÀI SẢN TĨNH DƯ THỪA (P1 / P2)

1. **Các tệp proxy re-export cũ:**
   * `src/components/teacher/EarlyWarningDashboard.tsx` ➔ Re-export tới `src/components/admin/EarlyWarningDashboard.tsx`.
   * `src/components/teacher/TeacherAcademicPortal.tsx` ➔ Re-export tới `src/components/admin/TeacherAcademicPortal.tsx`.
   * `src/components/attendance/AttendanceManager.tsx` ➔ Re-export tới `src/components/admin/AttendanceManager.tsx`.
   * `src/components/assignment/TeacherAssignmentManager.tsx` ➔ Re-export tới `src/components/admin/TeacherAssignmentManager.tsx`.
   * **Quyết định:** Giữ tạm thời cho backward compatibility; sẽ chuyển đổi toàn bộ import sang import trực tiếp và xóa các tệp này ở Phase dọn dẹp.

2. **Tài sản hình ảnh kích thước lớn trong `public/`:**
   * `public/Logo-ngang.png` (882 kB)
   * `public/Logo-v.png` (940 kB)
   * `public/logo-wide.png` (882 kB)
   * **Quyết định:** Nén chuyển sang định dạng WebP/AVIF tối ưu (giảm 85% dung lượng tải trang).

3. **Banner sao chép link `/admin` trong `AdminPortal.tsx`:**
   * **ĐÃ LOẠI BỎ:** Đã gỡ bỏ hoàn toàn khỏi dashboard trong bản cập nhật vừa qua.
