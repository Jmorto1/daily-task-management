from django.contrib import admin
from .models import User, Departments, Teams
from django import forms
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

User = get_user_model()

class CustomUserCreationForm(UserCreationForm):
    """
    A form that creates a user with just a phone_number and password.
    """
    class Meta:
        model = User
        fields = ('phone_number',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove the username field since we're using phone_number
        if 'username' in self.fields:
            del self.fields['username']

class CustomUserChangeForm(UserChangeForm):
    """
    A form for updating users in the admin.
    """
    class Meta:
        model = User
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove the username field since we're using phone_number
        if 'username' in self.fields:
            del self.fields['username']

class UserAdmin(BaseUserAdmin):
    # The forms to add and change user instances
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    # The fields to be used in displaying the User model.
    list_display = ('phone_number', 'name_en', 'role',"status", 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'role',"status")
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal info', {'fields': (
            'name_am', 'name_en', 'gender_am', 'gender_en',
            'profession_am', 'profession_en', 'office_am', 'office_en',
            'team', 'department', 'profile'
        )}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Role', {'fields': ('role',)}),
        ('Status', {'fields': ('status',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'password1', 'password2'),
        }),
    )
    search_fields = ('phone_number', 'name_am', 'name_en')
    ordering = ('phone_number',)
    filter_horizontal = ('groups', 'user_permissions',)

# Register the custom User model with the custom UserAdmin
admin.site.register(User, UserAdmin)
admin.site.register(Departments)
admin.site.register(Teams)
