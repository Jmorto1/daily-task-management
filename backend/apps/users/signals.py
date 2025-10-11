from django.db.models.signals import post_migrate
from django.dispatch import receiver
from apps.users.models import User
from apps.departments.models import Departments

@receiver(post_migrate)
def create_initial_data(sender, **kwargs):
# Check if sysAdmin without department exists
    if not User.objects.filter(role="sysAdmin", department__isnull=True).exists():
        # Create default sysAdmin (superuser)
        User.objects.create_superuser(
            phone_number="0911111111",
            email="tempSysAdmin@gmail.com",
            password="sysAdmin123",
            role="sysAdmin",
            name_am="ስይስተም አስተዳደር",
            name_en="System Adminstrator",
        )    
    if not Departments.objects.exists():
        dept = Departments.objects.create(name_am="የኢኖቬሽን እና ቴክኖሎጂ ክፍል",
                name_en="Innovation And Technology Department")
        # Check if admin exists for this department
        admin = User(
            phone_number="0922222222",
            email="tempSysAdmin@gmail.com",
            role="admin",
            department=dept,
            name_am="ፅ/ቤት ሀላፊ",
            name_en="Department Adminstrator",
            gender_am="ወንድ",
            gender_en="Male",
            profession_am="ሀላፊ",
            profession_en="Administrator"
        )

        admin.set_password("admin123") 
        admin.save()

