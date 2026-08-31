from django.urls import path
from .views import ExamListView, ExamDetailView, ExamSubmitView

urlpatterns = [
    path("exams/", ExamListView.as_view(), name="exam-list"),
    path("exams/<str:pk>/", ExamDetailView.as_view(), name="exam-detail"),
    path("exams/<str:exam_id>/submit/", ExamSubmitView.as_view(), name="exam-submit"),
]
