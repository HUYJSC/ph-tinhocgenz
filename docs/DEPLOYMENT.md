# GitHub & Vercel Deployment Guide
# PH – TIN HỌC GEN Z · eduquest-study-app

---

## 1. Cấu trúc CI/CD

```
GitHub (main branch)
    │
    ├── Push/PR → .github/workflows/ci.yml         (TypeScript + build + tests)
    ├── Pull Request → .github/workflows/preview.yml (Vercel Preview URL)
    └── Merge to main → .github/workflows/deploy-production.yml (Vercel Production)
```

---

## 2. Thiết lập GitHub Secrets

Vào **GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Mô tả |
|---|---|
| `VERCEL_TOKEN` | Personal Access Token từ Vercel (Settings → Tokens) |
| `VERCEL_ORG_ID` | Organization ID (lấy từ `vercel env pull` hoặc `.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | Project ID (lấy từ `.vercel/project.json`) |
| `VITE_SUPABASE_URL` | URL Supabase project (public, an toàn để dùng trong build) |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key Supabase |

> **KHÔNG** thêm `SUPABASE_SERVICE_ROLE_KEY` vào GitHub Secrets client-side.  
> Key này chỉ dùng trong Vercel server-side (API routes).

---

## 3. Thiết lập Vercel Environment Variables

Vào **Vercel → Project → Settings → Environment Variables**:

### Production + Preview
| Variable | Scope | Mô tả |
|---|---|---|
| `VITE_SUPABASE_URL` | Production, Preview | Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview | Supabase anon key |
| `CRON_SECRET` | Production | Bảo vệ cron endpoint `/api/cron/*` |
| `SUPABASE_URL` | Production, Preview | URL dùng cho server-side API routes |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | **Server-only** – KHÔNG expose ra frontend |
| `ZALO_APP_ID` | Production | Zalo OA App ID |
| `ZALO_APP_SECRET` | Production | Zalo OA App Secret |
| `ZALO_OA_ID` | Production | Zalo Official Account ID |
| `ZALO_OA_ACCESS_TOKEN` | Production | Zalo OA Access Token |
| `ZALO_OA_REFRESH_TOKEN` | Production | Zalo OA Refresh Token |
| `ZALO_ZBS_TEMPLATE_ID` | Production | Zalo ZBS Template ID |
| `ZALO_INTEGRATION_ENABLED` | Production | `true` / `false` |
| `ZALO_SEND_ENABLED` | Production | `true` / `false` |
| `WEBHOOK_FORWARD_URL` | Production | Webhook SRE monitoring (tuỳ chọn) |

---

## 4. Kết nối Vercel với GitHub

### Lần đầu tiên (one-time setup):
```bash
# Cài Vercel CLI
npm install -g vercel

# Đăng nhập
vercel login

# Liên kết dự án với Vercel (chạy tại thư mục gốc)
vercel link

# Pull env vars về máy local (development)
vercel env pull .env.local
```

### Sau khi liên kết:
1. Vào [vercel.com](https://vercel.com) → **Import Project**
2. Chọn GitHub repo `HUYJSC/ph-tinhocgenz`
3. Framework: **Vite** (Vercel tự detect từ `vercel.json`)
4. Root Directory: `./`
5. Thêm Environment Variables như bảng trên
6. Click **Deploy**

---

## 5. Quy trình làm việc hàng ngày

```bash
# 1. Tạo feature branch
git checkout -b feat/lead-management

# 2. Code, commit
git add .
git commit -m "feat(leads): add lead list page with server-side pagination"

# 3. Push & mở PR
git push origin feat/lead-management
# → GitHub Actions chạy CI (type-check + build + tests)
# → Vercel tạo Preview URL, bot comment vào PR

# 4. Review → Merge vào main
# → GitHub Actions chạy deploy-production.yml
# → Vercel deploy lên Production
```

---

## 6. Kiểm tra Vercel deployment

```bash
# Xem danh sách deployments
vercel ls

# Xem logs deployment gần nhất
vercel logs

# Rollback về deployment trước
vercel rollback
```

---

## 7. Custom Domain

Vào **Vercel → Project → Settings → Domains**:
- Thêm `www.tinhocgenz.io.vn`
- Vercel sẽ cung cấp DNS records để cấu hình tại nhà cung cấp domain
- SSL/TLS được cấp tự động (Let's Encrypt)

---

## 8. Cron Jobs

File `vercel.json` đã cấu hình cron:
```json
{
  "crons": [
    {
      "path": "/api/cron/notification-weekly",
      "schedule": "0 12 * * 0"
    }
  ]
}
```

> Cron chạy mỗi **Chủ Nhật 12:00 UTC** (19:00 ICT).  
> Endpoint được bảo vệ bằng `CRON_SECRET` header.

---

## 9. Rollback khẩn cấp

```bash
# Nếu production bị lỗi sau deploy:
vercel rollback [deployment-url]

# Hoặc trong GitHub:
git revert HEAD
git push origin main
# → Tự động trigger deploy mới với code đã revert
```

---

## 10. Checklist trước khi push lên production

- [ ] `npm run typecheck` — không có lỗi TypeScript
- [ ] `npm run build` — build thành công
- [ ] `npm test` — tests pass
- [ ] Không có secret nào trong code (kiểm tra `grep -r "service_role" src/`)
- [ ] Environment variables đã cấu hình đúng trong Vercel
- [ ] `vercel.json` hợp lệ (validate tại [vercel.com/docs](https://vercel.com/docs))
