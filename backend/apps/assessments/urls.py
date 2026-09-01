from django.urls import path
from .views import ExamListView, ExamDetailView, ExamSubmitView, QuestionListView, StudentExamAttemptsView

urlpatterns = [
    path("exams/", ExamListView.as_view(), name="exam-list"),
    path("exams/<str:pk>/", ExamDetailView.as_view(), name="exam-detail"),
    path("exams/<str:exam_id>/submit/", ExamSubmitView.as_view(), name="exam-submit"),
    path("questions/", QuestionListView.as_view(), name="question-list"),
    path("attempts/", StudentExamAttemptsView.as_view(), name="exam-attempts"),
]
