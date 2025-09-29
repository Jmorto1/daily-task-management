from django.urls import path
from .views import ActivityAPIView
urlpatterns=[
    path("",ActivityAPIView.as_view(),name="activity-list-create"),
    path("<int:pk>/",ActivityAPIView.as_view(),name="activity-detail")
]
