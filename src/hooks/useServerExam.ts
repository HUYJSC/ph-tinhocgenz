import { useState, useEffect, useCallback, useRef } from 'react';
import { ExamApiService } from '../services/api/examService';
import type { QuestionForClient, ExamResult } from '../types/exam';

export interface UseServerExamProps {
  quizId: string;
  onFinish: (result: ExamResult) => void;
  onError: (error: string) => void;
}

export function useServerExam({ quizId, onFinish, onError }: UseServerExamProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionForClient[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deadlineRef = useRef<string | null>(null);

  const startExam = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: apiError } = await ExamApiService.startExam(quizId);
    if (apiError || !data) {
      setError(apiError || 'Failed to start exam');
      onError(apiError || 'Failed to start exam');
      setIsLoading(false);
      return;
    }
    
    setSessionId(data.session_id);
    setQuestions(data.questions);
    deadlineRef.current = data.deadline_at;
    setIsLoading(false);
  }, [quizId, onError]);

  const setAnswer = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  const submitExam = useCallback(async () => {
    if (!sessionId || isSubmitting || isFinalized) return;
    setIsSubmitting(true);
    
    const { data, error: submitError } = await ExamApiService.submitExam({
      session_id: sessionId,
      answers
    });
    
    setIsSubmitting(false);
    if (submitError || !data) {
      setError(submitError || 'Failed to submit exam');
      onError(submitError || 'Failed to submit exam');
      return;
    }
    
    setIsFinalized(true);
    onFinish(data);
  }, [sessionId, answers, isSubmitting, isFinalized, onFinish, onError]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }, [questions.length]);

  const nextQuestion = useCallback(() => {
    goToQuestion(currentIndex + 1);
  }, [currentIndex, goToQuestion]);

  const prevQuestion = useCallback(() => {
    goToQuestion(currentIndex - 1);
  }, [currentIndex, goToQuestion]);

  // Timer logic
  useEffect(() => {
    if (!deadlineRef.current || isFinalized) return;

    const updateTimer = () => {
      const deadlineTime = new Date(deadlineRef.current!).getTime();
      const now = Date.now();
      const diff = Math.floor((deadlineTime - now) / 1000);
      
      if (diff <= 0) {
        setRemainingSeconds(0);
        submitExam();
      } else {
        setRemainingSeconds(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isFinalized, submitExam]);

  // Sync logic
  useEffect(() => {
    if (!sessionId || isFinalized) return;
    const interval = setInterval(async () => {
      const { data } = await ExamApiService.getExamStatus(sessionId);
      if (data && data.is_finalized && !isFinalized) {
        submitExam();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [sessionId, isFinalized, submitExam]);

  return {
    sessionId,
    questions,
    answers,
    currentIndex,
    remainingSeconds,
    isLoading,
    isSubmitting,
    isFinalized,
    error,
    startExam,
    setAnswer,
    submitExam,
    goToQuestion,
    nextQuestion,
    prevQuestion
  };
}
