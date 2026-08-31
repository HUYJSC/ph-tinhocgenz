# BÁO CÁO KIỂM TRA TOÀN DIỆN (COMPREHENSIVE AUDIT REPORT)
## DỰ ÁN: PH DIGITAL EDUCATION (HỆ THỐNG LMS & KHẢO THÍ HỌC VỤ)
**Phiên bản kiểm toán:** 1.0 (Phase 0 Baseline)  
**Ngày thực hiện:** 31/08/2026  
**Đơn vị thẩm định:** Senior EdTech Product & Architecture Audit Team (BA, DA, Backend, SecOps, TechLead, QA)

---

## I. TỔNG QUAN HIỆN TRẠNG HỆ THỐNG

### 1. Thông tin triển khai & Môi trường hiện tại
* **Website Production:** `https://hoctructuyen.tinhocgenz.io.vn/`
* **Cổng quản trị:** `https://hoctructuyen.tinhocgenz.io.vn/admin`
* **Vercel Deployment:** `https://eduquest-study-app-dinhhuy05707.vercel.app`
* **Mã nguồn Git:** `https://github.com/HUYJSC/ph-tinhocgenz.git` (Branch: `main`, Commit: `1d7a24c`)
* **Hạ tầng máy chủ hiện tại:** Serverless Static Hosting trên Vercel, client-side routing thông qua SPA rewrites (`vercel.json`).

### 2. Stack công nghệ hiện tại
* **Frontend Core:** React 18.3.1, TypeScript 5.5.3, Vite 5.4.21.
* **Styling & UI:** CSS thuần (`src/index.css`), Inline styles phong cách CSS-in-JS thô, thư viện icons `lucide-react` (1.16.0), hiệu ứng `canvas-confetti`, quét QR bằng `html5-qrcode`.
* **Backend:** **CHƯA CÓ BACKEND SERVER THỰC SỰ.**
* **Database:** **CHƯA CÓ DATABASE SERVER.** Toàn bộ thực thể (tài khoản, bài tập, chấm điểm, buổi điểm danh, tiến độ học, ngân hàng đề thi) được lưu trữ hoàn toàn trong `localStorage` trình duyệt người dùng.
* **Xác thực & Phân quyền:** Client-side mock state trong hook `useAuth.ts`, so sánh mật khẩu plain-text hardcoded.

### 3. Entry Points & Build Commands
* **Web Entry Point:** `index.html` ➔ `src/main.tsx` ➔ `src/App.tsx`.
* **Lệnh kiểm thử hiện tại:** `npm test` (thực thi `node tests/run-tests.mjs`).
* **Lệnh kiểm tra kiểu:** `npx tsc --noEmit`.
* **Lệnh build production:** `npm run build` (`tsc && vite build`).

---

## II. KẾT QUẢ ĐO LƯỜNG BASELINE THỰC TẾ

| Công cụ kiểm tra | Lệnh thực thi | Trạng thái | Chi tiết kết quả thực tế |
| :--- | :--- | :---: | :--- |
| **Git Status** | `git status` | PASS | Working tree clean, branch `main` đồng bộ với `origin/main`. |
| **Git History** | `git log -n 10 --oneline` | PASS | Ghi nhận 10 commits gần nhất về UI, router `/admin` và branding. |
| **Kiểm thử tự động** | `npm test` | PASS | **36/36 test cases đạt chuẩn (100%)** (Kiểm tra tệp tồn tại, timer format, track list, mock form). |
| **TypeScript Typecheck**| `npx tsc --noEmit` | PASS | **0 compile errors** (Toàn bộ kiểu dữ liệu TS hiện tại biên dịch sạch). |
| **Vite Production Build**| `npm run build` | PASS | Bundle xuất ra `dist/index.html` (6.15 kB) và 6 file assets chunks (tổng ~1.14 MB). Cảnh báo chunk `index.js` vượt 600 kB do gộp toàn bộ code. |
| **HTTP Live Check** | `GET https://hoctructuyen.tinhocgenz.io.vn/admin` | PASS (200 OK) | Trả về HTML bundle và tự động kích hoạt SPA handler cho `/admin`. |

---

