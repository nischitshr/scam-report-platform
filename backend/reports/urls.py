from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScamReportViewSet, AdminReportActionView, AdminStatsView

router = DefaultRouter()
router.register(r'reports', ScamReportViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/reports/<int:pk>/<str:action_type>/', AdminReportActionView.as_view(), name='admin_report_action'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
]
