from django.db import models
from apps.departments.models import Departments
from apps.teams.models import Teams
from apps.users.models import User

class Services(models.Model):
    name_am = models.TextField()
    name_en = models.TextField()
    department = models.ForeignKey(
        Departments, on_delete=models.CASCADE, related_name="services"
    )
    teams = models.ManyToManyField(
        Teams, blank=True, related_name="services"
    )
    users = models.ManyToManyField(User, related_name="services")
    class Meta:
        db_table="services"
        verbose_name = "Service"
        verbose_name_plural = "services"
    def __str__(self):
        return f"{self.name_en} / {self.name_am}"
