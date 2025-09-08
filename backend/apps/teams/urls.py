from django.urls import path
from .views import TeamAPIView
urlpatterns=[
    path("",TeamAPIView.as_view(),name="team-list-create"),
    path("<int:pk>/",TeamAPIView.as_view(),name="team-detail")
]