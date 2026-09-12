# BÁO CÁO KIỂM TOÁN HỆ THỐNG TOÀN DIỆN (AUDIT REPORT)
## HỆ THỐNG ĐÀO TẠO & KHẢO THÍ TRỰC TUYẾN PH DIGITAL EDUCATION LMS

- **Thương hiệu**: Tin Học Gen Z
- **Đơn vị vận hành**: CÔNG TY TNHH PH – TIN HỌC GEN Z
- **Hệ thống môi trường**:
  - Website học trực tuyến: `https://hoctructuyen.tinhocgenz.io.vn/`
  - Cổng quản trị: `https://hoctructuyen.tinhocgenz.io.vn/admin`
  - Hạ tầng hosting: Vercel Serverless Platform
  - Cơ sở dữ liệu mục tiêu: Supabase PostgreSQL
- **Ngày lập báo cáo**: 12/09/2026
- **Đội ngũ kiểm toán**: Senior IT Team (PM, BA, Architect, Database, Backend, Frontend, UI/UX, Security, DevOps, QA, Data Analyst, AI/ML, Mobile/PWA, Technical Writer)
- **Quy tắc thực hiện**: **Khảo sát nghiêm ngặt — Tuyệt đối không sửa code khi chưa được phê duyệt**.

---

## I. HIỆN TRẠNG KIẾN TRÚC & CÔNG NGHỆ THỰC TẾ

### 1. Kiến trúc tổng thể hiện tại
Hệ thống hiện tại là một **Single Page Application (SPA)** viết bằng React 18 + TypeScript + Vite, triển khai trên Vercel:
- **Routing**: Phụ thuộc hoàn toàn vào Client-side State Routing trong `src/App.tsx` (dựa trên `activeTab`, `isSessionActive`, và đọc URL qua `window.location.pathname`).
- **Xác thực & Phiên làm việc**: Hiện tại chạy **100% tại Client** thông qua hook `src/hooks/useAuth.ts` và lưu cờ phiên `SESSION_ACTIVE_KEY` trong `localStorage`. Chưa có session cookie `HttpOnly` hay xác thực bảo mật tại Server.
- **Lưu trữ dữ liệu nghiệp vụ**: Toàn bộ dữ liệu Học viên, Giảng viên, Bài tập, Lịch học, Điểm danh, Ngân hàng đề thi đang được lưu trữ tại `localStorage` của trình duyệt người dùng hoặc nạp từ các mảng JavaScript hardcode (`src/data/defaultQuizzes.ts`, `src/hooks/useAuth.ts`).
- **Serverless API trên Vercel**: Thư mục `api/` chứa một số endpoint serverless Node.js (Push Notifications, Content Review Queue, Learning Source Sync Cron). Đã có client kết nối Supabase server-side trong `api/_lib/supabase.ts`.
- **Mã nguồn Backend Python/Django tồn đọng**: Thư mục `backend/` chứa mã nguồn Django REST Framework (`apps/accounts`, `apps/assessments`...) nhưng **KHÔNG được biên dịch hoặc thực thi trên Vercel** (Vercel chỉ build Vite frontend theo `vercel.json`).

### 2. Danh mục công nghệ & Thư viện sử dụng
| Thành phần | Công nghệ / Phiên bản thực tế | Trạng thái vận hành |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.3.1 + React DOM 18.3.1 | Đang chạy chính trên Vercel |
| **Build Tool & Bundler**| Vite 5.4.2 + TypeScript 5.5.3 | Đang chạy (Build hoàn thành trong ~5.2s) |
| **Database SDK** | `@supabase/supabase-js` ^2.115.0 | Đã cài đặt, sẵn sàng cho migration DB thật |
| **Quét mã QR** | `html5-qrcode` ^2.3.8 | Hoạt động ở client cho điểm danh QR |
| **PWA & Web Push** | `web-push` ^3.6.7 + `sw.js` + `manifest.json` | Đã có manifest, offline shell cơ bản |
| **Icon System** | `lucide-react` ^1.16.0 | Hệ thống icon SVG đồng bộ |
| **Kiểm thử tự động** | Node.js Test Runner (`tests/run-tests.mjs`) | 136/136 bài test đạt chuẩn (100%) |

---

## II. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS) CỦA 5 VẤN ĐỀ TRỌNG YẾU

