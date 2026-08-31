# KIẾN TRÚC HỆ THỐNG MỤC TIÊU (PYTHON-FIRST SYSTEM ARCHITECTURE)
**Nền tảng:** PH Digital Education  
**Kiến trúc:** Python 3.11/3.13 + Django 5.x + Django REST Framework + PostgreSQL + Redis + Celery + Nginx  
**Tiêu chuẩn:** Micro-modular Monolith (Apps-based), RESTful API & Server-Rendered Admin, Headless-ready for Mobile App.

---

## I. MÔ HÌNH KIẾN TRÚC TỔNG THỂ (HIGH-LEVEL ARCHITECTURE)

```text
               ┌────────────────────────────────────────────────────────┐
               │              CLIENT APPLICATIONS                       │
               │   • Web Application (Vite / React / HTMX)              │
               │   • Mobile Native App (Flutter / React Native)         │
               │   • Public Verification Portal (/verify/<code/>)       │
               └──────────────────────────┬─────────────────────────────┘
                                          │ HTTPS (TLS 1.3)
                                          ▼
               ┌────────────────────────────────────────────────────────┐
               │          REVERSE PROXY & GATEWAY (NGINX)               │
               │   • Rate Limiting, SSL Termination, Compression        │
               │   • Static/Media Assets Serving, Security Headers      │
               └──────────────────────────┬─────────────────────────────┘
                                          │ WSGI / ASGI
                                          ▼
               ┌────────────────────────────────────────────────────────┐
               │       CORE PYTHON BACKEND (DJANGO 5.X + DRF)           │
               │  ┌──────────────────┐  ┌──────────────────┐            │
               │  │  apps.accounts   │  │   apps.courses   │            │
               │  ├──────────────────┤  ├──────────────────┤            │
               │  │  apps.classes    │  │  apps.attendance │            │
               │  ├──────────────────┤  ├──────────────────┤            │
               │  │ apps.assessments │  │ apps.assignments │            │
               │  ├──────────────────┤  ├──────────────────┤            │
               │  │apps.certificates │  │  apps.analytics  │            │
               │  └──────────────────┘  └──────────────────┘            │
               └───────────┬────────────────────────────┬───────────────┘
                           │                            │
             PostgreSQL 16+│              Redis Protocol│
                           ▼                            ▼
              ┌────────────────────────┐   ┌────────────────────────┐
              │     DATABASE (ACID)    │   │  CACHE & MESSAGE BROKER│
              │  • Relational Data     │   │  • Session Store       │
              │  • JSONB Indexing      │   │  • Rate Limit State    │
              │  • Audit Trail Logs    │   │  • Celery Task Queue   │
              └────────────────────────┘   └────────────┬───────────┘
                                                        │
                                                        ▼
                                           ┌────────────────────────┐
                                           │  ASYNC WORKERS (CELERY)│
                                           │  • Tự động chấm bài    │
                                           │  • Xuất bảng điểm Excel│
                                           │  • Gửi email thông báo │
                                           └────────────────────────┘
```

---

## II. QUY TẮC CÔNG NGHỆ VÀ TỔ CHỨC SOURCE CODE

1. **Python là lõi duy nhất quyết định nghiệp vụ (Single Source of Truth):**
   * Toàn bộ tính toán điểm số, xếp loại, cảnh báo học vụ, phân quyền đều nằm trong các service layer Python.
   * Client (Web hay Mobile) chỉ đóng vai trò hiển thị (Presentation Layer) và gọi API.
2. **Cấu trúc thư mục mục tiêu `backend/`:**
   ```text
   backend/
   ├── apps/
   │   ├── accounts/
   │   ├── courses/
   │   ├── classes/
   │   ├── schedules/
   │   ├── attendance/
   │   ├── assessments/
   │   ├── assignments/
   │   ├── certificates/
   │   ├── analytics/
   │   └── audit/
   ├── config/
   │   ├── settings/
   │   │   ├── base.py
   │   │   ├── local.py
   │   │   └── production.py
   │   ├── urls.py
   │   ├── celery.py
   │   ├── asgi.py
   │   └── wsgi.py
   ├── manage.py
   ├── pyproject.toml
   ├── requirements.txt
   └── Dockerfile
   ```
3. **Cơ chế xác thực (Authentication Strategy):**
   * Web SPA / Django Views: Session Cookies có cờ `HttpOnly`, `SameSite=Lax`, `Secure`.
   * Mobile API: Token / JWT ngắn hạn kèm Refresh Token lưu trữ an toàn trong Secure Keystore / Keychain.
