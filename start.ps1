# ThinkRed Economic Simulator - launch script (ASCII-only to avoid PowerShell encoding issues)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "=== ThinkRed Economic Simulator ===" -ForegroundColor Green
Write-Host ""

# Check project structure
Write-Host "[1/3] Checking project structure..." -ForegroundColor Yellow
if (-not (Test-Path "client\package.json")) { Write-Host "ERROR: client\package.json not found" -ForegroundColor Red; exit 1 }
if (-not (Test-Path "server\package.json")) { Write-Host "ERROR: server\package.json not found" -ForegroundColor Red; exit 1 }
if (-not (Test-Path "server\.env")) {
    Write-Host "ERROR: server\.env not found. Copy server\.env.example to server\.env" -ForegroundColor Red
    exit 1
}
Write-Host "  OK" -ForegroundColor Green

# Check dependencies
Write-Host "[2/3] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "client\node_modules")) {
    Write-Host "  Installing client dependencies..." -ForegroundColor Cyan
    Push-Location client; npm install; Pop-Location
}
if (-not (Test-Path "server\node_modules")) {
    Write-Host "  Installing server dependencies..." -ForegroundColor Cyan
    Push-Location server; npm install; Pop-Location
}
Write-Host "  OK" -ForegroundColor Green

# Start servers in separate windows
Write-Host "[3/3] Starting servers..." -ForegroundColor Yellow

$serverPath = Join-Path $root "server"
$clientPath = Join-Path $root "client"

Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title ThinkRed Server && cd /d `"$serverPath`" && npm run dev"
Start-Sleep -Seconds 3
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title ThinkRed Client && cd /d `"$clientPath`" && npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Servers started!" -ForegroundColor Green
Write-Host "  Frontend:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend API:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Health check: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "To stop the servers, close the two server windows that were opened." -ForegroundColor Yellow
