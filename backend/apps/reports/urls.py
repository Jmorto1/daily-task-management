from django.urls import path
from .views import ReportDetailView,ReportListCreateView
urlpatterns=[
    path("",ReportListCreateView.as_view()),
    path("<int:pk>/",ReportDetailView.as_view())
]