## III. ĐỐI CHIẾU GIAO DIỆN `/admin` & VẤN ĐỀ UI/UX CỐT LÕI

Dựa trên việc kiểm tra trực tiếp mã nguồn `src/components/admin/AdminPortal.tsx`, `TeacherAcademicHeader.tsx`, và đối chiếu các điểm bất cập trên giao diện `/admin`:

### 1. Trộn lẫn vai trò người dùng (Mixed Roles & Responsibility)
* **Hiện trạng:** Header hiển thị cùng lúc `"GIẢNG VIÊN / QUẢN TRỊ"` kèm badge `🔒 /admin`. Hồ sơ cá nhân người dùng hiển thị `"Thầy Huy (Giảng Viên Trưởng)"` nhưng vai trò hệ thống lại có full quyền superadmin (quản lý phân quyền, cấu hình SEO, Meet Hub, tài khoản giảng viên khác).
* **Hậu quả:** Giảng viên đứng lớp bị phân tâm bởi các tính năng hệ thống kỹ thuật (SEO, GSC, Blockchain); ngược lại nhân viên giáo vụ hoặc admin kỹ thuật lại bị trộn lẫn với lịch dạy và chấm bài nộp.
* **Yêu cầu khắc phục:** Tách bạch 4 phân hệ riêng biệt với URL độc lập:
  * `/teacher`: Bàn làm việc giảng viên (Lớp phụ trách, Lịch dạy, Chấm điểm bài tập, Điểm danh lớp).
  * `/academic`: Nghiệp vụ giáo vụ (Quản lý khóa học, xếp lịch, phân công giảng viên, danh sách học viên, hồ sơ học vụ).
  * `/admin`: Quản trị hệ thống (Phân quyền RBAC, audit log, cấu hình bảo mật, tích hợp hệ thống).
  * `/student`: Cổng học tập học viên.

### 2. Thanh tab bị tràn ngang trên Desktop (Horizontal Scrollbar)
* **Hiện trạng:** Tại dòng 620 của `AdminPortal.tsx`, thanh điều hướng sử dụng thẻ `<div className="horizontal-scroll">` chứa 10 tabs với tiêu đề rất dài kèm emoji: `"Lịch Dạy & Phòng Học (10) 📅"`, `"Khảo Thí & Chấm Điểm (1) ✍️"`, `"Cảnh Báo Học Vụ Sớm 🚨"`, `"Tổng Đài Google Meet (10 Lớp) 🎥"`, `"Cấu Hình SEO 🚀"`.
* **Hậu quả:** Trên màn hình Desktop (1366x768, 1440x900 và 1920x1080), thanh tab bị tràn bề ngang, sinh ra horizontal scrollbar xấu xí làm che một phần nội dung và bắt người dùng phải cuộn ngang để tìm tab.
* **Yêu cầu khắc phục:** 
  * Loại bỏ thuộc tính scrollbar ngang trên desktop.
  * Tinh gọn tên tab (loại bỏ emoji khỏi nhãn chính, chuyển số đếm sang badge nhỏ dạng `<span class="badge">10</span>`).
  * Tổ chức lại menu điều hướng theo Sidebar hoặc Segmented Navbar đa tầng chuẩn mực.

### 3. Banner sao chép link `/admin` dư thừa
* **Hiện trạng:** Banner màu xanh chiếm diện tích lớn với nội dung `"CỔNG QUẢN TRỊ TRỰC TIẾP CHÍNH THỨC"` kèm nút `"Sao chép link /admin"`.
* **Hậu quả:** Chiếm dụng không gian hiển thị thông tin quý giá phía trên màn hình làm việc (Above the fold), mang tính chất trình diễn và gây hiểu lầm `/admin` là một liên kết bảo mật bí mật thay vì quản lý qua phiên đăng nhập được cấp quyền.
* **Yêu cầu khắc phục:** Loại bỏ hoàn toàn banner này khỏi giao diện làm việc chính.

