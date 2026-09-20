import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors.js';
import { getSupabaseAdminClient } from '../_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (setCorsHeaders(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, error: 'Missing cert id' });
        }

        const supabase = getSupabaseAdminClient();
        if (!supabase) {
            return res.status(503).json({ success: false, error: 'Database service unavailable' });
        }
        const { data, error } = await supabase
            .from('certificates')
            .select('*, users(full_name), courses(title)')
            .eq('certificate_id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: true, data: { valid: false } });
        }

        return res.status(200).json({
            success: true,
            data: {
                valid: data.status === 'valid',
                certificate_id: data.certificate_id,
                student_name: data.users?.full_name,
                course_title: data.courses?.title,
                issued_at: data.issued_at,
                final_score: data.final_score
            }
        });

    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
