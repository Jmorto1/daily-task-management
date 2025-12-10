from django.contrib import admin
from django.urls import path,include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from apps.services.views import AssignServicesAPIView,RemoveServicesAPIView
urlpatterns = [
    path('admin/', admin.site.urls),
    path("users/",include("apps.users.urls")),
    path("departments/",include("apps.departments.urls")),
    path("teams/",include("apps.teams.urls")),
    path("services/",include("apps.services.urls")),
    path("assignServices/",AssignServicesAPIView.as_view(),name="assign services"),
    path("removeServices/",RemoveServicesAPIView.as_view(),name="remove services"),
    path("subServices/",include("apps.subServices.urls")),
    path("activities/",include("apps.activities.urls")),
    path("reports/",include("apps.reports.urls"))
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)