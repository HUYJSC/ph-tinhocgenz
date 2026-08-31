from django.urls import path
from .views import AttendanceSessionListView, CheckInView

urlpatterns = [
    path("sessions/", AttendanceSessionListView.as_view(), name="attendance-sessions"),
    path("sessions/<uuid:session_id>/checkin/", CheckInView.as_view(), name="attendance-checkin"),
]
