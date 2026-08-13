set -e
          echo "Current User: $(whoami)"
          echo "Workspace: $(pwd)"

          export EXPENSE_TRACKER_DOMAIN="${{ vars.EXPENSE_TRACKER_DOMAIN }}"
          export EXPENSE_TRACKER_DIR="${{ vars.EXPENSE_TRACKER_DIR }}"

          if [ ! -d "/etc/ssl/cloudflare" ]; then
              echo "Creating Cloudflare directory..."
              sudo mkdir -p /etc/ssl/cloudflare
          fi

          # Let's check cloudflare ssl certificate
          if [ ! -f "/etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.crt" ] || \
            [ ! -f "/etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.key" ]; then
            echo "Cloudflare SSL certificate or key not found. Please ensure they are placed in /etc/ssl/cloudflare/"
            sudo tee /etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.crt > /dev/null <<EOL
             ${{vars.EXPENSE_TANVIR_CLOUDFLARE_CERTIFICATE}}
            sudo tee /etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.key > /dev/null <<EOL
             ${{vars.EXPENSE_TANVIR_CLOUDFLARE_PRIVATE_KEY}}
             sudo chmod 600 /etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.key
             sudo chmod 644 /etc/ssl/cloudflare/${EXPENSE_TRACKER_DOMAIN}.crt
          else
            echo "Cloudflare SSL certificate and key found."
          fi

          # Check if the Nginx configuration file already exists
          if [ -f "/etc/nginx/sites-available/${EXPENSE_TRACKER_DOMAIN}" ]; then
            echo "Nginx configuration for ${EXPENSE_TRACKER_DOMAIN} already exists. Skipping creation."
            cat /etc/nginx/sites-available/${EXPENSE_TRACKER_DOMAIN}
            sudo nginx -t
            sudo systemctl reload nginx
          else
            # Create a new Nginx configuration file
            echo "Creating Nginx configuration for ${EXPENSE_TRACKER_DOMAIN} ..."
            sudo tee /etc/nginx/sites-available/${EXPENSE_TRACKER_DOMAIN} > /dev/null <<EOL
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
                      try_files $uri $uri/ /index.html;
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
            # Enable the new configuration by creating a symbolic link
            sudo ln -s /etc/nginx/sites-available/${EXPENSE_TRACKER_DOMAIN} /etc/nginx/sites-enabled/
            # Test Nginx configuration
            sudo nginx -t
            # Reload Nginx to apply changes.
            sudo systemctl reload nginx