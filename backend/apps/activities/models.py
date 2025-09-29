from django.db import models
from apps.subServices.models import SubServices
class Activities(models.Model):
    name_am=models.TextField()
    name_en=models.TextField()
    subService=models.ForeignKey(SubServices,on_delete=models.CASCADE,related_name="activities")
    frequency=models.CharField(max_length=10)
    time=models.CharField(max_length=10)
    quality=models.CharField(max_length=10)
    class Meta:
        db_table="activities"
        verbose_name = "Activity"
        verbose_name_plural = "activities"
