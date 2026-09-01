from django.urls import path
from .views import AttendanceSessionListView, CheckInView, AttendanceRecordListView

urlpatterns = [
    path("sessions/", AttendanceSessionListView.as_view(), name="attendance-sessions"),
    path("sessions/<uuid:session_id>/checkin/", CheckInView.as_view(), name="attendance-checkin"),
    path("sessions/<uuid:session_id>/records/", AttendanceRecordListView.as_view(), name="attendance-records"),
]
