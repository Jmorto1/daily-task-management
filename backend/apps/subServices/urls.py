from django.urls import path
from .views import SubServiceAPIView
urlpatterns=[
    path("",SubServiceAPIView.as_view(),name="subService-list-create"),
    path("<int:pk>/",SubServiceAPIView.as_view(),name="subService-detail")
]