### 4. Mật độ thông tin, khoảng trắng & KPI thiếu ngữ nghĩa
* **Các thẻ KPI hiện tại:** `Tổng Số Học Viên`, `Kho Đề Thi Phân Hệ`, `Tỷ Lệ Đạt Chuẩn (≥70%)`, `Điểm TB`.
* **Hạn chế:**
  * Không có bộ lọc mốc thời gian (Hôm nay, Tuần này, Tháng này, Toàn khóa).
  * Không gắn với lớp học/khóa học cụ thể (chỉ tính trung bình mộc trên toàn bộ lịch sử trong localStorage).
  * Khi chưa có dữ liệu làm bài thi, hệ thống để mặc định `0%` mà không có chú thích giải thích ngữ cảnh (Empty state).
* **Yêu cầu khắc phục:** Chuẩn hóa data model cho KPI, bổ sung bộ lọc thời gian, tỷ lệ biến thiên so với kỳ trước, và hỗ trợ drill-down vào danh sách chi tiết.

### 5. Biểu tượng (Iconography) và Ngôn ngữ giao diện thiếu đồng nhất
* Đang dùng lẫn lộn giữa emoji màu mè (`📅`, `✍️`, `🚨`, `🎥`, `🚀`) và SVG vector icons (`lucide-react`).
* Kiểu chữ viết hoa không đồng nhất: lúc Title Case, lúc Viết hoa chữ cái đầu, lúc in hoa toàn bộ.
* **Yêu cầu khắc phục:** Bỏ toàn bộ emoji trong nhãn nghiệp vụ, quy chuẩn 100% về Lucide Icons đồng nhất kích thước (16px/18px) và chuẩn hóa kiểu chữ tiếng Việt.

---

## IV. PHÂN LOẠI LỖI & RỦI RO HỆ THỐNG (P0 / P1 / P2)

### 🔴 MỨC ĐỘ P0: LỖI BẢO MẬT & KIẾN TRÚC ĐẶC BIỆT NGHIÊM TRỌNG (CRITICAL)

1. **[P0-01] Không có Database tập trung – Phụ thuộc 100% vào `localStorage`:**
   * Dữ liệu tài khoản, điểm số, bài nộp, buổi điểm danh đều lưu trong trình duyệt của người dùng hiện tại.
   * Nếu người dùng đổi máy tính, đổi trình duyệt hoặc dọn dẹp cache/cookies, toàn bộ dữ liệu bị biến mất.
   * Không thể chia sẻ dữ liệu đa người dùng: Giảng viên chấm bài trên máy mình thì học viên trên máy khác không bao giờ nhìn thấy kết quả!
2. **[P0-02] Hardcoded Mật khẩu Quản trị & Quyền kiểm soát ở Client:**
   * Trong `src/hooks/useAuth.ts` (dòng 390):
     `const isAdminPass = cleanPin === 'admin@phedu2026' || cleanPin === 'admin123';`
   * Bất kỳ ai mở DevTools hoặc kiểm tra file bundle Javascript đều lấy được mật khẩu quản trị và có thể sửa quyền `role: 'admin'` trực tiếp trong React state/localStorage để chiếm quyền hệ thống.
3. **[P0-03] Mật khẩu Học viên & Giảng viên lưu Plain-Text dạng `'123'`:**
   * Toàn bộ tài khoản khởi tạo mẫu đều có mật khẩu `'123'`, không được mã hóa qua bất kỳ thuật toán hashing an toàn nào (như Argon2id hay Bcrypt).
4. **[P0-04] Rủi ro IDOR (Insecure Direct Object References) & Giả mạo dữ liệu:**
   * Học viên có thể mở DevTools sửa mã học viên `THGZ01` thành bất kỳ mã nào để ghi đè bài thi, tự cấp chứng chỉ hoặc sửa kết quả điểm danh vì không có server-side token validation.

---

### 🟡 MỨC ĐỘ P1: VẤN ĐỀ NGHIỆP VỤ & TRẢI NGHIỆM NGƯỜI DÙNG (HIGH)

1. **[P1-01] File "God Component" khổng lồ khó bảo trì:**
   * `AdminPortal.tsx` dài tới **2.482 dòng code** chứa hàng chục state, form modal, cấu hình SEO, Meet rooms, bảng dữ liệu gộp chung một nơi.
   * `TeacherAssignmentManager.tsx` dài **1.230 dòng**.
   * `AttendanceManager.tsx` dài **834 dòng**.
