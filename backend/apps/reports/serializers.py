from rest_framework import serializers
from .models import Reports
from apps.services.models import Services
from apps.subServices.models import SubServices
from apps.users.models import User

class ReportSerializer(serializers.ModelSerializer):
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Services.objects.all(), source="service", required=False, allow_null=True
    )
    subService_id = serializers.PrimaryKeyRelatedField(
        queryset=SubServices.objects.all(), source="sub_service", required=False, allow_null=True
    )
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="user"
    )
    name = serializers.DictField(write_only=True)
    startingTime = serializers.CharField(source="starting_time")
    endingTime = serializers.CharField(source="ending_time")
    totalHour = serializers.CharField(source="total_hour")

    class Meta:
        model = Reports
        fields = [
            "id",
            "type",
            "service_id",
            "subService_id",
            "user_id",
            "name",
            "activity_id",
            "quality",
            "frequency",
            "startingTime",
            "endingTime",
            "totalHour",
            "date",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        name_data = validated_data.pop("name", {})
        validated_data["name_en"] = name_data.get("en")
        validated_data["name_am"] = name_data.get("am")
        return super().create(validated_data)

    def update(self, instance, validated_data):
        name_data = validated_data.pop("name", None)
        if name_data:
            instance.name_en = name_data.get("en", instance.name_en)
            instance.name_am = name_data.get("am", instance.name_am)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def to_representation(self, instance):
        if isinstance(instance, Reports):
            queryset = Reports.objects.filter(id=instance.id)
        else:
            queryset = instance

        standard_reports = queryset.filter(type="standard")
        additional_reports = queryset.filter(type="additional")

        result = []
        services_dict = {}
        for report in standard_reports:
            service_key = (report.service.id if report.service else None) or \
                          (report.service_snapshot.get("id") if report.service_snapshot else None)
            sub_service_key = (report.sub_service.id if report.sub_service else None) or \
                              (report.sub_service_snapshot.get("id") if report.sub_service_snapshot else None)

            if not service_key:
                continue

            # Service level
            if service_key not in services_dict:
                services_dict[service_key] = {
                    "id": service_key,
                    "name": {
                        "en": report.service.name_en if report.service else report.service_snapshot.get("name_en", ""),
                        "am": report.service.name_am if report.service else report.service_snapshot.get("name_am", "")
                    },
                    "type": "standard",
                    "subServices": {}
                }

            service_entry = services_dict[service_key]

            # SubService level
            if sub_service_key not in service_entry["subServices"]:
                service_entry["subServices"][sub_service_key] = {
                    "id": sub_service_key,
                    "name": {
                        "en": report.sub_service.name_en if report.sub_service else report.sub_service_snapshot.get("name_en", ""),
                        "am": report.sub_service.name_am if report.sub_service else report.sub_service_snapshot.get("name_am", "")
                    },
                    "activities": []
                }

            sub_service_entry = service_entry["subServices"][sub_service_key]

            # Activity level
            sub_service_entry["activities"].append({
                "id": report.id,
                "name": {"en": report.name_en, "am": report.name_am},
                "user_id": report.user.id,
                "activity_id":report.activity_id,
                "quality": report.quality,
                "frequency": report.frequency,
                "startingTime": report.starting_time,
                "endingTime": report.ending_time,
                "totalHour": report.total_hour,
                "date": report.date
            })
        for service in services_dict.values():
            service["subServices"] = list(service["subServices"].values())
            result.append(service)
        for report in additional_reports:
            result.append({
                "id": report.id,
                "type": "additional",
                "name": {"en": report.name_en, "am": report.name_am},
                "user_id": report.user.id,
                "frequency": report.frequency,
                "activity_id":report.activity_id,
                "quality": report.quality,
                "startingTime": report.starting_time,
                "endingTime": report.ending_time,
                "totalHour": report.total_hour,
                "date": report.date
            })

        return result
