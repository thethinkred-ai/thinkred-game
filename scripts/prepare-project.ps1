# PowerShell script to prepare ThinkRed Economic Simulator for launch
Write-Host "🚀 Preparing ThinkRed Economic Simulator for launch..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Install client dependencies
Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
Set-Location client
if (Test-Path "package.json") {
    npm install
    npm install --save-dev @types/node
    npm install --save-dev @types/react @types/react-dom
    npm install axios recharts
    Write-Host "✅ Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ package.json not found in client directory" -ForegroundColor Red
    exit 1
}

# Install server dependencies
Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location ..\server
if (Test-Path "package.json") {
    npm install
    npm install --save-dev @types/node @types/express @types/cors
    npm install express cors dotenv helmet jsonwebtoken bcryptjs
    Write-Host "✅ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ package.json not found in server directory" -ForegroundColor Red
    exit 1
}

# Create environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating environment file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created from template" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file with your configuration:" -ForegroundColor Yellow
    Write-Host "   - Stepik API credentials" -ForegroundColor Yellow
    Write-Host "   - Database connection string" -ForegroundColor Yellow
    Write-Host "   - JWT secret key" -ForegroundColor Yellow
}

# Go back to root
Set-Location ..

# Create launch script
Write-Host "📜 Creating launch script..." -ForegroundColor Yellow
$launchScript = @"
@echo off
echo 🚀 Starting ThinkRed Economic Simulator...
echo.

echo 📦 Starting server...
start "ThinkRed Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak > nul

echo 🌐 Starting client...
start "ThinkRed Client" cmd /k "cd client && npm run dev"

echo.
echo ✅ Both servers are starting...
echo 🌐 Client: http://localhost:3000
echo 🔧 Server API: http://localhost:3001
echo 📊 Health check: http://localhost:3001/health
echo.
echo Press any key to close this window...
pause > nul
"@

$launchScript | Out-File -FilePath "start-thinkred.bat" -Encoding ASCII
Write-Host "✅ Launch script created: start-thinkred.bat" -ForegroundColor Green

# Create development guide
Write-Host "📚 Creating development guide..." -ForegroundColor Yellow
$devGuide = @"
# ThinkRed Economic Simulator - Development Guide

## Quick Start
1. Run \`start-thinkred.bat\` to launch both servers
2. Open http://localhost:3000 in your browser
3. Click "Войти через Stepik" to start

## Manual Start
### Server (Terminal 1)
\`\`\`bash
cd server
npm run dev
\`\`\`

### Client (Terminal 2)
\`\`\`bash
cd client
npm run dev
\`\`\`

## URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Troubleshooting
- Port 3000/3001 busy: Change PORT in .env file
- TypeScript errors: Run \`npm install\` in client/server directories
- Stepik OAuth: Check redirect URI in Stepik settings

## Development Commands
- Build client: \`cd client && npm run build\`
- Build server: \`cd server && npm run build\`
- Run tests: \`npm test\`
- Lint code: \`npm run lint\`
"@

$devGuide | Out-File -FilePath "DEV_GUIDE.md" -Encoding UTF8
Write-Host "✅ Development guide created: DEV_GUIDE.md" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "🎉 Project preparation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit server\.env with your Stepik API credentials" -ForegroundColor White
Write-Host "2. Run start-thinkred.bat to launch the application" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "🚀 ThinkRed Economic Simulator is ready to launch!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Additional resources:" -ForegroundColor Cyan
Write-Host "- DEV_GUIDE.md - Development guide" -ForegroundColor White
Write-Host "- QUICK_START.md - Quick start instructions" -ForegroundColor White
Write-Host "- docs/presentation.md - Project presentation" -ForegroundColor White
Write-Host "- README.md - Full documentation" -ForegroundColor White
Write-Host ""
Write-Host "🎮 Happy coding! Let's build the future of economic education!" -ForegroundColor Magenta
