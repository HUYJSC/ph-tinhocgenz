from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionSerializer
from apps.accounts.permissions import IsTeacherOrAdmin, IsOwnerOrStaff

class AssignmentViewSet(viewsets.ModelViewSet):
    """
    Quản lý bài tập thực hành:
    - Giáo viên/Admin: Tạo/Sửa/Xóa.
    - Học viên: Xem danh sách bài tập đang mở.
    - Tối ưu select_related("course", "teacher").
    """
    queryset = Assignment.objects.filter(is_deleted=False).select_related("course", "teacher")
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def perform_destroy(self, instance):
        instance.soft_delete()

class SubmissionViewSet(viewsets.ModelViewSet):
    """
    Nộp bài tập và chấm điểm bài tập:
    - Học viên: Nộp bài của mình.
    - Giảng viên: Chấm điểm, phản hồi nhận xét.
    - Tối ưu select_related("assignment", "student", "graded_by").
    """
    queryset = Submission.objects.filter(is_deleted=False).select_related(
        "assignment", "student", "graded_by"
    )
    serializer_class = SubmissionSerializer

    def get_permissions(self):
        if self.action in ["grade"]:
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role in ["admin", "academic", "teacher"]:
            assignment_id = self.request.query_params.get("assignment_id")
            if assignment_id:
                return qs.filter(assignment_id=assignment_id)
            return qs
        return qs.filter(student=user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsTeacherOrAdmin])
    def grade(self, request, pk=None):
        """Giảng viên chấm điểm và nhập nhận xét cho bài nộp."""
        submission = self.get_object()
        score = request.data.get("score")
        feedback = request.data.get("feedback", "")

        if score is None:
            return Response({"error": "Vui lòng nhập điểm số (0 - 10)."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            score_float = float(score)
            if not (0 <= score_float <= 10):
                raise ValueError()
        except ValueError:
            return Response({"error": "Điểm số phải nằm trong thang điểm 0 - 10."}, status=status.HTTP_400_BAD_REQUEST)

        submission.score = score_float
        submission.feedback = feedback
        submission.graded_by = request.user
        submission.graded_at = timezone.now()
        submission.save()

        return Response({
            "message": "Đã chấm điểm bài tập thành công!",
            "submission": SubmissionSerializer(submission).data
        })
