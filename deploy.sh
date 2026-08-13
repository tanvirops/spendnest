#!/usr/bin/env bash
set -e

echo "Current User: $(whoami)"
echo "Workspace: $(pwd)"

SUDO_CMD="echo \"$SHINE32_PASSWORD\" | sudo -S"

# 1. Docker Images Build
docker-compose down || true
docker-compose build
docker-compose up -d
docker ps | grep expense-* || true

# 2. SSL Directory Setup
if [ ! -d "/etc/ssl/cloudflare" ]; then
    echo "Creating Cloudflare SSL directory..."
    eval $SUDO_CMD mkdir -p /etc/ssl/cloudflare
fi

# 3. Check and Write Cloudflare SSL Certificates
CERT_PATH="/etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.crt"
KEY_PATH="/etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.key"

if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
    echo "Writing Cloudflare SSL Certificate and Private Key..."
    echo "$EXPENSE_CLOUDFLARE_CERT" | eval $SUDO_CMD tee "$CERT_PATH" > /dev/null
    echo "$EXPENSE_CLOUDFLARE_KEY" | eval $SUDO_CMD tee "$KEY_PATH" > /dev/null
    
    eval $SUDO_CMD chmod 600 "$KEY_PATH"
    eval $SUDO_CMD chmod 644 "$CERT_PATH"
else
    echo "Cloudflare SSL certificate and key already exist."
fi

# 4. Nginx Configuration Setup
NGINX_CONF="/etc/nginx/sites-available/${EXPENSE_TRACKER_DOMAIN}"
NGINX_LINK="/etc/nginx/sites-enabled/${EXPENSE_TRACKER_DOMAIN}"

if [ -f "$NGINX_CONF" ]; then
    echo "Nginx configuration already exists. Validating and reloading..."
    eval $SUDO_CMD nginx -t
    eval $SUDO_CMD systemctl reload nginx
else
    echo "Creating Nginx configuration for ${EXPENSE_TRACKER_DOMAIN}..."
    
    eval $SUDO_CMD tee "$NGINX_CONF" > /dev/null <<EOL
server {
    listen 80;
    server_name ${EXPENSE_TRACKER_DOMAIN} www.${EXPENSE_TRACKER_DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name ${EXPENSE_TRACKER_DOMAIN} www.${EXPENSE_TRACKER_DOMAIN};

    ssl_certificate /etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.crt;
    ssl_certificate_key /etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.key;

    root ${EXPENSE_TRACKER_DIR}/client/dist;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3042;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

    eval $SUDO_CMD ln -sf "$NGINX_CONF" "$NGINX_LINK"
    eval $SUDO_CMD nginx -t
    eval $SUDO_CMD systemctl reload nginx
fi