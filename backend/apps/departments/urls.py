from django.urls import path
from .views import DepartmentListCreateView, DepartmentRetrieveUpdateDeleteView

urlpatterns = [
    path("", DepartmentListCreateView.as_view(), name="department-list-create"),
    path("<int:pk>/", DepartmentRetrieveUpdateDeleteView.as_view(), name="department-rud"),
]
