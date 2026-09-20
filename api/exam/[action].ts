import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { getSessionFromRequest } from '../_lib/authSession';
import { getSupabaseAdminClient } from '../_lib/supabase';
import { getQuizForServer, stripQuizAnswers } from '../_lib/quizRegistry';
import { scoreQuiz } from '../_lib/serverScoring';
import { issueCertificateToDatabase } from '../_lib/certIssuer';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (setCorsHeaders(req, res)) return;

    const { action } = req.query;
    const act = Array.isArray(action) ? action[0] : action;

    // 1. START: POST /api/exam/start
    if (act === 'start') {
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

            const { quiz_id, idempotency_key } = req.body || {};
            if (!quiz_id) {
                return res.status(400).json({ success: false, error: 'Missing quiz_id' });
            }

            const supabase = getSupabaseAdminClient();
            if (!supabase) {
                return res.status(503).json({ success: false, error: 'Database service unavailable' });
            }
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

    // 2. STATUS: GET /api/exam/status
    if (act === 'status') {
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
            if (!supabase) {
                return res.status(503).json({ success: false, error: 'Database service unavailable' });
            }
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

    // 3. SUBMIT: POST /api/exam/submit
    if (act === 'submit') {
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }

        try {
            const session = await getSessionFromRequest(req);
            if (!session || !session.userId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            if (session.role !== 'student') {
                return res.status(403).json({ success: false, error: 'Only students can submit exams' });
            }

            const { session_id, answers } = req.body || {};
            if (!session_id || !answers) {
                return res.status(400).json({ success: false, error: 'Missing session_id or answers' });
            }

            const supabase = getSupabaseAdminClient();
            if (!supabase) {
                return res.status(503).json({ success: false, error: 'Database service unavailable' });
            }
            
            // Fetch session
            const { data: examSession, error: sessError } = await supabase
                .from('exam_sessions')
                .select('*')
                .eq('id', session_id)
                .single();

            if (sessError || !examSession) {
                return res.status(404).json({ success: false, error: 'Exam session not found' });
            }

            if (examSession.student_id !== session.userId) {
                return res.status(403).json({ success: false, error: 'Forbidden' });
            }

            if (examSession.is_finalized) {
                return res.status(409).json({ success: false, error: 'Exam already submitted' });
            }

            const now = new Date();
            const deadline = new Date(examSession.deadline_at);
            // Allow 60s grace period for network latency
            if (now.getTime() > deadline.getTime() + 60 * 1000) {
                return res.status(400).json({ success: false, error: 'Exam deadline passed' });
            }

            const quiz = getQuizForServer(examSession.quiz_id);
            if (!quiz) {
                return res.status(404).json({ success: false, error: 'Quiz not found' });
            }

            // Score the quiz
            const scoreResult = scoreQuiz(quiz, answers);

            // Update session
            const { error: updateError } = await supabase
                .from('exam_sessions')
                .update({
                    is_finalized: true,
                    submitted_at: now.toISOString(),
                    server_score: scoreResult.total_score,
                    server_max_score: scoreResult.max_score,
                    server_percentage: scoreResult.percentage
                })
                .eq('id', session_id);

            if (updateError) {
                return res.status(500).json({ success: false, error: 'Failed to update exam session' });
            }

            // Insert answers
            const answerInserts = Object.keys(answers).map(qId => ({
                session_id,
                question_id: qId,
                user_answer: answers[qId]
            }));
            
            if (answerInserts.length > 0) {
                await supabase.from('exam_answers').insert(answerInserts);
            }

            // Auto issue certificate if pass (>= 80% passing)
            if (scoreResult.percentage >= 80) {
                const { data: user } = await supabase.from('users').select('student_code, program_track').eq('id', session.userId).single();
                try {
                    await issueCertificateToDatabase(supabase, {
                        studentId: session.userId,
                        quizId: examSession.quiz_id,
                        score: scoreResult.total_score,
                        maxScore: scoreResult.max_score,
                        percentage: scoreResult.percentage,
                        studentCode: user?.student_code || 'STD',
                        track: user?.program_track || 'GEN'
                    });
                } catch (err) {
                    console.error('Cert issue error', err);
                }
            }

            return res.status(200).json({
                success: true,
                data: {
                    score: scoreResult.total_score,
                    max_score: scoreResult.max_score,
                    percentage: scoreResult.percentage,
                    question_results: scoreResult.question_results
                }
            });

        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    return res.status(404).json({ success: false, error: `Hành động exam '${act}' không hợp lệ` });
}