2. **[P1-02] Tràn ngang thanh tab trên Desktop (Horizontal Overflow):**
   * Thanh điều hướng 10 subtabs trong AdminPortal gây thanh cuộn ngang khó chịu trên các màn hình làm việc tiêu chuẩn.
3. **[P1-03] Kiến trúc Single Page 1 URL thiếu Deep-linking:**
   * Các màn hình con không có URL riêng biệt (ví dụ: `/student/exams/101`, `/teacher/classes/K26-WE01`). Khi người dùng F5 tải lại trang, hệ thống dễ bị văng về tab mặc định.
4. **[P1-04] Trộn lẫn quyền Giảng viên và Quản trị hệ thống:**
   * Thiếu Role-Based Access Control (RBAC) nghiêm ngặt giữa Giảng viên (Teacher), Giáo vụ (Academic) và Quản trị viên (Superadmin).

---

### 🟢 MỨC ĐỘ P2: TỐI ƯU HÓA, HIỆU NĂNG & THẨM MỸ (MEDIUM)

1. **[P2-01] Asset kích thước lớn chưa tối ưu:**
   * File ảnh trong `public/` (như `logo-wide.png`, `Logo-ngang.png`, `Logo-v.png`) có dung lượng lên tới gần **1 MB mỗi ảnh**, làm chậm thời gian tải trang ban đầu (LCP).
2. **[P2-02] Thiếu Empty States và Feedback dữ liệu:**
   * Các biểu đồ và KPI khi không có dữ liệu thực chỉ hiển thị `0%` thô sơ mà không có hướng dẫn học viên làm bài hoặc giảng viên tạo đề.
3. **[P2-03] Code Dead Proxy chưa dọn dẹp:**
   * Các file re-export cũ tại `src/components/teacher/`, `src/components/assignment/`, `src/components/attendance/` cần lộ trình thay thế dứt điểm khi chuyển sang kiến trúc mới.

---

## V. DANH MỤC PHÂN LOẠI TỆP (GIỮ / SỬA / THAY THẾ / XÓA)

| Tệp / Thành phần | Phân loại | Mục đích & Lý do |
| :--- | :---: | :--- |
| `src/data/defaultQuizzes.ts` | **GIỮ & CHUYỂN DATA** | Chứa nội dung câu hỏi ngân hàng đề thi chuẩn của các môn Tin học. Sẽ viết script migration import vào PostgreSQL. |
| `src/data/badges.ts` | **GIỮ & CHUYỂN DATA** | Hệ thống huy hiệu Gamification. Chuyển thành seed data trong database Python. |
| `src/types/*.ts` | **GIỮ LÀM THAM CHIẾU** | Tham chiếu định nghĩa kiểu để xây dựng Django Models và Pydantic schemas tương ứng. |
| `src/index.css` | **SỬA & LỌC BỎ CSS DƯ** | Giữ lại các token màu sắc (CSS variables), chuẩn typography, loại bỏ class dead-code. |
| `src/components/admin/AdminPortal.tsx` | **THAY THẾ (REFACTOR)** | Tách nhỏ thành các view/component độc lập theo từng nghiệp vụ: Overview, Users, Courses, Settings. |
| `src/components/admin/AttendanceManager.tsx` | **SỬA & CHUYỂN API** | Tích hợp xác thực GPS và xoay mã QR qua backend Django thay vì tính hash ở client. |
| `src/components/admin/TeacherAssignmentManager.tsx` | **SỬA & CHUYỂN API** | Thay thế logic lưu trữ localStorage bằng API nộp bài và quản lý file server-side. |
| `src/hooks/useAuth.ts` | **THAY THẾ TRIỆT ĐỂ** | Xóa bỏ toàn bộ hardcoded password và localStorage. Thay bằng Session/JWT Auth qua Django Backend. |
| `src/hooks/use*Storage.ts` | **THAY THẾ TRIỆT ĐỂ** | Chuyển toàn bộ gọi state localStorage thành REST API / HTMX endpoints. |
| `public/admin/index.html` | **ĐÃ XÓA** | Xóa bỏ file HTML thô không qua bundle để tránh lỗi định tuyến Vercel. |
| Các file proxy re-export tại `components/teacher/`, `components/attendance/` | **XÓA (Sau migration)** | Xóa bỏ sau khi hoàn tất chuyển đổi toàn bộ import sang cấu trúc mới. |