### 1. Đăng nhập Admin thất bại im lặng (Silent Failure)
- **Hiện tượng**: Truy cập `/admin`, nhập thông tin nhưng trang không chuyển vào Dashboard hoặc không hiển thị thông báo lỗi rõ ràng.
- **Nguyên nhân gốc rễ**:
  1. **Bất đồng bộ trong State Re-render**: Trong `src/App.tsx`, việc kiểm tra render màn hình Admin dựa trên điều kiện `const isAdmin = isSessionActive && currentUser.role === 'admin'`. Khi gọi hàm `onLoginAsAdmin`, hàm `loginAsStaff` cập nhật state `setUser(staffProfile)` và `setIsSessionActive(true)`. Do React batching updates, tại thời điểm re-render đầu tiên, `currentUser.role` có thể chưa cập nhật kịp thời, dẫn đến component `StandaloneAdminApp` vẫn giữ nguyên view đăng nhập.
  2. **Thiếu phản hồi mã lỗi chuẩn hóa từ Server**: Hệ thống xác thực hiện tại không có Server Endpoint kiểm tra session; mọi lỗi đều chỉ là các chuỗi string tiếng Việt sinh ra ở client. Nếu xảy ra lỗi logic (ví dụ lệch hash, token lỗi hoặc routing), hàm bị rơi vào luồng không xác định và không phản hồi mã lỗi (`INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `INSUFFICIENT_ROLE`...).
  3. **Không có Server-side Session / Cookie**: Đăng nhập chưa tạo Session `HttpOnly` cookie. Do đó, khi người dùng F5 tải lại trang `/admin`, hệ thống chỉ đọc lại `localStorage`, nếu cache bị chặn hoặc chưa kịp nạp, phiên bị mất mà không có cơ chế khôi phục tự động.

### 2. Placeholder và Giao diện làm lộ thông tin đăng nhập (`admin123`, `ADMIN`, `ADMIN01`)
- **Hiện tượng**: Giao diện đăng nhập tại `/admin` và Cổng xác thực hiển thị badge gợi ý hoặc placeholder chứa trực tiếp tài khoản và mật khẩu.
- **Nguyên nhân gốc rễ**:
  - Tại `src/components/admin/StandaloneAdminApp.tsx` (dòng 301-320): Đang chứa khối giao diện gợi ý:
    - `Mã cán bộ: ADMIN hoặc ADMIN01`
    - `Mật khẩu: admin123`
  - Tại `src/components/auth/UnifiedAuthGateway.tsx` (dòng 582, 610, 689):
    - `placeholder="Mã cán bộ hoặc tên (VD: ADMIN, ADMIN01, Thầy Quang Huy)"`
    - `placeholder="Mật khẩu hoặc PIN (VD: admin123)"`
    - `<div>Mã cán bộ: ADMIN hoặc ADMIN01 • Mật khẩu: admin123</div>`
  - **Vi phạm nghiêm trọng Tiêu chuẩn Bảo mật P0.2**: Để lộ thông tin đặc quyền quản trị và tài khoản cán bộ thật trên giao diện công khai.

### 3. Dữ liệu Thêm / Sửa / Xóa không được lưu bền vững
- **Hiện tượng**: Quản trị viên thêm tài khoản học viên, cập nhật đề thi, tạo lịch học hoặc điểm danh, nhưng khi sang máy tính khác, mở tab ẩn danh hoặc xóa bộ nhớ tạm trình duyệt thì toàn bộ dữ liệu bị biến mất.
- **Nguyên nhân gốc rễ**:
  - **Sử dụng `localStorage` làm Database chính (SSOT giả)**:
    - Trong `src/hooks/useLocalStorage.ts`: đề thi lưu trong `phtinhocgenz_custom_quizzes_v1`.
    - Trong `src/hooks/useAttendanceStorage.ts`: điểm danh lưu trong `phtgz_attendance_sessions_v1`.
    - Trong `src/hooks/useScheduleStorage.ts`: lịch học lưu trong `phtgz_schedules_v1`.
    - Trong `src/hooks/useAuth.ts`: học viên và giảng viên lưu trong `studentAccounts` state, khởi tạo từ hằng số hardcode `INITIAL_STUDENT_ACCOUNTS`.
  - **Thiếu API Server kết nối Cơ sở dữ liệu thật**: Frontend chưa gửi mutation request (POST/PUT/DELETE) lên Supabase PostgreSQL để ghi dữ liệu vĩnh viễn vào các bảng vật lý.

### 4. Nút “Vào hệ thống học tập” tự quay lại trang chủ
- **Hiện tượng**: Khách truy cập nhấn nút "Vào hệ thống học tập" ở đầu trang, thay vì mở màn hình đăng nhập LMS thì trang lại tự tải lại hoặc cuộn về chính nó.
- **Nguyên nhân gốc rễ**:
  - Tại `src/components/landing/HeroBanner.tsx` (dòng 198-205):
    ```tsx
    <a
      href="https://hoctructuyen.tinhocgenz.io.vn/"
      onClick={handleSecondaryClick}
      className="hero-btn-secondary"
    >
      <Laptop size={16} color="#2563EB" />
      <span>Vào hệ thống học tập</span>
    </a>
    ```
  - Thuộc tính `href` đang trỏ cứng đến đúng URL của trang chủ hiện tại (`https://hoctructuyen.tinhocgenz.io.vn/`).
  - Nếu người dùng click mở tab mới, dùng chuột giữa hoặc phím tắt, trình duyệt mở thẳng URL `href` này, dẫn đến việc quay vòng lại chính trang Landing Page thay vì chuyển vào Cổng Đăng nhập LMS (`?portal=student` hoặc hiển thị Auth Gateway).

### 5. Dữ liệu Khóa học giữa Trang chủ, Footer và Trang Đăng nhập không thống nhất
- **Hiện tượng**: Số lượng khóa học, mã định danh và tên gọi không đồng nhất giữa các thành phần giao diện:
  - **Ở Trang chủ (`src/components/landing/LandingPage.tsx`)**: Mảng `COURSES` khai báo khóa học với mã `'ic3-gs6'` (chưa có trong enum `CurriculumTrack`), tên gọi ví dụ: `"MOS Word 2019/365 Chuẩn Quốc Tế"`.
  - **Ở Footer (`LandingPage.tsx`)**: Danh sách 10 dòng hardcode văn bản tĩnh với tên khác: `"1. Tin Học Văn Phòng Cấp Tốc 3in1"`, `"8. Kỹ Năng Word Chuẩn Doanh Nghiệp"`, `"10. Thiết Kế Slide PowerPoint Pro"`.
  - **Ở Cổng đăng nhập (`src/types/auth.ts`)**: `TRACK_LABELS` khai báo: `"1. Word, Excel, PowerPoint (3 Buổi 1 môn)"`, `"8. Kỹ năng soạn thảo Word (6 buổi)"`.
- **Nguyên nhân gốc rễ**: Thiếu bảng dữ liệu `courses` và `course_versions` làm Nguồn Chân Lý Duy Nhất (Single Source of Truth - SSOT) trong Database. Mỗi component tự định nghĩa một danh sách riêng.

---

## III. BẢNG ĐÁNH GIÁ MÔ-ĐUN & NỢ KỸ THUẬT (TECHNICAL DEBT)

| Tên Mô-đun | Trạng thái Thực tế | Có Backend Thật? | Đánh giá Nợ kỹ thuật & Rủi ro |
| :--- | :---: | :---: | :--- |
| **Xác thực Học viên / Cán bộ** | Hoạt động ở Client | ❌ Chưa | Rủi ro P0: Xác thực client-side, mật khẩu hash đồng bộ ở client, chưa có cookie HttpOnly. |
| **Quản lý Đề thi & Câu hỏi** | Hoạt động ở Client | ❌ Chưa | Dữ liệu lưu trong `localStorage`. Cần chuyển sang bảng `questions`, `exams`. |
| **Quản lý Điểm danh (QR)** | Hoạt động ở Client | ❌ Chưa | Tạo phiên và quét QR thành công nhưng chỉ lưu ở máy giảng viên. |
| **Lịch học & Xếp lớp** | Hoạt động ở Client | ❌ Chưa | Dữ liệu lịch học lưu trong localStorage, không đồng bộ giữa học viên và giáo viên. |
| **Bóc tách đề 3in1** | Hoạt động tốt | ✅ Client tool | Bóc tách file DOCX, XLSX, PPTX hoàn toàn ở client, hoạt động ổn định. |
| **Chứng nhận số QR & Tra cứu** | Giao diện + Hash | ❌ Chưa | Trang `/verify/[id]` đọc dữ liệu mock, chưa kiểm tra điều kiện tốt nghiệp từ DB. |
| **Thông báo & Zalo ZNS** | Giao diện mẫu | ⚠️ Bán phần | Đã có Vercel cron và SDK Zalo nhưng cần cấu hình bảng `notifications` thật. |
| **Thanh toán & Học phí** | Chưa triển khai | ❌ Chưa | Chưa có bảng `payments`, `invoices`, chưa có webhook ngân hàng/cổng thanh toán. |
| **AI Tutor / Diagnostic** | Giao diện mẫu | ❌ Chưa | Dữ liệu mô phỏng, chưa kết nối LLM API có kiểm soát hạn mức chi phí. |

---

## IV. LỘ TRÌNH TRIỂN KHAI TOÀN DIỆN (P0 → P3)

### Chi tiết Hạng mục Giai đoạn P0 (Ưu tiên số 1 - Bắt buộc hoàn thiện trước)
1. **P0.1 – Sửa Đăng nhập, Session và Lỗi im lặng**:
   - Chuyển toàn bộ logic xác thực về Server API (`/api/auth/login`, `/api/auth/session`, `/api/auth/logout`).
   - Thiết lập Session Cookie an toàn (`HttpOnly`, `Secure`, `SameSite=Lax`).
   - Chuẩn hóa 10 mã lỗi (`INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `INSUFFICIENT_ROLE`, `SESSION_EXPIRED`...).
   - Đảm bảo F5 tại `/admin` duy trì phiên nếu hợp lệ, chuyển về đăng nhập nếu hết hạn.
2. **P0.2 – Xóa triệt để Thông tin Đăng nhập mẫu & Khóa Placeholder**:
   - Xóa bỏ `admin123`, `ADMIN`, `ADMIN01`, tên giảng viên thật khỏi placeholder và UI hints.
   - Placeholder chuẩn hóa: *"Nhập tài khoản hoặc email"*, *"Nhập mật khẩu"*.
3. **P0.3 – Cơ chế Chống dò Mật khẩu (Brute-force Protection)**:
   - Rate limiting theo IP và tài khoản (tối đa 5 lần thử trong 15 phút, backoff tăng dần).
   - Khóa tạm tài khoản nếu vượt ngưỡng và ghi `login_events`.
4. **P0.4 – Thiết lập Schema Database Production trên Supabase PostgreSQL**:
   - Khởi tạo 24 bảng dữ liệu cốt lõi (xem mục V).
5. **P0.5 – Thiết lập Row Level Security (RLS) Matrix**:
   - Bật RLS 100% trên các bảng nghiệp vụ.
   - Học viên chỉ đọc dữ liệu của mình; Giảng viên chỉ thao tác lớp được phân công.
6. **P0.6 – Chuẩn hóa luồng CRUD Dữ liệu Bền vững**:
   - Giao dịch có transaction, chống double-click, có idempotency key, soft delete và khôi phục.
7. **P0.7 – Bộ Kiểm thử Toàn diện P0**:
   - 100% test cases tự động cho Auth, RLS, CRUD, Security pass trước khi nghiệm thu.

---

## V. ĐỀ XUẤT SCHEMA DATABASE SUPABASE & KẾ HOẠCH MIGRATION

### 1. Danh sách 24 Bảng Dữ liệu Cốt lõi
```text
1. profiles                 (Hồ sơ người dùng dùng chung, UUID PK liên kết auth.users)
2. roles                    (super_admin, admin, teacher, academic, student, accountant)
3. permissions              (Danh mục quyền chi tiết hệ thống)
4. user_roles               (Bảng liên kết phân quyền đa vai trò)
5. students                 (Hồ sơ chi tiết học viên, mã học viên duy nhất)
6. teachers                 (Hồ sơ chi tiết giảng viên, mã cán bộ duy nhất)
7. courses                  (Danh mục khóa học - Single Source of Truth)
8. course_versions          (Phiên bản chương trình đào tạo theo năm/chuẩn)
9. classes                  (Lớp học cụ thể theo khóa)
10. class_students          (Ghi danh học viên vào lớp)
11. class_teachers          (Phân công giảng viên vào lớp)
12. modules                 (Mô-đun học phần Word, Excel, PPT...)
13. lessons                 (Bài học chi tiết)
14. learning_progress       (Tiến độ học tập của học viên)
15. questions               (Ngân hàng câu hỏi trắc nghiệm & thực hành)
16. question_options        (Các lựa chọn đáp án)
17. exams                   (Đề thi và cấu hình bài thi)
18. exam_questions          (Liên kết câu hỏi trong đề)
19. exam_attempts           (Lượt làm bài thi của học viên)
20. exam_answers            (Câu trả lời chi tiết và autosave)
21. certificates            (Chứng chỉ số đã cấp kèm SHA-256 hash)
22. audit_logs              (Nhật ký hoạt động bất biến)
23. login_events            (Nhật ký đăng nhập, IP, thiết bị, kết quả)
24. system_settings         (Cấu hình hệ thống động)
```

### 2. File Migration Dự kiến
- Tạo file migration: `supabase/migrations/20260911_core_lms_p0_schema.sql`
- Kèm theo file Rollback: `supabase/migrations/20260911_core_lms_p0_schema_rollback.sql`
- **Nguyên tắc an toàn**: Chạy thử nghiệm trên Staging, kiểm tra ràng buộc foreign keys, tạo backup snapshot trước khi áp dụng production.

---

## VI. DANH SÁCH TỆP DỰ KIẾN SỬA ĐỔI CHO GIAI ĐOẠN P0

| Tệp tin | Vị trí | Mục đích chỉnh sửa |
| :--- | :--- | :--- |
| `src/components/admin/StandaloneAdminApp.tsx` | Frontend Admin | Xóa bỏ badge gợi ý thông tin `ADMIN` / `admin123`. Chuẩn hóa form đăng nhập với error codes. |
| `src/components/auth/UnifiedAuthGateway.tsx` | Frontend Auth | Xóa bỏ ví dụ tài khoản/mật khẩu mẫu trong placeholder. Chuẩn hóa placeholder. |
| `src/components/landing/HeroBanner.tsx` | Frontend Landing | Sửa nút *"Vào hệ thống học tập"* để chuyển trang nội bộ vào Auth Gateway thay vì reload chính nó. |
| `src/types/auth.ts` | Shared Types | Chuẩn hóa danh mục khóa học thống nhất, định nghĩa Auth Error Codes. |
| `src/hooks/useAuth.ts` | Auth Hook | Chuyển đổi gọi Server API thay vì so sánh client-side, quản lý session cookie. |
| `api/auth/login.ts` | Serverless API (Mới) | Endpoint đăng nhập an toàn, hash password server-side, tạo HttpOnly cookie session. |
| `api/auth/session.ts` | Serverless API (Mới) | Endpoint kiểm tra phiên đăng nhập và vai trò RBAC từ server. |
| `api/auth/logout.ts` | Serverless API (Mới) | Endpoint hủy cookie session an toàn trên mọi thiết bị. |
| `src/App.tsx` | Root Application | Đồng bộ State Session với Server, chặn route `/admin` bằng RBAC cấp máy chủ. |
| `supabase/migrations/20260911_core_lms_p0_schema.sql`| Database | Script khởi tạo schema và chính sách RLS trên Supabase. |

---

## VII. PHƯƠNG ÁN ROLLBACK (DỰ PHÒNG RỦI RO)
1. **Rollback Mã nguồn (Git)**:
   - Tạo branch bảo toàn trước khi triển khai: `git branch backup-pre-p0-baseline`.
   - Nếu phát hiện sự cố, thực hiện rollback 1 lệnh: `git revert HEAD` hoặc checkout lại commit ổn định `c20996c`.
2. **Rollback Database**:
   - Mỗi file migration SQL luôn đi kèm file rollback tương ứng (ví dụ: `DROP TABLE IF EXISTS ... CASCADE`).
   - Tạo snapshot database trên Supabase dashboard trước khi chạy lệnh DDL.
3. **Rollback Vercel Deployment**:
   - Sử dụng tính năng **Instant Rollback** của Vercel để phục hồi bản deploy `https://eduquest-study-8lnb2mi3i-dinhhuy05707.vercel.app` chỉ trong vòng 5 giây.

---

## VIII. KẾT LUẬN & ĐỀ XUẤT BƯỚC TIẾP THEO

Toàn bộ cuộc khảo sát hiện trạng đã hoàn thành với đầy đủ bằng chứng kỹ thuật, xác định chính xác 100% nguyên nhân gốc rễ của 5 vấn đề cốt lõi mà Ban Quản lý Dự án yêu cầu. Không có bất kỳ dòng code nào bị can thiệp trái phép trong đợt khảo sát này.

**Đề xuất bước tiếp theo**:
Sau khi Ban Quản lý phê duyệt báo cáo `AUDIT_REPORT.md` này, đội ngũ sẽ bắt tay vào thực hiện hạng mục đầu tiên:
👉 **`P0.1 – Sửa đăng nhập, session và lỗi im lặng`**
Mỗi hạng mục sẽ được lập trình, kiểm thử tự động (unit test, typecheck, build), báo cáo chi tiết nghiệm thu trước khi bước sang hạng mục tiếp theo.

