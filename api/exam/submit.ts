import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { getSessionFromRequest } from '../_lib/authSession';
import { getSupabaseAdminClient } from '../_lib/supabase';
import { getQuizForServer } from '../_lib/quizRegistry';
import { scoreQuiz } from '../_lib/serverScoring';
import { issueCertificateToDatabase } from '../_lib/certIssuer';

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
            return res.status(403).json({ success: false, error: 'Only students can submit exams' });
        }

        const { session_id, answers } = req.body;
        if (!session_id || !answers) {
            return res.status(400).json({ success: false, error: 'Missing session_id or answers' });
        }

        const supabase = getSupabaseAdminClient();
        
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

        const deadline = new Date(examSession.deadline_at);
        const now = new Date();
        // Allow 60 seconds grace period
        if (now.getTime() - deadline.getTime() > 60000) {
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

        // Auto issue certificate if pass (assume 80% passing)
        if (scoreResult.percentage >= (quiz.passingScore || 80)) {
            // Get student info
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
