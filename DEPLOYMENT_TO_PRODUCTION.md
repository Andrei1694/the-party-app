# Deployment to Production (Ubuntu 24.04, Single VM, Docker Compose, Nginx + Let's Encrypt)

## 1. Purpose and Architecture
This runbook deploys the full stack (backend, frontend, PostgreSQL, Redis) on a single Ubuntu 24.04 VM.

Target topology:
- `docker-compose.prod.yml` runs `postgres`, `redis`, `backend`, `frontend`.
- Nginx runs on the host and reverse proxies:
- `https://<DOMAIN>/` -> frontend container
- `https://<DOMAIN>/api/*` -> backend container
- `https://<DOMAIN>/uploads/*` -> backend container
- TLS is terminated by Nginx with Let's Encrypt certificates.

## 2. Deployment Variables
Use this editable block before running commands:

```bash
DOMAIN=party.example.com
SSH_TARGET=ubuntu@203.0.113.10
REPO_URL=https://github.com/Andrei1694/the-party-app.git
BRANCH=main
DEPLOY_PATH=/opt/the-party-app
LETSENCRYPT_EMAIL=admin@party.example.com
```

## 3. Mandatory Hardening Before Go-Live
Do not go live until all items below are complete.

- [ ] JWT secret is non-default and strong (`APP_JWT_SECRET` not `secret`).
- [ ] PostgreSQL password is non-default and strong (`SPRING_DATASOURCE_PASSWORD`).
- [ ] Logging is production-safe (no DEBUG/TRACE for security/redis/cache in prod).
- [ ] Swagger and H2 endpoints are blocked from internet access (`/swagger-ui`, `/v3/api-docs`, `/h2-console`).
- [ ] Seed/default account behavior is reviewed (`import.sql` currently inserts `admin@admin.com`).
- [ ] Upload storage is persistent (`uploads_data` volume) and included in backups.

## 4. Server Bootstrap (One-Time)
Run on the VM as a sudo-capable user.

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release git nginx certbot python3-certbot-nginx ufw

# Docker official repository
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl enable --now docker
sudo systemctl enable --now nginx

# Optional: run docker commands without sudo (log out/in afterwards)
sudo usermod -aG docker "$USER"

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

## 5. Clone and Configure
Run on the VM:

```bash
set -euo pipefail

sudo mkdir -p "$DEPLOY_PATH"
sudo chown -R "$USER":"$USER" "$DEPLOY_PATH"

git clone "$REPO_URL" "$DEPLOY_PATH"
cd "$DEPLOY_PATH"
git checkout "$BRANCH"
```

Create server-only backend environment file:

```bash
cat > "$DEPLOY_PATH/.env.prod" << 'EOF'
# Backend runtime env contract
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/partyapp_prod
SPRING_DATASOURCE_USERNAME=partyapp_user
SPRING_DATASOURCE_PASSWORD=CHANGE_ME_STRONG_DB_PASSWORD
SPRING_DATA_REDIS_HOST=redis
SPRING_DATA_REDIS_PORT=6379
APP_JWT_SECRET=CHANGE_ME_STRONG_JWT_SECRET_MIN_32_CHARS
APP_JWT_EXPIRATION_MS=86400000
FILE_STORAGE_TYPE=local
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# Production-safe logging overrides
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=INFO
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_DATA_REDIS=WARN
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_CACHE=INFO
EOF

chmod 600 "$DEPLOY_PATH/.env.prod"
```

Create frontend production env:

```bash
cat > "$DEPLOY_PATH/frontend/.env.production" << 'EOF'
VITE_API_URL=/api
EOF
```

## 6. Build Artifacts
Backend image (Spring Boot buildpacks, no Dockerfile needed):

```bash
cd "$DEPLOY_PATH"
./mvnw -DskipTests spring-boot:build-image \
  -Dspring-boot.build-image.imageName=party-app-backend:prod
```

Frontend static bundle:

```bash
cd "$DEPLOY_PATH/frontend"
npm ci
npm run build
```

