# 🏛️ KIẾN TRÚC PHÂN TẦNG HỆ THỐNG: FRONTEND (FE) & BACKEND (BE)

Tài liệu này xác lập cấu trúc phân tách rõ ràng giữa phân hệ **Frontend (FE)** và **Backend (BE)** của nền tảng **Tin Học Gen Z • PH DIGITAL EDUCATION**.

---

## 1. Bản Đồ Phân Tầng Tổng Thể

```
+-------------------------------------------------------------------------+
|                        PH DIGITAL EDUCATION                             |
+-------------------------------------------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
|     FRONTEND (FE)     | <=== REST / JSON ===> |     BACKEND (BE)      |
|    Client UI & PWA    |       HttpOnly        |   Services & Storage  |
+-----------------------+                       +-----------------------+
| - React 18 & Vite     |                       | 1. Serverless API     |
| - TypeScript          |                       |    (api/*)            |
| - Design System:      |                       |    - Auth & Sessions  |
|   Technology Blue     |                       |    - Cron & Notif     |
|   & Clean Slate       |                       |    - Review Queue     |
| - PWA & ServiceWorker |                       | 2. Django Core        |
| - LocalStorage Offline|                       |    (backend/*)        |
| - Audio FX Engine     |                       |    - Django REST      |
| - Quiz & Cert Canvas  |                       |    - SQLite / Postgres|
+-----------------------+                       | 3. Supabase Cloud DB  |
                                                +-----------------------+
```

---

## 2. Phân Hệ Frontend (FE)

* **Thư mục mã nguồn cốt lõi**: `src/` và `public/`
* **Công nghệ chủ lực**:
  * **React 18.3.1**: Kiến trúc Component phân tách theo vai trò (`landing`, `dashboard`, `quiz`, `admin`, `attendance`).
  * **TypeScript 5.5**: Type-safe 100%, quản lý chặt chẽ models (`src/types/*`).
  * **Vite 5.4**: Bundler tốc độ cao với phân rã manual chunks (`vendor-react`, `vendor-icons`, `vendor-qrcode`, `vendor-effects`).
  * **PWA & Service Worker**: `public/manifest.json` và `public/sw.js` cho phép cài đặt native app trên iOS và Android, hỗ trợ thi và làm bài tập ngoại tuyến (Offline-first).
* **Quy chuẩn Giao diện (Clean Tech Palette)**:
  * Đã loại bỏ hoàn toàn các dải màu gradient sặc sỡ "7 màu".
  * Màu thương hiệu chủ đạo: Xanh dương công nghệ (`#0057b8`), Xanh sáng (`#2563eb`), Nền Trắng (`#ffffff`) và Slate trung tính (`#f8fafc`).

---

## 3. Phân Hệ Backend (BE)

Hệ thống Backend được thiết kế theo mô hình **Hybrid Backend** linh hoạt:

### 3.1. Serverless Edge Backend (`api/*`)
* Triển khai trực tiếp trên hạ tầng Edge / Serverless của Vercel:
  * `api/auth/login.ts`, `session.ts`, `logout.ts`: Quản lý xác thực phiên làm việc, ký JWT HMAC-SHA256, HttpOnly Cookie và chống Brute-force rate limiting.
  * `api/admin/*`: Quản lý danh sách nguồn học liệu, hàng đợi kiểm duyệt nội dung thi (`content-review-queue.ts`), thông báo nội bộ.
  * `api/cron/*`: Cron job tự động rà soát nguồn định kỳ và gửi thông báo Web Push.
* **Bảo vệ an ninh**: Bộ lọc SSRF (`src/utils/ssrfProtection.ts`), ngăn chặn truy cập IP nội bộ và AWS/Cloud metadata.

### 3.2. Django Core Backend (`backend/*`)
* **Python & Django REST Framework**:
  * Phục vụ quản trị dữ liệu lớn, export báo cáo khảo thí học vụ, API phân tích điểm thi và kết nối cơ sở dữ liệu quan hệ (`db.sqlite3` / PostgreSQL).

### 3.3. Cơ Sở Dữ Liệu & Cloud Storage (`supabase/*`)
* Quản lý các bảng: `learning_sources`, `content_review_queue`, `certification_catalog`, `team_notifications`.
* RLS (Row Level Security) bảo vệ dữ liệu học viên và đề thi.

---

## 4. Giao Tiếp FE - BE (Client SDK)

Frontend kết nối Backend thông qua SDK trung tâm `src/services/api/`:
* `backendApiClient.ts`: Cung cấp các hàm gọi `get()`, `post()`, `request()` tự động gán header, credentials và chuẩn hóa format phản hồi:
  ```typescript
  import { BackendApiClient } from '../services/api';

  // Ví dụ gọi endpoint kiểm tra phiên
  const session = await BackendApiClient.get('/api/auth/session');
  ```

