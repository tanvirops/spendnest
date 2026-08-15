#!/usr/bin/env bash
set -e

echo "Current User: $(whoami)"
echo "Workspace: $(pwd)"

# Helper function to execute sudo commands non-interactively
run_sudo() {
    echo "$SHINE32_PASSWORD" | sudo -S "$@"
}

# 1. Docker Images Build
docker-compose down || true
docker-compose build --no-cache
docker-compose up -d
docker ps | grep expense-* || true
echo "Docker containers are up and running."


# 2. SSL Directory Setup
if [ ! -d "/etc/ssl/cloudflare" ]; then
    echo "Creating Cloudflare SSL directory..."
    run_sudo mkdir -p /etc/ssl/cloudflare
fi

# 3. Check and Write Cloudflare SSL Certificates
CERT_PATH="/etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.crt"
KEY_PATH="/etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.key"

# Remove empty or invalid existing cert files
if [ -f "$CERT_PATH" ] && [ ! -s "$CERT_PATH" ]; then
    echo "Removing empty certificate file..."
    run_sudo rm -f "$CERT_PATH" "$KEY_PATH"
fi

if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
    echo "Writing Cloudflare SSL Certificate and Private Key..."
    printf '%s\n' "$CLOUDFLARE_CERT" | run_sudo tee "$CERT_PATH" > /dev/null
    printf '%s\n' "$CLOUDFLARE_KEY" | run_sudo tee "$KEY_PATH" > /dev/null
    
    run_sudo chmod 600 "$KEY_PATH"
    run_sudo chmod 644 "$CERT_PATH"
else
    echo "Cloudflare SSL certificate and key already exist."
fi

# 4. Nginx Configuration Setup
NGINX_CONF="/etc/nginx/sites-available/${EXPENSE_TRACKER_DOMAIN}"

if [ -f "$NGINX_CONF" ]; then
    echo "Nginx configuration already exists. Validating and reloading..."
    run_sudo nginx -t
    run_sudo systemctl reload nginx
else
    echo "Creating Nginx configuration for ${EXPENSE_TRACKER_DOMAIN}..."

    # Create nginx config in a temporary file then move it into place with sudo
    TMP_CONF="/tmp/expense-nginx-${EXPENSE_TRACKER_DOMAIN}.conf"
    cat > "$TMP_CONF" <<EOL
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

   location / {
        proxy_pass http://127.0.0.1:3041;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;   # <-- Look here! No backslash!
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;               # <-- No backslash!
        proxy_cache_bypass $http_upgrade;         # <-- No backslash!
        proxy_set_header X-Real-IP $remote_addr;  # <-- No backslash!
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; # <-- No backslash!
        proxy_set_header X-Forwarded-Proto $scheme;                  # <-- No backslash!
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3042;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOL

    # Move into place as root and set permissions
    run_sudo mv "$TMP_CONF" "$NGINX_CONF"
    run_sudo chown root:root "$NGINX_CONF"
    run_sudo chmod 644 "$NGINX_CONF"

    run_sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
    run_sudo nginx -t
    run_sudo systemctl reload nginx
fi
rm -f .deploy.sh.swp deploy.sh | true
echo "Deployment completed successfully."
echo "Access your application at: https://${EXPENSE_TRACKER_DOMAIN}"