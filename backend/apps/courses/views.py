from rest_framework import viewsets, generics, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Course, ClassGroup, ClassEnrollment
from .serializers import CourseSerializer, ClassGroupSerializer, ClassEnrollmentSerializer
from apps.accounts.permissions import IsAdmin, IsTeacherOrAdmin

class CourseViewSet(viewsets.ModelViewSet):
    """
    CRUD cho 10 Chương trình đào tạo:
    - Xem danh sách: Public (AllowAny).
    - Tạo/Sửa/Xóa: Admin.
    """
    queryset = Course.objects.filter(is_deleted=False)
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdmin()]

    def perform_destroy(self, instance):
        instance.soft_delete()

class ClassGroupViewSet(viewsets.ModelViewSet):
    """
    CRUD cho Lớp học thực tế (ClassGroup):
    - Tối ưu truy vấn bằng select_related("course", "teacher") và prefetch_related("enrollments").
    """
    queryset = ClassGroup.objects.filter(is_deleted=False).select_related(
        "course", "teacher"
    ).prefetch_related("enrollments__student")
    serializer_class = ClassGroupSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        course_id = self.request.query_params.get("course_id")
        if course_id:
            qs = qs.filter(course_id=course_id)
        teacher_id = self.request.query_params.get("teacher_id")
        if teacher_id:
            qs = qs.filter(teacher_id=teacher_id)
        return qs

    def perform_destroy(self, instance):
        instance.soft_delete()

class ClassEnrollmentViewSet(viewsets.ModelViewSet):
    """
    Đăng ký / Phân bổ học viên vào lớp học.
    - Tối ưu select_related("class_group", "student").
    """
    queryset = ClassEnrollment.objects.filter(is_deleted=False).select_related(
        "class_group", "student"
    )
    serializer_class = ClassEnrollmentSerializer

    def get_permissions(self):
        if self.action in ["create", "destroy", "update", "partial_update"]:
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        class_id = self.request.query_params.get("class_id")
        if class_id:
            qs = qs.filter(class_group_id=class_id)
        student_id = self.request.query_params.get("student_id")
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs

    def perform_destroy(self, instance):
        instance.soft_delete()

# Giữ lại compatibility views cho các test hiện tại
class CourseListView(generics.ListAPIView):
    queryset = Course.objects.filter(is_published=True, is_deleted=False)
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.filter(is_published=True, is_deleted=False)
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]
