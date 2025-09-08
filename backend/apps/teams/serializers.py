from rest_framework import serializers
from .models import Teams
from apps.departments.models import Departments

class TeamSerializer(serializers.ModelSerializer):
    name = serializers.DictField(child=serializers.CharField(), write_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Departments.objects.all(), source="department"
    )

    class Meta:
        model = Teams
        fields = ["id", "name", "department_id"]
        read_only_fields = ["id"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["name"] = {"am": instance.name_am, "en": instance.name_en}
        return rep

    def create(self, validated_data):
        name_data = validated_data.pop("name", {})
        validated_data["name_am"] = name_data.get("am")
        validated_data["name_en"] = name_data.get("en")
        return super().create(validated_data)

    def update(self, instance, validated_data):
        name_data = validated_data.pop("name", {})
        instance.name_am = name_data.get("am", instance.name_am)
        instance.name_en = name_data.get("en", instance.name_en)
        instance.department = validated_data.get("department", instance.department)
        instance.save()
        return instance