Create frontend Nginx config for SPA fallback:

```bash
cat > "$DEPLOY_PATH/frontend/nginx.prod.conf" << 'EOF'
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
EOF
```

## 7. Create docker-compose.prod.yml
Create this file in `$DEPLOY_PATH`:

```bash
cat > "$DEPLOY_PATH/docker-compose.prod.yml" << 'EOF'
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    env_file:
      - .env.prod
    environment:
      POSTGRES_DB: partyapp_prod
      POSTGRES_USER: ${SPRING_DATASOURCE_USERNAME}
      POSTGRES_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\""]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  backend:
    image: party-app-backend:prod
    restart: unless-stopped
    env_file:
      - .env.prod
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - uploads_data:/workspace/uploads
    healthcheck:
      test: ["CMD-SHELL", "wget -q --spider http://localhost:8080/api/news || exit 1"]
      interval: 20s
      timeout: 5s
      retries: 8
      start_period: 45s

  frontend:
    image: nginx:1.27-alpine
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_started
    ports:
      - "127.0.0.1:4173:80"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./frontend/nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro

volumes:
  postgres_data:
  uploads_data:
EOF
```

## 8. Run Stack
Start services:

```bash
cd "$DEPLOY_PATH"
docker compose -f docker-compose.prod.yml up -d
```

