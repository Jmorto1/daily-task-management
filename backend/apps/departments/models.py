from django.db import models
import uuid
class Departments(models.Model):

    name_am=models.TextField()
    name_en=models.TextField()
    class Meta:
        db_table="departments"
        verbose_name = "Department"
        verbose_name_plural = "Departments"