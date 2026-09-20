import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors.js';
import { getSessionFromRequest } from '../_lib/authSession.js';
import { getQuizForServer, stripQuizAnswers } from '../_lib/quizRegistry.js';

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

        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, error: 'Missing quiz id' });
        }

        const quiz = getQuizForServer(id);
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        const safeQuiz = stripQuizAnswers(quiz);

        return res.status(200).json({
            success: true,
            data: safeQuiz
        });

    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
