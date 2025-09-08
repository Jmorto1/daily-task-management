import uuid
import os
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from django.conf import settings
from apps.departments.models import Departments
from apps.teams.models import Teams

class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('The Phone Number field must be set')
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        # Provide default values for required fields
        extra_fields.setdefault('name_am', 'Superuser')
        extra_fields.setdefault('name_en', 'Superuser')
        extra_fields.setdefault('gender_am', 'ወንድ')
        extra_fields.setdefault('gender_en', 'Male')
        extra_fields.setdefault('profession_am', 'ስይስተም አስተዳዳሪ')
        extra_fields.setdefault('profession_en', 'System Admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone_number, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = [
        ("sysAdmin", "System Admin"),
        ("admin", "Admin"),
        ("teamLeader", "Team Leader"),
        ("user", "User"),
    ]
    USER_STATUS_CHOICES=[("user","user"),("pending","pending")]
    # Remove the default username field and make it optional
    username = models.CharField(max_length=150, unique=False, blank=True, null=True)
    
    # Make email optional since we're using phone number as primary identifier
    email = models.EmailField(blank=True, null=True)
    
    # Custom fields
    name_am = models.TextField()
    name_en = models.TextField()
    gender_am = models.CharField(max_length=30,null=True, blank=True)
    gender_en = models.CharField(max_length=30,null=True, blank=True)
    profession_am = models.CharField(max_length=200,null=True, blank=True)
    profession_en = models.CharField(max_length=200,null=True, blank=True)
    phone_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default="user")
    status=models.CharField(max_length=50,choices=USER_STATUS_CHOICES,default="user")
    office_am = models.TextField(default="ለሚ ኩራ ዋና ፅ/ቤት")
    office_en = models.TextField(default="lemi kura subcity main office")
    team = models.ForeignKey(Teams, on_delete=models.SET_NULL, null=True, blank=True, related_name="users")
    department = models.ForeignKey(Departments, on_delete=models.SET_NULL, null=True, blank=True, related_name="users")
    profile = models.ImageField(upload_to="profiles/", blank=True, null=True)
    # Use phone_number as the username field for authentication
    USERNAME_FIELD = 'phone_number'
    # Remove phone_number from required fields since it's now the USERNAME_FIELD
    REQUIRED_FIELDS = ['name_am', 'name_en']

    # Use custom manager
    def clean(self):
        """Custom validation: department is required for non-superusers"""
        super().clean()
        
        # If user is not a superuser and department is not set
        if not self.is_superuser and not self.department:
            from django.core.exceptions import ValidationError
            raise ValidationError({
                'department': 'Department is required for non-superusers'
            })

    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.full_clean()  # This will call the clean() method
        super().save(*args, **kwargs)
    objects = CustomUserManager() 

    # Add custom related_name to avoid clashes with default User model
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="custom_user_set",  # Changed from default
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="custom_user_set",  # Changed from default
        related_query_name="user",
    )

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.name_en} ({self.phone_number})"

@receiver(post_delete, sender=User)
def delete_profile_on_user_delete(sender, instance, **kwargs):
    if instance.profile and os.path.isfile(instance.profile.path):
        os.remove(instance.profile.path)

@receiver(pre_save, sender=User)
def delete_old_profile_on_update(sender, instance, **kwargs):
    if not instance.pk:
        return 

    try:
        old_user = User.objects.get(pk=instance.pk)
        old_profile = old_user.profile
    except User.DoesNotExist:
        return

    new_profile = instance.profile
    if old_profile and old_profile != new_profile:
        if os.path.isfile(old_profile.path):
            os.remove(old_profile.path)