# PowerShell script to fix lint issues by installing dependencies
Write-Host "🔧 Fixing lint issues for ThinkRed Economic Simulator..." -ForegroundColor Green

# Install client dependencies
Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
Set-Location client
npm install

# Install additional required packages
Write-Host "📦 Installing additional packages..." -ForegroundColor Yellow
npm install --save-dev @types/node

# Install server dependencies
Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location ..\server
npm install

# Go back to root
Set-Location ..

Write-Host "✅ Dependencies installed. Lint issues should be resolved." -ForegroundColor Green
Write-Host "🚀 You can now run: npm run dev in both client/ and server/ directories" -ForegroundColor Cyan
