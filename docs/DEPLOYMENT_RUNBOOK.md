# DEPLOYMENT RUNBOOK — HƯỚNG DẪN VẬN HÀNH & TRIỂN KHAI HỆ THỐNG
## PH DIGITAL EDUCATION (tinhocgenz.io.vn)

Tài liệu hướng dẫn triển khai, cấu hình máy chủ, thiết lập chứng chỉ SSL và quy trình phát hành sản phẩm chính thức.

---

## 1. Kiến Trúc Triển Khai (Production Topology)

* **Frontend SPA / PWA:** Triển khai trên **Vercel** (Edge Network toàn cầu), trỏ domain `hoctructuyen.tinhocgenz.io.vn` và `tinhocgenz.io.vn`.
* **Backend Django REST API:** Triển khai trên **Docker Container / VPS Linux (Ubuntu 22.04 LTS)** hoặc dịch vụ Cloud (Railway / Render).
* **Cơ sở dữ liệu (Database):** **PostgreSQL 16** (Supabase / Neon / Managed PostgreSQL), kết nối chuỗi kết nối qua biến môi trường `DATABASE_URL`.
* **Mạng phân phối & DNS:** **Cloudflare** (Bật Proxied, SSL Full Strict, Web Application Firewall, HSTS).
* **Giám sát & Cảnh báo:** Endpoint `/healthz` kết hợp Uptime Kuma hoặc Better Uptime kiểm tra chu kỳ 30 giây/lần.

---

## 2. Cấu Hình Biến Môi Trường (Production Environment Variables)

### Frontend (Vercel Project Settings)
```env
VITE_API_BASE_URL=https://hoctructuyen.tinhocgenz.io.vn/api/v1
VITE_APP_ENV=production
```

### Backend Django (`.env` trên VPS / Railway)
```env
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=c2VjdXJlX3BoX2VkdV9wcm9kdWN0aW9uX2tleV8yMDI2X3VsdHJhX3NhZmU=
DEBUG=False
ALLOWED_HOSTS=tinhocgenz.io.vn,hoctructuyen.tinhocgenz.io.vn,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://tinhocgenz.io.vn,https://hoctructuyen.tinhocgenz.io.vn
DATABASE_URL=postgres://phedu_admin:YourStrongPassword@127.0.0.1:5432/phedu_production
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
```

---

## 3. Quy Trình Triển Khai Máy Chủ (VPS Ubuntu Step-by-Step)

### Bước 1: Cài đặt Docker & Docker Compose
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
sudo usermod -aG docker $USER
```

### Bước 2: Clone repository và khởi chạy
```bash
git clone https://github.com/HUYJSC/ph-tinhocgenz.git /opt/ph-eduquest
cd /opt/ph-eduquest
docker compose up -d --build
```

### Bước 3: Áp dụng Migrations & Nạp dữ liệu ban đầu
```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python scripts/migrate_all_legacy_data.py
docker compose exec backend python manage.py collectstatic --no-input
```

---

## 4. Kiểm Tra Tình Trạng Sức Khỏe (Healthcheck Verification)
```bash
curl -I http://localhost:8000/healthz
# HTTP/1.1 200 OK
# Content-Type: application/json
# {"status": "healthy", "service": "PH Digital Education Backend"}
```
