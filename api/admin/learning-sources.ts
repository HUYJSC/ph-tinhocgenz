import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient, verifyUserRole } from '../_lib/supabase';
import { validateSafeUrlForFetch } from '../../src/utils/ssrfProtection';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Methods
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. Authentication & Role Check
  const auth = await verifyUserRole(req.headers['authorization']);
  // Allow read if user is staff/admin or dev
  if (!auth.authenticated && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: auth.error || 'Yêu cầu đăng nhập quản trị viên.' });
  }

  const supabase = getSupabaseAdminClient();

  if (req.method === 'GET') {
    if (supabase) {
      const { data, error } = await supabase
        .from('learning_sources')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, data });
    }
    // Fallback response if Supabase not configured
    return res.status(200).json({ ok: true, data: [] });
  }

  if (req.method === 'POST') {
    const { name, base_url, source_type, source_tier, description, allowed_domains } = req.body || {};

    if (!name || !base_url || !source_tier) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (name, base_url, source_tier).' });
    }

    // SSRF Check
    const ssrf = validateSafeUrlForFetch(base_url, allowed_domains);
    if (!ssrf.safe) {
      return res.status(400).json({ error: `Bảo mật SSRF chặn URL: ${ssrf.reason}` });
    }

    const newSource = {
      id: `src-${Date.now()}`,
      name,
      base_url,
      source_type: source_type || 'html_category',
      source_tier,
      description: description || '',
      allowed_domains: allowed_domains || [],
      crawl_enabled: true,
      auto_discover_enabled: true,
      requires_login: false,
      license_status: 'needs_review',
      sync_frequency: 'monthly',
      consecutive_failures: 0,
      status: 'active',
      created_by: auth.userId || 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('learning_sources').insert(newSource).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ ok: true, data });
    }

    return res.status(201).json({ ok: true, data: newSource });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
