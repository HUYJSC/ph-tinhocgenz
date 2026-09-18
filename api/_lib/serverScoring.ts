export interface QuestionResult {
    question_id: string;
    user_answer: any;
    is_correct: boolean;
    score_earned: number;
    max_points: number;
}

export function scoreQuiz(quiz: any, answers: Record<string, any>): {
    question_results: QuestionResult[];
    total_score: number;
    max_score: number;
    percentage: number;
    correct_count: number;
} {
    const results: QuestionResult[] = [];
    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;

    for (const question of quiz.questions) {
        const userAnswer = answers[question.id];
        let isCorrect = false;
        let scoreEarned = 0;
        const maxPoints = question.points || 1;

        if (userAnswer !== undefined) {
            if (question.type === 'single' || question.type === 'true-false') {
                isCorrect = userAnswer === question.correctAnswer;
            } else if (question.type === 'multiple') {
                const correctSet = new Set(question.correctAnswer as string[]);
                const userSet = new Set(userAnswer as string[]);
                if (correctSet.size === userSet.size && [...correctSet].every(val => userSet.has(val))) {
                    isCorrect = true;
                }
            } else if (question.type === 'fill-blank') {
                const correctAnsStr = String(question.correctAnswer).toLowerCase().trim();
                const userAnsStr = String(userAnswer).toLowerCase().trim();
                isCorrect = correctAnsStr === userAnsStr;
            } else if (question.type === 'matching') {
                // Simple implementation
                const correctMatches = question.correctAnswer as Record<string, string>; // left -> right
                const userMatches = userAnswer as Record<string, string>;
                const correctKeys = Object.keys(correctMatches);
                
                let matchesCorrect = 0;
                for (const key of correctKeys) {
                    if (correctMatches[key] === userMatches[key]) {
                        matchesCorrect++;
                    }
                }
                
                if (matchesCorrect === correctKeys.length) {
                    isCorrect = true;
                }
            }
        }

        if (isCorrect) {
            scoreEarned = maxPoints;
            correctCount++;
        }
        
        totalScore += scoreEarned;
        maxScore += maxPoints;
        
        results.push({
            question_id: question.id,
            user_answer: userAnswer,
            is_correct: isCorrect,
            score_earned: scoreEarned,
            max_points: maxPoints
        });
    }
    
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    
    return {
        question_results: results,
        total_score: totalScore,
        max_score: maxScore,
        percentage,
        correct_count: correctCount
    };
}
