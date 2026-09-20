import type { Quiz } from '../../src/types/quiz';

// Fallback or server registry for quizzes. In a real app, this should come from the database.
export const SERVER_QUIZ_REGISTRY: Record<string, Quiz> = {
    'q_demo_1': {
        id: 'q_demo_1',
        title: 'Demo Quiz',
        description: 'Demo Quiz',
        category: 'all',
        difficulty: 'easy',
        timeLimitMinutes: 15,
        passingScore: 80,
        icon: 'HelpCircle',
        badgeColor: '#0057B8',
        questions: [
            {
                id: 'q1',
                type: 'single',
                prompt: 'What is 1 + 1?',
                options: ['1', '2'],
                correctAnswer: 1,
                explanation: '1 + 1 = 2',
                points: 10
            }
        ]
    }
};

export function getQuizForServer(quizId: string): Quiz | null {
    return SERVER_QUIZ_REGISTRY[quizId] || null;
}

export function stripQuizAnswers(quiz: Quiz): any {
    const questionsWithoutAnswers = quiz.questions.map((q: any) => {
        const qCopy = { ...q };
        delete qCopy.correctAnswer;
        if (qCopy.type === 'matching') {
            qCopy.pairs = qCopy.pairs?.map((p: any) => {
                const pCopy = { ...p };
                delete pCopy.right;
                return pCopy;
            });
        }
        return qCopy;
    });
    
    return {
        ...quiz,
        questions: questionsWithoutAnswers
    };
}
