from rest_framework import serializers
from .models import Services
from apps.departments.models import Departments
from apps.teams.models import Teams
from apps.users.models import User
from apps.subServices.serializers import SubServiceSerializer
from apps.subServices.models import SubServices

class ServiceSerializer(serializers.ModelSerializer):
    name = serializers.DictField(child=serializers.CharField(), write_only=True)

    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Departments.objects.all(), source="department"
    )
    user_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="users", many=True, required=False
    )
    team_ids = serializers.PrimaryKeyRelatedField(
        queryset=Teams.objects.all(), source="teams", many=True, required=False
    )
    subServices = SubServiceSerializer(many=True, required=False,source="subservices")

    class Meta:
        model = Services
        fields = ["id", "name", "department_id", "user_ids", "team_ids", "subServices"]
        read_only_fields = ["id"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["name"] = {"am": instance.name_am, "en": instance.name_en}
        rep["user_ids"] = list(instance.users.values_list("id", flat=True))
        rep["team_ids"] = list(instance.teams.values_list("id", flat=True))
        rep["subServices"] = SubServiceSerializer(instance.subServices.all(), many=True).data
        return rep

    def create(self, validated_data):
        subservices_data = validated_data.pop("subservices", [])
        users = validated_data.pop("users", [])
        teams = validated_data.pop("teams", [])
        name_data = validated_data.pop("name", {})

        validated_data["name_am"] = name_data.get("am")
        validated_data["name_en"] = name_data.get("en")

        service = Services.objects.create(**validated_data)

        if users:
            service.users.set(users)
        if teams:
            service.teams.set(teams)

        for subservice_data in subservices_data:
            SubServiceSerializer().create({**subservice_data, "service": service})
        return service
    def update(self, instance, validated_data):
        users = validated_data.pop("users", [])
        teams = validated_data.pop("teams", [])
        name_data = validated_data.pop("name", {})
        if name_data:
            instance.name_am = name_data.get("am", instance.name_am)
            instance.name_en = name_data.get("en", instance.name_en)

        if "department" in validated_data:
            instance.department = validated_data["department"]
        if users:
            instance.users.set(users)
        if teams:
            instance.teams.set(teams)
        instance.save()
        return instance

