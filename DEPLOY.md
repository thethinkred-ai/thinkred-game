# ThinkRed Economic Simulator — Деплой на VPS

## Требования

- **OS:** Ubuntu 22.04 LTS / Debian 12
- **RAM:** ≥ 1 GB
- **Node.js:** 20 LTS
- **Ports:** 80 (HTTP), 3001 (backend API)

## Быстрый старт (ручной)

### 1. Установка Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

### 2. Клонирование и установка

```bash
cd /opt
# Распаковать архив или git clone
unzip thinkred-sprint-a.zip -d thinkred-game
cd thinkred-game
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 3. Настройка .env

```bash
cp server/.env.example server/.env
nano server/.env
```

Минимальная конфигурация:
```env
PORT=3001
NODE_ENV=production
JWT_SECRET=сгенерируйте-случайную-строку-32+символа
DATABASE_PATH=/opt/thinkred-game/server/thinkred.db
DEV_UNLOCK_ALL_LESSONS=false
```

### 4. Миграция БД

```bash
cd /opt/thinkred-game/server
npm run migrate
```

### 5. Сборка клиента

```bash
cd /opt/thinkred-game/client
npx vite build
```

### 6. Запуск

```bash
cd /opt/thinkred-game/server
node dist/index.js
```

## Stepik OAuth — Настройка

1. Зарегистрируйте приложение на https://stepik.org/oauth2/applications/
2. В поле **Redirect URI** укажите: `http://YOUR_DOMAIN/auth/stepik/callback`
3. Скопируйте Client ID и Client Secret в `server/.env`:
   ```
   STEPIK_CLIENT_ID=ваш-id
   STEPIK_CLIENT_SECRET=ваш-secret
   STEPIK_REDIRECT_URI=http://YOUR_DOMAIN/auth/stepik/callback
   ```

## Docker

```bash
# Сборка и запуск
docker compose up -d

# Логи
docker compose logs -f
```

Конфигурация:
- `Dockerfile` — мультистейдж: сборка клиента + сервера, nginx + Node
- `docker-compose.yml` — один сервис, порт 80, volume для БД
- `nginx.conf` — прокси API, раздача статики, WebSocket

## PM2

```bash
npm install -g pm2
cp ecosystem.config.cjs /opt/thinkred-game/
cd /opt/thinkred-game
pm2 start ecosystem.config.cjs --only thinkred-server
pm2 save
pm2 startup
```

## systemd

```ini
# /etc/systemd/system/thinkred-server.service
[Unit]
Description=ThinkRed Game Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/thinkred-game/server
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/opt/thinkred-game/server/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now thinkred-server
```

## nginx (без Docker)

```nginx
# /etc/nginx/sites-available/thinkred
server {
    listen 80;
    server_name your-domain.com;

    root /opt/thinkred-game/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /auth/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
    }

    location /health {
        proxy_pass http://127.0.0.1:3001;
    }

    location /ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Бэкапы

```bash
# Ежедневно в 3:00
0 3 * * * cp /opt/thinkred-game/server/thinkred.db /backup/thinkred-$(date +\%Y\%m\%d).db

# Сохранять только последние 7
0 3 * * * find /backup -name "thinkred-*.db" -mtime +7 -delete
```

## Безопасность

1. **JWT_SECRET** — минимум 32 символа
2. **NODE_ENV=production** — отключает dev-login
3. **HTTPS** — через Let's Encrypt
4. **Firewall** — открыть только 80/443
5. **Rate limiting** в nginx:
   ```nginx
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
   location /api/ { limit_req zone=api burst=20 nodelay; ... }
   ```

## Проверка

```bash
# Health check
curl http://localhost:3001/health

# API
curl http://your-domain.com/api/game/state

# Frontend
curl http://your-domain.com/
```

## Обновление

```bash
cd /opt/thinkred-game
# Распаковать новый архив
unzip -o thinkred-sprint-a.zip
cd server && npm install && npm run migrate && cd ..
cd client && npm install && npx vite build && cd ..
# Перезапустить
pm2 restart thinkred-server
# или
sudo systemctl restart thinkred-server
```
