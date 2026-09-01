from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AcademicWarningViewSet, StudentReminderViewSet, ZaloNotificationLogViewSet

router = DefaultRouter()
router.register(r"warnings", AcademicWarningViewSet, basename="academic-warning")
router.register(r"reminders", StudentReminderViewSet, basename="student-reminder")
router.register(r"zalo-logs", ZaloNotificationLogViewSet, basename="zalo-notification-log")

urlpatterns = [
    path("", include(router.urls)),
]
