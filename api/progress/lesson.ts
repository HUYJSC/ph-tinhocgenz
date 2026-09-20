import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { getSessionFromRequest } from '../_lib/authSession';
import { getSupabaseAdminClient } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (setCorsHeaders(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const session = await getSessionFromRequest(req);
        if (!session || !session.userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { lesson_id, is_completed, position_seconds } = req.body;
        if (!lesson_id) {
            return res.status(400).json({ success: false, error: 'Missing lesson_id' });
        }

        const supabase = getSupabaseAdminClient();
        if (!supabase) {
            return res.status(503).json({ success: false, error: 'Database service unavailable' });
        }
        
        const updates: any = {
            student_id: session.userId,
            lesson_id: lesson_id,
            updated_at: new Date().toISOString()
        };
        
        if (is_completed !== undefined) {
            updates.is_completed = is_completed;
            if (is_completed) {
                updates.completed_at = new Date().toISOString();
            }
        }
        
        if (position_seconds !== undefined) {
            updates.last_position_seconds = position_seconds;
        }

        const { error } = await supabase
            .from('lesson_progress')
            .upsert(updates, { onConflict: 'student_id, lesson_id' });

        if (error) {
            return res.status(500).json({ success: false, error: 'Failed to update progress' });
        }

        return res.status(200).json({ success: true });

    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
