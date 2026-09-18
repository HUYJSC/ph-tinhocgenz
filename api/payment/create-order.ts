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

        const { course_id, gateway } = req.body;
        if (!course_id || !gateway) {
            return res.status(400).json({ success: false, error: 'Missing course_id or gateway' });
        }

        const supabase = getSupabaseAdminClient();
        
        // Mock get course price
        const { data: course, error: cError } = await supabase
            .from('courses')
            .select('price_vnd')
            .eq('id', course_id)
            .single();
            
        if (cError || !course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        const amount = course.price_vnd;

        const { data, error } = await supabase
            .from('payments')
            .insert({
                student_id: session.userId,
                course_id,
                amount_vnd: amount,
                gateway,
                status: 'pending'
            })
            .select('id')
            .single();

        if (error) {
            return res.status(500).json({ success: false, error: 'Failed to create order' });
        }

        return res.status(200).json({
            success: true,
            data: {
                order_id: data.id,
                payment_url: gateway === 'manual' ? null : `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?order_id=${data.id}`,
                instructions: gateway === 'manual' ? 'Please bank transfer with content: ' + data.id : null
            }
        });

    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
