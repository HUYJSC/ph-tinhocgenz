import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient } from '../../_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const appId = process.env.ZALO_APP_ID || '3389337624368807364';

  // Xử lý gửi Form hoặc API POST / GET query
  if (req.method === 'POST' || (req.method === 'GET' && req.query.access_token)) {
    const body = req.body || {};
    const accessToken = (body.access_token || req.query.access_token || '').toString().trim();
    const refreshToken = (body.refresh_token || req.query.refresh_token || '').toString().trim();
    const oaId = (body.oa_id || req.query.oa_id || 'PH_DIGITAL_EDU_OFFICIAL').toString().trim();

    if (!accessToken) {
      return res.status(400).json({ error: 'Vui lòng cung cấp Access Token hợp lệ.' });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return res.status(500).json({ error: 'Chưa cấu hình Supabase Serverless.' });
    }

    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const { error: upsertError } = await supabase.from('zalo_oauth_tokens').upsert({
        oa_id: oaId,
        app_id: appId,
        access_token: accessToken,
        refresh_token: refreshToken || accessToken,
        expires_at: expiresAt,
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'oa_id' });

      if (upsertError) {
        return res.status(500).json({ error: `Lỗi lưu DB Supabase: ${upsertError.message}` });
      }

      // Kiểm tra token trực tiếp với Zalo API
      let oaProfile = null;
      try {
        const verifyRes = await fetch('https://openapi.zalo.me/v2.0/oa/getoa', {
          headers: { access_token: accessToken }
        });
        oaProfile = await verifyRes.json();
      } catch (err) {
        // bỏ qua nếu lỗi mạng ngoài
      }

      if (req.headers['content-type']?.includes('application/json') || req.query.format === 'json') {
        return res.status(200).json({
          success: true,
          message: 'Nạp Zalo OA Token thành công!',
          oa_id: oaId,
          verified: oaProfile?.error === 0,
          oa_info: oaProfile?.data || null
        });
      }

      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Nạp Token Zalo OA Thành Công</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #090d16; color: #f1f5f9; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 90vh; }
            .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 36px; max-width: 520px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; }
            .badge { display: inline-flex; align-items: center; gap: 8px; background: #064e3b; color: #34d399; font-weight: 600; font-size: 14px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 20px; border: 1px solid #059669; }
            h2 { color: #38bdf8; margin: 0 0 12px 0; font-size: 24px; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; }
            .info-box { background: #0b1120; border: 1px solid #1e293b; border-radius: 10px; padding: 16px; text-align: left; font-size: 13px; font-family: monospace; color: #a5f3fc; margin-bottom: 24px; word-break: break-all; }
            .btn { display: inline-block; background: linear-gradient(135deg, #0284c7, #2563eb); color: #fff; font-weight: 600; padding: 12px 28px; border-radius: 8px; text-decoration: none; transition: 0.2s; }
            .btn:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">✓ ĐÃ KÍCH HOẠT TOKEN ZALO OA</div>
            <h2>Nạp Token Thành Công!</h2>
            <p>Hệ thống Tin Học Gen Z đã nhận diện và kích hoạt Token Zalo OA vào cơ sở dữ liệu production.</p>
            <div class="info-box">
              <div><strong>OA ID:</strong> ${oaId}</div>
              <div style="margin-top: 6px;"><strong>App ID:</strong> ${appId}</div>
              <div style="margin-top: 6px;"><strong>Trạng thái:</strong> Active (Bypass OAuth thành công)</div>
              ${oaProfile?.data?.oa_name ? `<div style="margin-top: 6px; color: #34d399;"><strong>Tên OA:</strong> ${oaProfile.data.oa_name}</div>` : ''}
            </div>
            <a href="/admin" class="btn">Vào Trang Quản Trị Hệ Thống</a>
          </div>
        </body>
        </html>
      `);
    } catch (err: any) {
      return res.status(500).json({ error: `Lỗi xử lý: ${err.message}` });
    }
  }

  // GET request mà chưa có param -> Hiển thị form nạp trực quan
  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Cổng Nạp Token Zalo OA Nhanh (Bypass Tool)</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #090d16; color: #f1f5f9; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 90vh; margin: 0; }
        .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 36px; max-width: 580px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        h1 { color: #38bdf8; margin: 0 0 8px 0; font-size: 22px; font-weight: 700; }
        p.subtitle { color: #94a3b8; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5; }
        .step-guide { background: #0f172a; border-left: 4px solid #38bdf8; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; font-size: 13px; color: #cbd5e1; }
        .step-guide a { color: #38bdf8; text-decoration: underline; font-weight: 600; }
        .form-group { margin-bottom: 20px; text-align: left; }
        label { display: block; font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; }
        input, textarea { width: 100%; box-sizing: border-box; background: #0b1120; border: 1px solid #334155; border-radius: 8px; padding: 12px; color: #f8fafc; font-size: 14px; outline: none; transition: 0.2s; }
        input:focus, textarea:focus { border-color: #38bdf8; box-shadow: 0 0 0 2px rgba(56,189,248,0.2); }
        textarea { resize: vertical; min-height: 80px; font-family: monospace; font-size: 12px; }
        .btn-submit { width: 100%; background: linear-gradient(135deg, #0284c7, #2563eb); color: white; font-weight: 600; padding: 14px; border-radius: 8px; border: none; cursor: pointer; font-size: 15px; margin-top: 8px; transition: 0.2s; }
        .btn-submit:hover { opacity: 0.9; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>⚡ Cổng Nạp Token Zalo OA (Bypass)</h1>
        <p class="subtitle">Không cần xác thực domain, không cần đăng ký Callback URL. Lấy token trực tiếp từ Zalo Developer rồi dán vào đây.</p>

        <div class="step-guide">
          <strong>Cách lấy Token trong 30 giây:</strong><br/>
          1. Mở công cụ chính thức của Zalo: <a href="https://developers.zalo.me/tools/explorer" target="_blank">Zalo API Explorer ↗</a><br/>
          2. Chọn <strong>Ứng dụng: 3389337624368807364</strong>, Loại token: <strong>Official Account</strong>, Chọn OA của bạn.<br/>
          3. Bấm <strong>Lấy Token</strong> rồi copy dán vào ô bên dưới.
        </div>

        <form method="POST" action="/api/zalo/oauth/manual">
          <div class="form-group">
            <label for="oa_id">Official Account ID (Mã OA của bạn)</label>
            <input type="text" id="oa_id" name="oa_id" placeholder="Ví dụ: 382910481239841..." required />
          </div>

          <div class="form-group">
            <label for="access_token">Zalo OA Access Token</label>
            <textarea id="access_token" name="access_token" placeholder="Dán chuỗi access_token từ API Explorer vào đây..." required></textarea>
          </div>

          <div class="form-group">
            <label for="refresh_token">Zalo OA Refresh Token (Tùy chọn)</label>
            <textarea id="refresh_token" name="refresh_token" placeholder="Dán refresh_token (nếu có) để tự động gia hạn..."></textarea>
          </div>

          <button type="submit" class="btn-submit">🚀 Lưu Token & Kích Hoạt Hệ Thống Ngay</button>
        </form>
      </div>
    </body>
    </html>
  `);
}
