from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    ClassGroupViewSet,
    ClassEnrollmentViewSet,
    CourseListView,
    CourseDetailView
)

router = DefaultRouter()
router.register(r"classes", ClassGroupViewSet, basename="class-group")
router.register(r"enrollments", ClassEnrollmentViewSet, basename="class-enrollment")
router.register(r"tracks", CourseViewSet, basename="course-track")

urlpatterns = [
    path("", CourseListView.as_view(), name="course-list"),
    path("<str:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("api/", include(router.urls)),
]
