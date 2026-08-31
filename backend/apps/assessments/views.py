from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from .models import Question, Exam, ExamAttempt
from .serializers import QuestionPublicSerializer, ExamSerializer, ExamAttemptSerializer

class ExamListView(generics.ListAPIView):
    queryset = Exam.objects.filter(is_published=True)
    serializer_class = ExamSerializer
    permission_classes = [AllowAny]

class ExamDetailView(generics.RetrieveAPIView):
    queryset = Exam.objects.filter(is_published=True)
    serializer_class = ExamSerializer
    permission_classes = [AllowAny]

class ExamSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        try:
            exam = Exam.objects.get(id=exam_id)
        except Exam.DoesNotExist:
            return Response({"error": "Đề thi không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        answers = request.data.get("answers", {})
        switch_tab_count = request.data.get("switch_tab_count", 0)

        # Lấy tất cả câu hỏi thuộc môn này
        questions = Question.objects.filter(course=exam.course)
        total_questions = questions.count()
        if total_questions == 0:
            total_questions = len(answers) or 1

        # Chấm điểm Server-side bảo mật!
        correct_count = 0
        for q in questions:
            user_choice = answers.get(q.id)
            if user_choice and user_choice == q.correct_answer_id:
                correct_count += 1

        percentage = round((correct_count / total_questions) * 100, 1)
        is_passed = percentage >= exam.passing_percentage

        attempt = ExamAttempt.objects.create(
            exam=exam,
            student=request.user,
            submitted_at=timezone.now(),
            score=correct_count,
            total_questions=total_questions,
            percentage=percentage,
            is_passed=is_passed,
            switch_tab_count=switch_tab_count,
            answers_draft=answers
        )

        return Response({
            "message": "Nộp bài thi thành công.",
            "attempt_id": str(attempt.id),
            "score": correct_count,
            "total_questions": total_questions,
            "percentage": percentage,
            "is_passed": is_passed
        }, status=status.HTTP_201_CREATED)