Check status and logs:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f --tail=150 backend
docker compose -f docker-compose.prod.yml logs -f --tail=100 frontend
```

## 9. Nginx Reverse Proxy
Create host Nginx site config:

```bash
sudo tee /etc/nginx/sites-available/party-app.conf > /dev/null << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    client_max_body_size 20m;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Block dev/docs endpoints from public internet
    location ~ ^/(swagger-ui|v3/api-docs|h2-console)/ {
        return 404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection "";
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:4173;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/party-app.conf /etc/nginx/sites-enabled/party-app.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 10. Enable HTTPS
Issue certificate and enable redirect:

```bash
sudo certbot --nginx \
  -d "$DOMAIN" \
  -m "$LETSENCRYPT_EMAIL" \
  --agree-tos \
  --no-eff-email \
  --redirect
```

Verify certificate auto-renew:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

Expected dry-run result: `Congratulations, all simulated renewals succeeded`.

## 11. Release Runbook (Repeat Deploys)
Run for every deployment:

```bash
set -euo pipefail

cd "$DEPLOY_PATH"
git fetch --all --tags
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

./mvnw -DskipTests spring-boot:build-image \
  -Dspring-boot.build-image.imageName=party-app-backend:prod

cd "$DEPLOY_PATH/frontend"
npm ci
npm run build

cd "$DEPLOY_PATH"
docker compose -f docker-compose.prod.yml up -d --remove-orphans
docker compose -f docker-compose.prod.yml ps
```

Smoke checks after release:

```bash
curl -f "https://$DOMAIN/api/news" > /dev/null
curl -f "https://$DOMAIN/" > /dev/null
```

## 12. Validation Checklist
Browser checks:
- [ ] `https://<DOMAIN>/` loads frontend.
- [ ] Login form works end-to-end.
- [ ] Authenticated pages can access protected API data.

API checks:

```bash
# Public endpoint
curl -i "https://$DOMAIN/api/news"

# Login (check JSON includes token)
curl -i -X POST "https://$DOMAIN/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"password"}'

# Protected endpoint (replace <JWT_TOKEN>)
curl -i "https://$DOMAIN/api/auth/me" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

File upload check:

```bash
curl -i -X POST "https://$DOMAIN/api/files/upload" \
  -F "file=@/path/to/local/image.jpg"
```

Expected: JSON includes a `fileUrl` under `/uploads/...`.

Persistence checks:

```bash
cd "$DEPLOY_PATH"
docker compose -f docker-compose.prod.yml restart postgres backend
docker compose -f docker-compose.prod.yml ps
curl -i "https://$DOMAIN/api/news"
```

- [ ] Data still present after restart.
- [ ] Uploaded files remain available via `/uploads/*`.

## 13. Rollback
If a release is bad, roll back to a known commit or tag:

```bash
set -euo pipefail

cd "$DEPLOY_PATH"
git fetch --all --tags
git log --oneline --decorate -n 20

# Example rollback target
git checkout <previous-good-tag-or-commit>

./mvnw -DskipTests spring-boot:build-image \
  -Dspring-boot.build-image.imageName=party-app-backend:prod

cd "$DEPLOY_PATH/frontend"
npm ci
npm run build

cd "$DEPLOY_PATH"
docker compose -f docker-compose.prod.yml up -d --remove-orphans
```

If data corruption happened, restore latest DB backup before reopening traffic:

```bash
# Example restore (from custom-format backup)
docker compose -f docker-compose.prod.yml exec -T postgres \
  dropdb -U "$SPRING_DATASOURCE_USERNAME" --if-exists partyapp_prod
docker compose -f docker-compose.prod.yml exec -T postgres \
  createdb -U "$SPRING_DATASOURCE_USERNAME" partyapp_prod
cat /path/to/backup.dump | docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_restore -U "$SPRING_DATASOURCE_USERNAME" -d partyapp_prod --clean --if-exists
```

Re-run smoke checks from section 12 after rollback.

## 14. Operations
Recommended backup cadence:
- PostgreSQL: daily full backup + retention policy.
- Uploads volume: daily archive + retention policy.
- Before every deployment: quick backup snapshot.

Example DB backup:

```bash
mkdir -p "$DEPLOY_PATH/backups"
docker compose -f "$DEPLOY_PATH/docker-compose.prod.yml" exec -T postgres \
  pg_dump -U "$SPRING_DATASOURCE_USERNAME" -d partyapp_prod -Fc \
  > "$DEPLOY_PATH/backups/db_$(date +%F_%H%M).dump"
```

Example uploads backup:

```bash
docker run --rm \
  -v uploads_data:/data \
  -v "$DEPLOY_PATH/backups":/backup \
  alpine sh -c 'tar czf /backup/uploads_$(date +%F_%H%M).tar.gz -C /data .'
```

Useful runtime commands:

```bash
docker compose -f "$DEPLOY_PATH/docker-compose.prod.yml" ps
docker compose -f "$DEPLOY_PATH/docker-compose.prod.yml" logs -f --tail=200 backend
docker compose -f "$DEPLOY_PATH/docker-compose.prod.yml" logs -f --tail=200 postgres
sudo journalctl -u nginx -f
sudo nginx -t
```

Known caveats for current repository:
- `SecurityConfig` currently allows Swagger/H2 paths; Nginx rule above blocks public access but code-level hardening is still recommended.
- `import.sql` seeds a default admin user; remove/replace for production safety.
- `spring.jpa.hibernate.ddl-auto=update` is convenient but not migration-safe long-term; move to managed migrations (Flyway/Liquibase).
- Local file storage uses `./uploads`; keep `uploads_data` volume and backups healthy.
- CORS currently allows `http://localhost:5173`; single-domain reverse proxy avoids cross-origin issues, but cross-domain deployments require CORS updates.

## Test Cases and Scenarios
- [ ] Fresh VM first-time deploy succeeds end-to-end (app + api + uploads + tls).
- [ ] Standard update deploy succeeds using section 11 with no undocumented steps.
- [ ] `certbot renew --dry-run` succeeds.
- [ ] Forced rollback to previous good version recovers service correctly.
- [ ] Postgres data and uploaded files persist across service restarts.

## Assumptions and Defaults
- Ubuntu 24.04 LTS.
- Single VM production target.
- Postgres and Redis run on the same VM via Docker Compose.
- Single-domain routing with `/api`.
- Deploy branch is `main`.
- Repo URL is `https://github.com/Andrei1694/the-party-app.git`.
- Secrets are server-side only and not committed to git.
- If real domain/host values are unknown, edit section 2 once and reuse throughout.
