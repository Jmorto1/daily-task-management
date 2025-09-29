from django.urls import path
from .views import ServiceAPIView
urlpatterns=[
    path("",ServiceAPIView.as_view(),name="service-list-create"),
    path("<int:pk>/",ServiceAPIView.as_view(),name="service-detail")
]
