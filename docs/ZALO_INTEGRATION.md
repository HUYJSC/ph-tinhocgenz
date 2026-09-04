# HƯỚNG DẪN TÍCH HỢP & VẬN HÀNH ZALO ZBS / ZALO OA 2026
**HỆ THỐNG ĐÀO TẠO TIN HỌC TRỰC TUYẾN — PH DIGITAL EDUCATION (TINHOCGENZ)**

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (ARCHITECTURE)

Hệ thống kết nối Zalo được thiết kế theo tiêu chuẩn an ninh cấp doanh nghiệp (Enterprise Grade), tách biệt tuyệt đối giữa Frontend SPA và Serverless Backend trên Vercel:

```text
               GIẢNG VIÊN / QUẢN TRỊ VIÊN
                         │
                         ▼
        [Frontend React SPA (Vite/TypeScript)]
                         │
                         │ (Gọi internal API với Bearer Token)
                         ▼
         [Vercel Serverless Functions (/api/zalo/*)]
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
[Zalo OAuth v4 Engine]        [Zalo ZBS Template Engine]
(Token Atomic Refresh)        (POST /message/template)
          │                             │
          └──────────────┬──────────────┘
                         ▼
             [ZALO OFFICIAL ACCOUNT]
                         │
                         ▼
             HỌC VIÊN / PHỤ HUYNH
```

### Chiều ngược (Webhook Ingestion):
```text
          Zalo OpenAPI (Event: delivered, user_received, follow)
                         │
                         ▼ (POST /api/zalo/webhook)
     [Xác thực chữ ký HMAC-SHA256 & Timestamp < 300s]
                         │
        [Chống Replay: Ghi nhận event_id duy nhất]
                         │
    ┌────────────────────┴────────────────────┐
    ▼                                         ▼
[Cập nhật Supabase]             [Mirror sang Webhook.site (Ops)]
(zalo_message_logs)             (Giám sát gói tin thời gian thực)
```

---

## 2. DANH MỤC BIẾN MÔI TRƯỜNG (ENVIRONMENT VARIABLES)

Cấu hình tại **Vercel Dashboard > Project Settings > Environment Variables**:

