from django.db import models
from apps.services.models import Services
class SubServices(models.Model):
    name_am=models.TextField()
    name_en=models.TextField()
    service=models.ForeignKey(Services,on_delete=models.CASCADE,related_name="subServices")
    
    class Meta:
        db_table="subServices"
        verbose_name = "SubService"
        verbose_name_plural = "subServices"