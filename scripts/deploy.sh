#!/bin/bash

# ThinkRed Game Deployment Script
# This script builds and deploys the ThinkRed Economic Simulator for production

echo "🚀 ThinkRed Economic Simulator Deployment Script"
echo "=================================================="

# Configuration
BUILD_DIR="./build"
CLIENT_BUILD_DIR="$BUILD_DIR/client"
SERVER_BUILD_DIR="$BUILD_DIR/server"
BACKUP_DIR="./backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "📅 Deployment timestamp: $TIMESTAMP"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Function to handle errors
handle_error() {
    echo "❌ Error occurred in line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf "$BUILD_DIR"
mkdir -p "$CLIENT_BUILD_DIR" "$SERVER_BUILD_DIR"

# Build client
echo "🏗️  Building client..."
cd client
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in client directory"
    exit 1
fi

npm ci --only=production
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Client build failed - dist directory not found"
    exit 1
fi

cp -r dist/* "../$CLIENT_BUILD_DIR/"
echo "✅ Client build completed"

# Build server
echo "🏗️  Building server..."
cd ../server
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in server directory"
    exit 1
fi

npm ci --only=production
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Server build failed - dist directory not found"
    exit 1
fi

cp -r dist/* "../$SERVER_BUILD_DIR/"
cp package.json "../$SERVER_BUILD_DIR/"
cp -r node_modules "../$SERVER_BUILD_DIR/"

echo "✅ Server build completed"

# Create production environment file
echo "📝 Creating production environment file..."
cat > "$SERVER_BUILD_DIR/.env" << 'EOF'
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
EOF

echo "⚠️  Remember to set your production environment variables in $SERVER_BUILD_DIR/.env"

# Create package.json for production deployment
echo "📦 Creating production package files..."

# Client package.json (for static serving)
cat > "$CLIENT_BUILD_DIR/package.json" << 'EOF'
{
  "name": "thinkred-game-client-prod",
  "version": "1.0.0",
  "description": "ThinkRed Economic Simulator - Production Client",
  "scripts": {
    "start": "npx serve -s . -l 3000"
  },
  "dependencies": {
    "serve": "^14.2.0"
  }
}
EOF

# Create deployment documentation
echo "📚 Creating deployment documentation..."
cat > "$BUILD_DIR/README.md" << EOF
# ThinkRed Economic Simulator - Production Build

## Build Information
- Build Date: $(date)
- Git Commit: $(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
- Branch: $(git branch --show-current 2>/dev/null || echo "N/A")

## Directory Structure
- \`client/\`: Static files for the React frontend
- \`server/\`: Node.js backend application

## Deployment Instructions

### Option 1: Manual Deployment
1. Copy \`client/\` directory to your web server (nginx, Apache, etc.)
2. Copy \`server/\` directory to your application server
3. Set environment variables in \`server/.env\`
4. Install dependencies: \`cd server && npm ci --only=production\`
5. Start server: \`npm start\`

### Option 2: Docker Deployment
See \`Dockerfile\` and \`docker-compose.yml\` in the root directory

### Option 3: PM2 Deployment
\`\`\`bash
# Install PM2
npm install -g pm2

# Start server with PM2
cd server
pm2 start ecosystem.config.js
\`\`\`

## Environment Variables Required
- \`DATABASE_URL\`: PostgreSQL connection string
- \`JWT_SECRET\`: Secret key for JWT tokens
- \`STEPIK_CLIENT_ID\`: Stepik OAuth client ID
- \`STEPIK_CLIENT_SECRET\`: Stepik OAuth client secret
- \`STEPIK_REDIRECT_URI\`: OAuth redirect URI

## Health Checks
- Client: http://your-domain.com
- Server API: http://your-domain.com:3001/health
- Server Health: \`curl http://localhost:3001/health\`

## Monitoring
- Check server logs: \`pm2 logs thinkred-server\`
- Monitor performance: \`pm2 monit\`
- Restart if needed: \`pm2 restart thinkred-server\`

## SSL/HTTPS
- Configure SSL certificates on your web server
- Update STEPIK_REDIRECT_URI to use https://
- Consider using reverse proxy (nginx) for SSL termination

EOF

# Create PM2 ecosystem file
echo "⚙️  Creating PM2 ecosystem configuration..."
cat > "$SERVER_BUILD_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'thinkred-server',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

mkdir -p "$SERVER_BUILD_DIR/logs"

# Create Docker configuration
echo "🐳 Creating Docker configuration..."
cat > "$BUILD_DIR/Dockerfile" << 'EOF'
# Multi-stage build for ThinkRed Economic Simulator
FROM node:18-alpine AS builder

WORKDIR /app

# Build client
COPY client/package*.json ./client/
RUN cd client && npm ci --only=production
COPY client/ ./client/
RUN cd client && npm run build

# Build server
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production
COPY server/ ./server/
RUN cd server && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy server build
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package*.json ./
COPY --from=builder /app/server/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

USER nodejs

EXPOSE 3001

CMD ["node", "dist/index.js"]
EOF

cat > "$BUILD_DIR/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  thinkred-server:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/thinkred_game
      - JWT_SECRET=your-super-secret-jwt-key
      - STEPIK_CLIENT_ID=your-stepik-client-id
      - STEPIK_CLIENT_SECRET=your-stepik-client-secret
    depends_on:
      - db
    restart: unless-stopped

  thinkred-client:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./client:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - thinkred-server
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=thinkred_game
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
EOF

cat > "$BUILD_DIR/nginx.conf" << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    upstream backend {
        server thinkred-server:3001;
    }

    server {
        listen 80;
        server_name localhost;

        # Serve static files
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        # Proxy API requests
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Proxy auth requests
        location /auth/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Create deployment script
echo "📜 Creating deployment script..."
cat > "$BUILD_DIR/deploy.sh" << 'EOF'
#!/bin/bash

# Production deployment script
echo "🚀 Deploying ThinkRed Economic Simulator..."

# Stop existing services
echo "⏹️  Stopping existing services..."
pm2 stop thinkred-server || true
pm2 delete thinkred-server || true

# Backup current deployment
if [ -d "/var/www/thinkred-game" ]; then
    echo "💾 Backing up current deployment..."
    sudo mv /var/www/thinkred-game /var/www/thinkred-game.backup.$(date +%Y%m%d_%H%M%S)
fi

# Deploy new version
echo "📦 Deploying new version..."
sudo mkdir -p /var/www/thinkred-game
sudo cp -r . /var/www/thinkred-game/
sudo chown -R $USER:$USER /var/www/thinkred-game

# Install dependencies and start server
echo "🔧 Starting services..."
cd /var/www/thinkred-game/server
npm ci --only=production
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

echo "✅ Deployment completed!"
echo "🌐 Client: http://your-domain.com"
echo "🔧 Server API: http://your-domain.com:3001"
echo "📊 PM2 monitoring: pm2 monit"
EOF

chmod +x "$BUILD_DIR/deploy.sh"

# Go back to root directory
cd ..

# Create archive
echo "📦 Creating deployment archive..."
ARCHIVE_NAME="thinkred-game-build-$TIMESTAMP.tar.gz"
tar -czf "$ARCHIVE_NAME" -C "$BUILD_DIR" .

echo "✅ Deployment archive created: $ARCHIVE_NAME"

# Summary
echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📁 Build directory: $BUILD_DIR"
echo "📦 Archive: $ARCHIVE_NAME"
echo ""
echo "📋 Next steps:"
echo "1. Test the build locally:"
echo "   - cd $CLIENT_BUILD_DIR && npm install && npm start"
echo "   - cd $SERVER_BUILD_DIR && npm start"
echo ""
echo "2. Deploy to production:"
echo "   - Copy $BUILD_DIR to your server"
echo "   - Follow instructions in $BUILD_DIR/README.md"
echo "   - Or use the automated script: $BUILD_DIR/deploy.sh"
echo ""
echo "3. Configure environment variables in $SERVER_BUILD_DIR/.env"
echo ""
echo "🚀 Ready for deployment!"
