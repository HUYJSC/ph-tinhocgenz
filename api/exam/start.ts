import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { getSessionFromRequest } from '../_lib/authSession';
import { getSupabaseAdminClient } from '../_lib/supabase';
import { getQuizForServer, stripQuizAnswers } from '../_lib/quizRegistry';
import crypto from 'crypto';

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
        if (session.role !== 'student') {
            return res.status(403).json({ success: false, error: 'Only students can take exams' });
        }

        const { quiz_id, idempotency_key } = req.body;
        if (!quiz_id) {
            return res.status(400).json({ success: false, error: 'Missing quiz_id' });
        }

        const supabase = getSupabaseAdminClient();
        const quiz = getQuizForServer(quiz_id);
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        const idemKey = idempotency_key || crypto.randomBytes(16).toString('hex');
        const timeLimitMinutes = quiz.timeLimitMinutes || 60;
        const deadlineDate = new Date(Date.now() + timeLimitMinutes * 60 * 1000);

        // Check active session
        const { data: existingSessions, error: findError } = await supabase
            .from('exam_sessions')
            .select('*')
            .eq('student_id', session.userId)
            .eq('quiz_id', quiz_id)
            .order('started_at', { ascending: false })
            .limit(1);

        if (!findError && existingSessions && existingSessions.length > 0) {
            const existing = existingSessions[0];
            if (existing.is_finalized) {
                return res.status(409).json({ success: false, error: 'Bạn đã hoàn thành bài thi này' });
            }
            if (new Date(existing.deadline_at) > new Date()) {
                const strippedQuiz = stripQuizAnswers(quiz);
                return res.status(200).json({
                    success: true,
                    data: {
                        session_id: existing.id,
                        deadline_at: existing.deadline_at,
                        time_limit_seconds: timeLimitMinutes * 60,
                        questions: strippedQuiz.questions
                    }
                });
            }
        }

        // Insert new session
        const { data: newSession, error: insertError } = await supabase
            .from('exam_sessions')
            .insert({
                student_id: session.userId,
                quiz_id,
                deadline_at: deadlineDate.toISOString(),
                idempotency_key: idemKey
            })
            .select()
            .single();

        if (insertError) {
            return res.status(500).json({ success: false, error: 'Failed to start exam session' });
        }

        const strippedQuiz = stripQuizAnswers(quiz);
        return res.status(200).json({
            success: true,
            data: {
                session_id: newSession.id,
                deadline_at: newSession.deadline_at,
                time_limit_seconds: timeLimitMinutes * 60,
                questions: strippedQuiz.questions
            }
        });

    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
