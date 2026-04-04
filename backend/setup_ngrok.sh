#!/bin/bash
# Quick HTTPS Setup using ngrok
# This gives you instant HTTPS access for testing

VPS_IP="157.245.110.122"
VPS_USER="root"

echo "========================================="
echo "Quick HTTPS Setup with ngrok"
echo "========================================="
echo ""
echo "This will:"
echo "  1. Install ngrok on your VPS"
echo "  2. Create an HTTPS tunnel to your backend"
echo "  3. Give you a public HTTPS URL"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    exit 0
fi

echo ""
echo "Installing ngrok on VPS..."
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
cd /tmp
wget -q https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xzf ngrok-v3-stable-linux-amd64.tgz
mv ngrok /usr/local/bin/
rm ngrok-v3-stable-linux-amd64.tgz
ENDSSH

echo ""
echo "Starting ngrok tunnel..."
echo "This will create an HTTPS URL for your backend"
echo ""

ssh ${VPS_USER}@${VPS_IP} "nohup ngrok http 80 > /tmp/ngrok.log 2>&1 &"

sleep 3

echo "Getting your HTTPS URL..."
ssh ${VPS_USER}@${VPS_IP} "curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^\"]*' | head -1"

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Your HTTPS URL is shown above."
echo ""
echo "Update your Vercel frontend environment:"
echo "  VITE_API_URL=<your-https-url-from-above>"
echo ""
echo "To stop ngrok:"
echo "  ssh root@${VPS_IP} 'pkill ngrok'"
echo ""
