#!/bin/bash
# SSL Setup Script for Zafby Backend
# This script installs and configures SSL certificate using Let's Encrypt

set -e

VPS_IP="157.245.110.122"
VPS_USER="root"
APP_DIR="/opt/zafby"

echo "========================================="
echo "SSL Certificate Setup"
echo "========================================="
echo ""
echo "IMPORTANT: You need a domain name pointing to your VPS IP"
echo "Current VPS IP: ${VPS_IP}"
echo ""
read -p "Enter your domain name (e.g., api.zafby.com): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    echo "Error: Domain name is required"
    exit 1
fi

echo ""
echo "Setting up SSL for: ${DOMAIN_NAME}"
echo "This will:"
echo "  1. Install Certbot"
echo "  2. Obtain SSL certificate from Let's Encrypt"
echo "  3. Update Nginx configuration"
echo "  4. Setup auto-renewal"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "Step 1: Installing Certbot..."
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
apt-get update
apt-get install -y certbot python3-certbot-nginx
ENDSSH

echo ""
echo "Step 2: Updating Nginx configuration..."
ssh ${VPS_USER}@${VPS_IP} << ENDSSH
cat > ${APP_DIR}/nginx.conf << 'EOF'
server {
    listen 80;
    server_name ${DOMAIN_NAME};
    client_max_body_size 100M;

    # Redirect all HTTP to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN_NAME};
    client_max_body_size 100M;

    # SSL certificates (will be added by certbot)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_NAME}/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://web:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 300s;
        proxy_read_timeout 300s;
    }

    location /static/ {
        alias /app/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /app/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF
ENDSSH

echo ""
echo "Step 3: Obtaining SSL certificate..."
echo "Note: Make sure ${DOMAIN_NAME} points to ${VPS_IP}"
read -p "Press Enter when DNS is configured..."

ssh ${VPS_USER}@${VPS_IP} << ENDSSH
# Stop nginx temporarily
cd ${APP_DIR}
docker-compose stop nginx

# Get certificate
certbot certonly --standalone -d ${DOMAIN_NAME} --non-interactive --agree-tos --email admin@${DOMAIN_NAME}

# Restart containers
docker-compose up -d
ENDSSH

echo ""
echo "Step 4: Setting up auto-renewal..."
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
# Add renewal cron job
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'cd /opt/zafby && docker-compose restart nginx'") | crontab -
ENDSSH

echo ""
echo "========================================="
echo "SSL Setup Complete!"
echo "========================================="
echo ""
echo "Your API is now available at:"
echo "  → https://${DOMAIN_NAME}"
echo ""
echo "Update your frontend environment variable:"
echo "  VITE_API_URL=https://${DOMAIN_NAME}"
echo ""
echo "Test your SSL:"
echo "  curl https://${DOMAIN_NAME}/admin/"
echo ""
