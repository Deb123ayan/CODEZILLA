#!/bin/bash
# Set admin password script

cd /opt/zafby

docker-compose exec -T web python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(username='admin')
user.set_password('admin123')
user.save()
print('Password set successfully!')
print('Username: admin')
print('Password: admin123')
EOF
