from rest_framework import serializers
from .models import SubServices
from apps.services.models import Services
from apps.activities.serializers import ActivitySerializer
from apps.activities.models import Activities
class SubServiceSerializer(serializers.ModelSerializer):
    name = serializers.DictField(child=serializers.CharField(), write_only=True)
    activities = ActivitySerializer(many=True, required=False)

    class Meta:
        model = SubServices
        fields = ["id", "name", "activities"]
        read_only_fields = ["id"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["name"] = {"am": instance.name_am, "en": instance.name_en}
        rep["activities"] = ActivitySerializer(instance.activities.all(), many=True).data
        return rep

    def create(self, validated_data):
        activities_data = validated_data.pop("activities", [])
        name_data = validated_data.pop("name", {})
        service = validated_data.pop("service")

        subservice = SubServices.objects.create(
            name_am=name_data.get("am"),
            name_en=name_data.get("en"),
            service=service
        )

        for activity_data in activities_data:
            ActivitySerializer(context={"subService": subservice}).create(activity_data)
        return subservice
    def update(self, instance, validated_data):
        name_data = validated_data.pop("name", {})
        if name_data:
            instance.name_am = name_data.get("am", instance.name_am)
            instance.name_en = name_data.get("en", instance.name_en)
        instance.save()
        return instance

