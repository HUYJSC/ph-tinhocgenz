import type { Quiz, Question } from '../../src/types/quiz';

// Fallback or server registry for quizzes. In a real app, this should come from the database.
export const SERVER_QUIZ_REGISTRY: Record<string, Quiz> = {
    'q_demo_1': {
        id: 'q_demo_1',
        title: 'Demo Quiz',
        description: 'Demo Quiz',
        category: 'all',
        difficulty: 'easy',
        timeLimitMinutes: 15,
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

type QuestionWithoutAnswer = Omit<Question, 'correctAnswer' | 'matchingPairs'> & {
    correctAnswer?: never;
    pairs?: Array<{ id: string; left: string }>;
};

type QuizStripped = Omit<Quiz, 'questions'> & { questions: QuestionWithoutAnswer[] };

export function stripQuizAnswers(quiz: Quiz): QuizStripped {
    const questionsWithoutAnswers: QuestionWithoutAnswer[] = quiz.questions.map((q) => {
        const { correctAnswer: _ca, matchingPairs, ...qRest } = q;
        const stripped: QuestionWithoutAnswer = { ...qRest };
        if (q.type === 'matching' && matchingPairs) {
            stripped.pairs = matchingPairs.map(({ id, left }) => ({ id, left }));
        }
        return stripped;
    });
    
    return {
        ...quiz,
        questions: questionsWithoutAnswers
    };
}
