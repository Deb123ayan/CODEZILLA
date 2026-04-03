from django.contrib.auth import get_user_model
import django
import os
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from users.models import Worker, MockPlatformData

User = get_user_model()
username = os.getenv('ADMIN_EMAIL', 'admin@user.com')
password = os.getenv('ADMIN_PASSWORD', 'admin')
email = username

# 1. Create/Update Django Admin User
user, created = User.objects.update_or_create(
    username=username,
    defaults={
        'email': email,
        'is_superuser': True,
        'is_staff': True,
        'is_active': True,
    }
)
# Always re-set the password (update_or_create doesn't hash it via defaults)
user.set_password(password)
user.save()
print(f"Password for '{username}' set to: {password}")

# 2. Create/Update Worker Profile for the Admin (So they appear in Admin Dashboards/Registry)
worker, w_created = Worker.objects.update_or_create(
    user=user,
    defaults={
        'name': 'System Administrator',
        'phone': '9999999999',
        'email': email,
        'platform': 'Zomato',
        'partner_id': 'ADMIN-001',
        'city': 'Bangalore',
        'zone': 'HSR Layout',
        'is_verified': True,
        'onboarding_completed': True,
        'is_active': True
    }
)

# 3. Ensure they are also in MockPlatformData for scale testing
MockPlatformData.objects.update_or_create(
    phone='9999999999',
    defaults={
        'name': 'System Administrator',
        'platform': 'Zomato',
        'partner_id': 'ADMIN-001',
        'city': 'Bangalore',
        'zone': 'HSR Layout',
        'weekly_earnings': 15000,
        'total_deliveries': 500,
        'rating': 5.0,
        'is_active': True
    }
)

if created:
    print(f"Superuser '{username}' created successfully in User table.")
else:
    print(f"Superuser '{username}' updated successfully in User table.")

if w_created:
    print(f"Worker profile for '{username}' created successfully.")
else:
    print(f"Worker profile for '{username}' updated successfully.")

print("Admin successfully synchronized across all platform registries.")
