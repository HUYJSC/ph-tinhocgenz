import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return cachedClient;
}

export interface AuthRoleCheck {
  authenticated: boolean;
  role?: 'student' | 'teacher' | 'admin' | 'service_role';
  userId?: string;
  error?: string;
}

/**
 * Verify user role from Authorization header (Bearer <access_token>)
 */
export async function verifyUserRole(authHeader?: string): Promise<AuthRoleCheck> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or malformed Authorization header' };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const supabase = getSupabaseAdminClient();

  // If Supabase not configured in env, allow role rejection cleanly
  if (!supabase) {
    return { authenticated: false, error: 'Supabase server environment is not configured' };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { authenticated: false, error: error?.message || 'Invalid or expired session token' };
    }

    const role = (user.user_metadata?.role || user.app_metadata?.role || 'student') as 'student' | 'teacher' | 'admin';
    return {
      authenticated: true,
      role,
      userId: user.id
    };
  } catch (err: any) {
    return { authenticated: false, error: err?.message || 'Token verification failed' };
  }
}
