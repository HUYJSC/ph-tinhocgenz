# KẾ HOẠCH PHỤC HỒI SAU SỰ CỐ (DISASTER RECOVERY PLAN)
## PH DIGITAL EDUCATION — HỆ THỐNG ĐÀO TẠO & KHẢO THÍ

---

## 1. Mục Tiêu Khôi Phục (Recovery Objectives)
* **RPO (Recovery Point Objective):** $\le 1\text{ giờ}$ (Mất mát dữ liệu tối đa không quá 1 giờ).
* **RTO (Recovery Time Objective):** $\le 30\text{ phút}$ (Thời gian phục hồi dịch vụ hoạt động trở lại tối đa 30 phút).

---

## 2. Chiến Lược Sao Lưu (Backup Strategy)
1. **PostgreSQL Automated Dump:**
   - Chạy cron job hằng ngày lúc 02:00 sáng UTC+7.
   - Lưu trữ bản sao lưu nén lên Cloudflare R2 / AWS S3 với tính năng immutability (Object Lock) chống mã độc tống tiền (Ransomware).
   - Lệnh sao lưu định kỳ:
     ```bash
     docker compose exec postgres pg_dump -U phedu_admin -d phedu_production | gzip > /backups/phedu_$(date +%Y%m%d_%H%M%S).sql.gz
     ```
2. **Kịch Bản Khôi Phục Nhanh:**
   ```bash
   # Bước 1: Dừng container backend để tránh ghi dữ liệu xung đột
   docker compose stop backend
   
   # Bước 2: Khôi phục database từ bản sao lưu
   gunzip -c /backups/phedu_latest.sql.gz | docker compose exec -T postgres psql -U phedu_admin -d phedu_production
   
   # Bước 3: Khởi động lại backend và kiểm tra healthcheck
   docker compose start backend
   curl http://localhost:8000/healthz
   ```

---

## 3. Quy Trình Ứng Phó Sự Cố (Incident Response Steps)
1. **Phát hiện:** Uptime Kuma phát hiện endpoint `/healthz` trả về mã lỗi $5xx$ hoặc timeout $\ge 15\text{s}$, tự động gửi cảnh báo Telegram / Zalo tới Ban Quản Trị.
2. **Cách ly:** Tạm chuyển hướng DNS Cloudflare sang trang thông báo bảo trì tĩnh (Maintenance Page).
3. **Điều tra & Khắc phục:** Kiểm tra log container qua `docker compose logs -n 200 backend`.
4. **Phục hồi & Kiểm thử:** Khôi phục database hoặc rollback phiên bản commit git gần nhất, kiểm tra healthcheck đạt `200 OK`.
5. **Mở lại dịch vụ:** Bỏ trang bảo trì trên Cloudflare, gửi báo cáo sự cố (Post-mortem report).
