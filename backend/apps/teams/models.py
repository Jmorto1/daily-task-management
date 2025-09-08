from django.db import models
import uuid
from apps.departments.models import Departments
class Teams(models.Model):
    name_am=models.TextField()
    name_en=models.TextField()
    department=models.ForeignKey(Departments,on_delete=models.CASCADE,related_name="teams")
    class Meta:
        db_table="teams"
        verbose_name = "Team"
        verbose_name_plural = "Teams"