---

## VI. ĐỀ XUẤT KIẾN TRÚC MỤC TIÊU (PYTHON-FIRST LMS ARCHITECTURE)

### 1. Kiến trúc phân tầng (Multi-tier Architecture)
```text
[ Trình duyệt Web / Mobile App ]
             │
             ▼
     [ Nginx Reverse Proxy ]
             │
   ┌─────────┴─────────┐
   ▼                   ▼
[ Static Assets / CDN ] [ Gunicorn / Django 5.x Backend (Python 3.11/3.13) ]
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
         [ PostgreSQL ]     [ Redis ]     [ Celery Worker ]
         (Database lõi)    (Cache & Lock) (Chấm điểm & Gửi mail)
```

### 2. Các ứng dụng nghiệp vụ Django mục tiêu (`apps/`)
1. `apps.accounts`: Xác thực người dùng, mã hóa mật khẩu Argon2id, phân quyền RBAC đa vai trò (Student, Teacher, Academic, Admin), MFA.
2. `apps.courses`: Quản lý 10 chương trình đào tạo Tin học (MOS, IC3, CNTT Cơ bản/Nâng cao), modules, bài học.
3. `apps.classes`: Quản lý lớp học (Cohorts), sĩ số, phân công giảng viên.
4. `apps.schedules`: Quản lý thời khóa biểu, phòng học trực tiếp & link Google Meet bảo mật (không lộ public).
5. `apps.assessments`: Ngân hàng câu hỏi, đề thi trắc nghiệm, giám sát chống gian lận (cheat detection), tự động chấm điểm server-side.
6. `apps.assignments`: Quản lý bài tập thực hành Word/Excel/PowerPoint, nộp file và phân quyền chấm điểm.
7. `apps.attendance`: Điểm danh thông minh qua mã QR động (server sinh token mỗi 15-30s) kèm xác thực định vị GPS lớp học.
8. `apps.certificates`: Cấp phát chứng nhận điện tử với mã xác thực duy nhất (Public verify route: `/verify/<cert_code>`).
9. `apps.analytics`: Dashboard phân tích năng lực học viên, cảnh báo học vụ sớm (Early Warning).
10. `apps.audit`: Ghi nhận nhật ký audit log bất biến toàn bộ hành vi quản trị và sửa điểm.

---

## VII. ĐÁNH GIÁ RỦI RO MIGRATION & KẾ HOẠCH BẢO VỆ DỮ LIỆU

1. **Rủi ro mất dữ liệu học viên đang dùng:**
   * Dữ liệu hiện đang rải rác trên trình duyệt của người dùng.
   * **Giải pháp:** Xây dựng script export/import `localStorageDump` sang file JSON chuẩn hóa, sau đó viết lệnh Django command `python manage.py import_legacy_data` để nạp dữ liệu vào PostgreSQL một cách an toàn.
2. **Rủi ro gián đoạn dịch vụ (Zero-downtime):**
   * Giữ nguyên ứng dụng web client hiện tại hoạt động bình thường trên production.
   * Xây dựng hệ thống Python Backend theo từng phase có kiểm thử tự động (Unit test, API test) đạt coverage ≥ 85%.
   * Chỉ chuyển đổi DNS/Routing khi môi trường mới đã vượt qua Quality Gate hoàn toàn.

---

## VIII. KẾT LUẬN PHASE 0

* **Hiện trạng:** Đã hoàn thành 100% việc đọc hiểu toàn bộ source code, chạy baseline thành công, xác định chính xác các điểm nghẽn nghiêm trọng (P0) về bảo mật/database và các lỗi bất cập UI/UX trên cổng `/admin`.
* **Kế hoạch tiếp theo:** Tuân thủ quy tắc làm việc, **không xóa hoặc viết lại hàng loạt khi chưa có chỉ thị**, sẵn sàng tiến hành Phase 1 (Thiết kế chi tiết Data Model, Backlog và khởi tạo nền tảng backend).