| Tên Biến Môi Trường | Bắt Buộc | Môi Trường | Mục Đích |
| :--- | :---: | :--- | :--- |
| `ZALO_APP_ID` | **Có** | Production & Preview | App ID ứng dụng Zalo for Developers |
| `ZALO_APP_SECRET` | **Có** | Production & Preview | Secret Key ứng dụng Zalo (để Refresh Access Token) |
| `ZALO_OA_ID` | **Có** | Production & Preview | ID trang Zalo Official Account |
| `ZALO_OA_SECRET_KEY` | **Có** | Production & Preview | Khóa bí mật OA dùng xác thực chữ ký Webhook HMAC |
| `ZALO_OA_ACCESS_TOKEN` | Tùy chọn | Production & Preview | Token khởi tạo (sẽ được tự động cập nhật vào Database) |
| `ZALO_OA_REFRESH_TOKEN`| Tùy chọn | Production & Preview | Refresh Token khởi tạo (hỗ trợ single-use refresh) |
| `ZALO_ZBS_TEMPLATE_ID` | **Có** | Production & Preview | ID mẫu Template Message đã được Zalo phê duyệt |
| `SUPABASE_URL` | **Có** | Production & Preview | Endpoint Supabase Database (Server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Có** | Production & Preview | Khóa dịch vụ máy chủ (Tuyệt đối không đưa xuống client) |
| `CRON_SECRET` | **Có** | Production | Khóa Bearer bảo vệ Vercel Cron |
| `ZALO_INTEGRATION_ENABLED` | Tùy chọn | Production | Bật/tắt toàn bộ module Zalo (`true` / `false`) |
| `ZALO_SEND_ENABLED` | Tùy chọn | Production | Cho phép phát tin thật (`true` / `false`) |
| `ZALO_AUTOMATION_ENABLED` | Tùy chọn | Production | Cho phép Cron tự động phát tin (`true` / `false`, mặc định `false`) |

---

## 3. CÁC BƯỚC CẤU HÌNH TRÊN ZALO FOR DEVELOPERS (MANUAL RUNBOOK)

1. **Đăng ký và liên kết ứng dụng**:
   - Truy cập [developers.zalo.me](https://developers.zalo.me/) > Tạo ứng dụng dạng **Doanh nghiệp**.
   - Vào mục **Official Account** > Chọn liên kết với trang Zalo OA của **PH Digital Education**.
2. **Cấu hình OAuth Callback**:
   - Vào **Đăng nhập** > **Cài đặt**.
   - Thêm Redirect URI callback:  
     `https://hoctructuyen.tinhocgenz.io.vn/api/zalo/oauth/callback`  
     *(hoặc domain Vercel: `https://eduquest-study-app-dinhhuy05707.vercel.app/api/zalo/oauth/callback`)*
3. **Cấu hình Webhook**:
   - Vào **Official Account** > **Webhook**.
   - Điền Webhook URL:  
     `https://hoctructuyen.tinhocgenz.io.vn/api/zalo/webhook`
   - Đăng ký sự kiện: `user_received_message`, `template_message_status`, `follow`.
   - Sao chép **OA Secret Key** và điền vào biến `ZALO_OA_SECRET_KEY` trên Vercel.
4. **Đăng ký ZBS Template Message**:
   - Truy cập cổng Zalo ZBS Business > Đăng ký Template nhắc lịch học / cảnh báo rủi ro.
   - Khi được Zalo duyệt, sao chép Template ID (ví dụ: `348291`) vào biến `ZALO_ZBS_TEMPLATE_ID`.

---

## 4. QUY TRÌNH DUYỆT & GỬI TIN BẢO ĐẢM (SAFETY DISPATCH)

- **AI Quét & Soạn Thảo**: Nút bấm chỉ tạo bản thảo với trạng thái `pending`.
- **Xem trước (Preview)**: Luôn hiển thị modal xác nhận số lượng người nhận và nội dung trước khi phát tin hàng loạt.
- **Hàng Đợi & Idempotency**: Mỗi tin nhắn được cấp `idempotency_key` (duy nhất theo tuần / học viên) ngăn chặn hoàn toàn việc gửi 2 lần.
- **Rate Limiting**: Giãn cách gửi giữa các tin nhắn (tối thiểu 150ms) tránh chạm trần giới hạn rate limit của Zalo OpenAPI.

---

## 5. CƠ CHẾ KHẨN CẤP (EMERGENCY DISABLE)

Trong trường hợp phát hiện bất thường (ví dụ: sai nội dung template, phát hiện lặp tin):
1. Truy cập **Vercel Dashboard > Settings > Environment Variables**.
2. Đặt ngay:
   ```bash
   ZALO_SEND_ENABLED=false
   ZALO_AUTOMATION_ENABLED=false
   ```
3. Nhấn **Save** và **Redeploy**. Hệ thống sẽ ngay lập tức khóa toàn bộ lệnh phát tin thật và chỉ đưa vào hàng đợi lưu trữ.

---

## 6. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

### A. Trạng thái: "CHƯA CẤU HÌNH"
- **Nguyên nhân**: Thiếu `ZALO_APP_ID`, `ZALO_APP_SECRET` hoặc chưa cấp quyền OAuth.
- **Khắc phục**: Điền biến trên Vercel hoặc bấm nút **"Kết Nối Zalo OA"** trên màn hình quản trị để cấp quyền.

### B. Trạng thái: "TOKEN HẾT HẠN"
- **Nguyên nhân**: Token đã quá 90 ngày hoặc Refresh Token bị vô hiệu hóa.
- **Khắc phục**: Nhấn nút **"Kết Nối Zalo OA"** để thực hiện ủy quyền lại và nhận cặp Token mới.

### C. Gửi thất bại: "Lỗi mã -213"
- **Nguyên nhân**: Số điện thoại không đúng định dạng di động Việt Nam.
- **Khắc phục**: Kiểm tra hồ sơ học viên, hệ thống sẽ tự động chuẩn hóa sang định dạng `84xxxxxxxxx`.

### D. Webhook không nhận sự kiện:
- **Nguyên nhân**: Vercel bật chế độ Deployment Protection (Vercel Authentication) chặn request từ bên ngoài.
- **Khắc phục**: Vào Vercel Settings > Deployment Protection > Tắt Vercel Authentication cho môi trường Production.
