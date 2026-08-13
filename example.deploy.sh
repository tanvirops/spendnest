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
docker-compose build
docker-compose up -d
docker ps | grep expense-* || true
echo "Docker containers are up and running."

run_sudo rm /etc/nginx/sites-available/expense.tanvirops.xyz
run_sudo rm /etc/nginx/sites-enabled/expense.tanvirops.xyz

# 2. SSL Directory Setup
if [ ! -d "/etc/ssl/cloudflare" ]; then
    echo "Creating Cloudflare SSL directory..."
    run_sudo mkdir -p /etc/ssl/cloudflare
fi

# 3. Check and Write Cloudflare SSL Certificates
CERT_PATH="/etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.crt"
KEY_PATH="/etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.key"

# Helper: write, validate and move cert/key
write_and_validate_file() {
    local input_var="$1"    # raw env var name
    local input_b64_var="$2" # base64 env var name
    local tmpfile="$3"
    local destfile="$4"
    local validate_type="$5" # 'cert' or 'key'

    # Prefer base64-encoded secret if provided (preserves newlines in CI)
    if [ -n "${!input_b64_var}" ]; then
        echo "Decoding base64 secret for $destfile"
        printf '%s' "${!input_b64_var}" | base64 -d > "$tmpfile"
    else
        printf '%s' "${!input_var}" > "$tmpfile"
    fi

    # Basic checks
    if [ "$validate_type" = 'cert' ]; then
        if ! openssl x509 -in "$tmpfile" -noout >/dev/null 2>&1; then
            echo "ERROR: Certificate at $tmpfile is not a valid PEM certificate or is truncated."
            echo "Please ensure the secret contains the full certificate including '-----BEGIN CERTIFICATE-----' and the chain if required."
            rm -f "$tmpfile"
            return 1
        fi
    else
        # Try modern pkey parser first, then rsa fallback
        if ! openssl pkey -in "$tmpfile" -noout >/dev/null 2>&1; then
            if ! openssl rsa -in "$tmpfile" -check -noout >/dev/null 2>&1; then
                echo "ERROR: Private key at $tmpfile is not a valid PEM private key."
                rm -f "$tmpfile"
                return 1
            fi
        fi
    fi

    # Move into place as root
    run_sudo mv "$tmpfile" "$destfile"
    run_sudo chown root:root "$destfile"
    if [ "$validate_type" = 'key' ]; then
        run_sudo chmod 600 "$destfile"
    else
        run_sudo chmod 644 "$destfile"
    fi

    return 0
}

if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
    echo "Writing Cloudflare SSL Certificate and Private Key..."

    TMP_CERT="/tmp/${EXPENSE_TRACKER_DOMAIN}.crt"
    TMP_KEY="/tmp/${EXPENSE_TRACKER_DOMAIN}.key"

    write_and_validate_file CLOUDFLARE_CERT CLOUDFLARE_CERT_B64 "$TMP_CERT" "$CERT_PATH" cert || exit 1
    write_and_validate_file CLOUDFLARE_KEY CLOUDFLARE_KEY_B64 "$TMP_KEY" "$KEY_PATH" key || exit 1

else
    echo "Cloudflare SSL certificate and key already exist."
fi

# Helpful diagnostic for CA chain issues
if [ -f "$CERT_PATH" ]; then
    echo "Checking certificate chain for $CERT_PATH"
    if ! openssl x509 -in "$CERT_PATH" -noout -text >/dev/null 2>&1; then
        echo "Warning: opened certificate but might be missing chain or issuer info. If clients report trust issues or nginx warns about ssl_stapling, upload the fullchain (certificate followed by issuer(s))."
    fi
fi

# 4. Nginx Configuration Setup
NGINX_CONF="/etc/nginx/sites-available/${EXPENSE_TRACKER_DOMAIN}"
NGINX_LINK="/etc/nginx/sites-enabled/${EXPENSE_TRACKER_DOMAIN}"

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

    # Move into place as root and set permissions
    run_sudo mv "$TMP_CONF" "$NGINX_CONF"
    run_sudo chown root:root "$NGINX_CONF"
    run_sudo chmod 644 "$NGINX_CONF"

    run_sudo ln -sf "$NGINX_CONF" "$NGINX_LINK"
    run_sudo nginx -t
    run_sudo systemctl reload nginx
fi