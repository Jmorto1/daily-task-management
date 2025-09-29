from rest_framework import serializers
from .models import Activities
from apps.subServices.models import SubServices

class ActivitySerializer(serializers.ModelSerializer):
    name = serializers.DictField(child=serializers.CharField(), write_only=True)
    subService_id = serializers.PrimaryKeyRelatedField(
        queryset=SubServices.objects.all(),
        source="subService",
        required=False, 
    )

    class Meta:
        model = Activities
        fields = ["id", "name", "frequency", "time", "quality", "subService_id"]
        read_only_fields = ["id"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["name"] = {"am": instance.name_am, "en": instance.name_en}
        return rep

    def create(self, validated_data):
        name_data = validated_data.pop("name", {})
        validated_data["name_am"] = name_data.get("am")
        validated_data["name_en"] = name_data.get("en")

        if "subService" not in validated_data and self.context.get("subService"):
            validated_data["subService"] = self.context["subService"]

        return super().create(validated_data)
    def update(self, instance, validated_data):
        name_data = validated_data.pop("name", {})
        if name_data:
            instance.name_am = name_data.get("am", instance.name_am)
            instance.name_en = name_data.get("en", instance.name_en)

        instance.frequency = validated_data.get("frequency", instance.frequency)
        instance.time = validated_data.get("time", instance.time)
        instance.quality = validated_data.get("quality", instance.quality)

        if "subService" in validated_data:
            instance.subService = validated_data["subService"]

        instance.save()
        return instance