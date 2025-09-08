from rest_framework import serializers
from .models import Departments
class DepartmentSerializer(serializers.ModelSerializer):
    name =serializers.SerializerMethodField()
    class Meta:
        model=Departments
        fields=["id","name"]
        read_only_fields=["id"]
    def get_name(self,obj):
        return {"am":obj.name_am,"en":obj.name_en}
    def create(self, validated_data):
        name_data=self.initial_data.get("name",{})
        validated_data["name_en"]=name_data.get("en")
        validated_data["name_am"]=name_data.get("am")
        return super().create(validated_data)
    def update(self, instance, validated_data):
        name_data=self.initial_data.get("name",{})
        instance.name_en=name_data.get("en",instance.name_en)
        instance.name_am=name_data.get("am",instance.name_am)
        instance.save()
        return instance