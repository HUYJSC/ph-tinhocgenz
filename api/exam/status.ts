import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { getSessionFromRequest } from '../_lib/authSession';
import { getSupabaseAdminClient } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (setCorsHeaders(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const session = await getSessionFromRequest(req);
        if (!session || !session.userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { session_id } = req.query;
        if (!session_id || typeof session_id !== 'string') {
            return res.status(400).json({ success: false, error: 'Missing session_id' });
        }

        const supabase = getSupabaseAdminClient();
        const { data, error } = await supabase
            .from('exam_sessions')
            .select('is_finalized, submitted_at, server_score, server_percentage, deadline_at')
            .eq('id', session_id)
            .eq('student_id', session.userId)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        let remaining_seconds = 0;
        if (!data.is_finalized) {
            const diff = new Date(data.deadline_at).getTime() - Date.now();
            remaining_seconds = diff > 0 ? Math.floor(diff / 1000) : 0;
        }

        return res.status(200).json({
            success: true,
            data: {
                is_finalized: data.is_finalized,
                submitted_at: data.submitted_at,
                server_score: data.server_score,
                server_percentage: data.server_percentage,
                remaining_seconds
            }
        });

    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
