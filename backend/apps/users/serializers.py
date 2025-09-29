from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.departments.serializers import DepartmentSerializer
from apps.departments.models import Departments
from apps.teams.serializers import TeamSerializer
from apps.teams.models import Teams
from rest_framework import serializers
User = get_user_model()

class UserDetailSerializer(serializers.ModelSerializer):
    # Read-only nested serializers for GET
    team = TeamSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    
    # Write-only ID fields for POST/PUT
    team_id = serializers.PrimaryKeyRelatedField(
        queryset=Teams.objects.all(), write_only=True, required=False, allow_null=True
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Departments.objects.all(), write_only=True, required=False, allow_null=True
    )

    # Custom fields for multi-language text
    name = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()
    profession = serializers.SerializerMethodField()
    office = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "name", "gender", "profession", "office",
            "phone_number","email", "role","status", "team", "department", "profile",
            "team_id", "department_id", "is_active", "date_joined"
        ]
        read_only_fields = ["id", "date_joined"]

    # Multi-language getters
    def get_name(self, obj):
        return {'am': obj.name_am, 'en': obj.name_en}

    def get_gender(self, obj):
        return {'am': obj.gender_am, 'en': obj.gender_en}

    def get_profession(self, obj):
        return {'am': obj.profession_am, 'en': obj.profession_en}

    def get_office(self, obj):
        return {'am': obj.office_am, 'en': obj.office_en}

    def update(self, instance, validated_data):
        # Multi-language fields
        name_data = self.initial_data.get('name', {})
        gender_data = self.initial_data.get('gender', {})
        profession_data = self.initial_data.get('profession', {})
        office_data = self.initial_data.get("office", {})

        if name_data:
            instance.name_am = name_data.get('am', instance.name_am)
            instance.name_en = name_data.get('en', instance.name_en)
        if gender_data:
            instance.gender_am = gender_data.get('am', instance.gender_am)
            instance.gender_en = gender_data.get('en', instance.gender_en)
        if profession_data:
            instance.profession_am = profession_data.get('am', instance.profession_am)
            instance.profession_en = profession_data.get('en', instance.profession_en)
        if office_data:
            instance.office_am = office_data.get("am", instance.office_am)
            instance.office_en = office_data.get("en", instance.office_en)

        # Simple fields
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.email=validated_data.get("email",instance.email)
        instance.role = validated_data.get('role', instance.role)
        instance.status=validated_data.get('status', instance.status)
        instance.is_active = validated_data.get('is_active', instance.is_active)

        # Assign new team/department if provided
        team_id = validated_data.get('team_id')
        if team_id is not None:  # Explicit check to allow setting to None
            instance.team = team_id
        department_id = validated_data.get('department_id')
        if department_id is not None:  # Explicit check to allow setting to None
            instance.department = department_id

        # Profile and password
        profile_file = validated_data.get('profile', None)
        if profile_file:
            instance.profile = profile_file
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)

        instance.save()
        return instance

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    name = serializers.DictField(child=serializers.CharField(), write_only=True)
    gender = serializers.DictField(child=serializers.CharField(), write_only=True, required=False)
    profession = serializers.DictField(child=serializers.CharField(), write_only=True, required=False)
    office = serializers.DictField(child=serializers.CharField(), write_only=True, required=False)
    
    team_id = serializers.PrimaryKeyRelatedField(
        queryset=Teams.objects.all(), write_only=True, required=False, allow_null=True
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Departments.objects.all(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'name', 'gender', 'profession', 'office', 'phone_number',"email", 'role', 'status',
            'team_id', 'department_id', 'profile', 'password'
        ]

    def create(self, validated_data):
        name_data = validated_data.pop('name', {})
        gender_data = validated_data.pop('gender', {})
        profession_data = validated_data.pop('profession', {})
        office_data = validated_data.pop('office', {})
        team_obj = validated_data.pop('team_id', None)
        department_obj = validated_data.pop('department_id', None)
        validated_data.update({
            "name_am": name_data.get("am", ""),
            "name_en": name_data.get("en", ""),
            "gender_am": gender_data.get("am", ""),
            "gender_en": gender_data.get("en", ""),
            "profession_am": profession_data.get("am", ""),
            "profession_en": profession_data.get("en", ""),
            "office_am": office_data.get("am", "ለሚ ኩራ ዋና ፅ/ቤት"),
            "office_en": office_data.get("en", "lemi kura subcity main office"),
        })
        if team_obj:
            validated_data['team'] = team_obj
        if department_obj:
            validated_data['department'] = department_obj
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        return user

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=6)

