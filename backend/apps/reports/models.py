from django.db import models
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from apps.services.models import Services
from apps.subServices.models import SubServices
from apps.users.models import User
class Reports(models.Model):
    ACTIVITY_TYPE_CHOICES = [
        ("standard", "Standard"),
        ("additional", "Additional"),
    ]

    type = models.CharField(max_length=20, choices=ACTIVITY_TYPE_CHOICES)

    service = models.ForeignKey(
        Services,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reports"
    )
    sub_service = models.ForeignKey(SubServices,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reports"
    )
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name="user")
    # Snapshots (keep last known values)
    service_snapshot = models.JSONField(blank=True, null=True)
    sub_service_snapshot = models.JSONField(blank=True, null=True)

    # Report info
    name_am = models.TextField()
    name_en = models.TextField()
    activity_id = models.BigIntegerField(null=True, blank=True)
    quality = models.CharField(max_length=10, blank=True, null=True)
    frequency = models.CharField(max_length=10)
    starting_time = models.CharField(max_length=10)
    ending_time = models.CharField(max_length=10)
    total_hour = models.CharField(max_length=10)
    date = models.CharField(max_length=20)

    def save(self, *args, **kwargs):
        if self.service:
            self.service_snapshot = {
                "id": self.service.id,
                "name_en": self.service.name_en,
                "name_am": self.service.name_am,
            }
        if self.sub_service:
            self.sub_service_snapshot = {
                "id": self.sub_service.id,
                "name_en": self.sub_service.name_en,
                "name_am": self.sub_service.name_am,
            }
        super().save(*args, **kwargs)

    class Meta:
        db_table = "reports"
        verbose_name = "Report"
        verbose_name_plural = "Reports"

    def __str__(self):
        return f"Report: {self.name_en} ({self.date})"


# -----------------------
# SIGNALS to update snapshots
# -----------------------

def update_service_snapshots(service_instance):
    """Update all related report snapshots when a Service changes or is deleted."""
    for report in service_instance.reports.all():
        report.service_snapshot = {
            "id": service_instance.id,
            "name_en": service_instance.name_en,
            "name_am": service_instance.name_am,
        }
        report.save(update_fields=["service_snapshot"])


def update_subservice_snapshots(sub_service_instance):
    """Update all related report snapshots when a SubService changes or is deleted."""
    for report in sub_service_instance.reports.all():
        report.sub_service_snapshot = {
            "id": sub_service_instance.id,
            "name_en": sub_service_instance.name_en,
            "name_am": sub_service_instance.name_am,
        }
        report.save(update_fields=["sub_service_snapshot"])


# Connect signals
@receiver(post_save, sender=Services)
def refresh_report_service_snapshots(sender, instance, **kwargs):
    update_service_snapshots(instance)


@receiver(pre_delete, sender=Services)
def freeze_report_service_snapshots(sender, instance, **kwargs):
    update_service_snapshots(instance)


@receiver(post_save, sender=SubServices)
def refresh_report_subservice_snapshots(sender, instance, **kwargs):
    update_subservice_snapshots(instance)


@receiver(pre_delete, sender=SubServices)
def freeze_report_subservice_snapshots(sender, instance, **kwargs):
    update_subservice_snapshots(instance)
