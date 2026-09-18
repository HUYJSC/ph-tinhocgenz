import type { Quiz } from '../../src/types/quiz';

// Fallback or server registry for quizzes. In a real app, this should come from the database.
export const SERVER_QUIZ_REGISTRY: Record<string, Quiz> = {
    'q_demo_1': {
        id: 'q_demo_1',
        title: 'Demo Quiz',
        description: 'Demo Quiz',
        timeLimitMinutes: 15,
        passingScore: 80,
        questions: [
            {
                id: 'q1',
                type: 'single',
                text: 'What is 1 + 1?',
                options: [{ id: 'o1', text: '1' }, { id: 'o2', text: '2' }],
                correctAnswer: 'o2'
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
