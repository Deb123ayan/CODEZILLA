#!/bin/bash

# Update OTP message with user ID on VPS
echo "Uploading updated users/views.py to VPS..."

# Upload the updated file
scp backend/users/views.py root@157.245.110.122:/opt/zafby/backend/users/views.py

echo "Restarting web container..."

# Restart the web container to apply changes
ssh root@157.245.110.122 "cd /opt/zafby && docker-compose restart web"

echo "Done! OTP messages will now include User ID: 5968267783"
