# KẾ HOẠCH CHUYỂN ĐỔI HỆ THỐNG & ZERO-DOWNTIME (MIGRATION PLAN)
**Dự án:** PH Digital Education LMS  
**Mục tiêu:** Chuyển đổi an toàn từ Client-only React SPA sang Python-first Architecture không gây gián đoạn dịch vụ (Zero-Downtime).

---

## I. CÁC GIAI ĐOẠN CHUYỂN ĐỔI (STAGED PHASES)

```text
  [Phase 0: Audit & Baseline]  ✅ HOÀN TẤT (Đóng băng hiện trạng, phân loại P0-P2)
            │
            ▼
  [Phase 1: Backend Scaffolding] ✅ HOÀN TẤT (Django 5 + DRF + Pytest + Seed data)
            │
            ▼
  [Phase 2: Data Bridge & Auth Adapter] ➔ ĐANG TRIỂN KHAI (API Client, Session Auth)
            │
            ▼
  [Phase 3: Migration Nghiệp Vụ Khảo Thí & Điểm Danh] (Chấm bài, QR xoay vòng Server)
            │
            ▼
  [Phase 4: Tách Biệt Route Độc Lập] (/student, /teacher, /academic, /admin)
            │
            ▼
  [Phase 5: Dockerization & Production Cutover] (PostgreSQL 16, Redis, Celery, Nginx)
```

---

## II. KẾ HOẠCH BẢO VỆ DỮ LIỆU & CHIẾN LƯỢC ROLLBACK

1. **Phương án sao lưu dữ liệu:**
   * Cơ chế `export_legacy_data`: Cho phép trích xuất toàn bộ dữ liệu đang có trong `localStorage` người dùng sang file JSON tiêu chuẩn trước khi xóa cache.
   * Cơ chế `import_legacy_data`: Django management command nạp dữ liệu từ JSON vào PostgreSQL, tự động băm mật khẩu và đối soát trùng lặp.
2. **Kế hoạch Rollback khẩn cấp (Emergency Fallback):**
   * Nếu môi trường Backend gặp sự cố trong quá trình cutover, Git tag `v1.0-legacy-stable` sẵn sàng chuyển hướng toàn bộ traffic Vercel về bản build tĩnh an toàn trong vòng dưới 60 giây qua Cloudflare DNS / Vercel rollback.
