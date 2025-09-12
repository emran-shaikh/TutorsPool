# TutorsPool Production Deployment Script for Windows
# PowerShell script for Windows deployment

Write-Host "🚀 Starting TutorsPool Production Deployment..." -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Status "Node.js version: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js first."
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Status "npm version: $npmVersion"
} catch {
    Write-Error "npm is not installed. Please install npm first."
    exit 1
}

Write-Status "Environment checks passed"

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
try {
    npm install --production
    Write-Status "Dependencies installed successfully"
} catch {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Build frontend
Write-Host "🏗️  Building frontend..." -ForegroundColor Cyan
try {
    npm run build
    Write-Status "Frontend built successfully"
} catch {
    Write-Error "Failed to build frontend"
    exit 1
}

# Check if PM2 is installed
try {
    $pm2Version = pm2 --version
    Write-Status "PM2 version: $pm2Version"
} catch {
    Write-Warning "PM2 is not installed. Installing PM2..."
    try {
        npm install -g pm2
        Write-Status "PM2 installed successfully"
    } catch {
        Write-Error "Failed to install PM2"
        exit 1
    }
}

# Create logs directory
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Status "Logs directory created"
}

# Start/restart PM2 processes
Write-Host "🔄 Starting/restarting PM2 processes..." -ForegroundColor Cyan
try {
    pm2 restart ecosystem.config.js --env production
    Write-Status "PM2 processes restarted successfully"
} catch {
    Write-Warning "PM2 restart failed, trying to start..."
    try {
        pm2 start ecosystem.config.js --env production
        Write-Status "PM2 processes started successfully"
    } catch {
        Write-Error "Failed to start PM2 processes"
        exit 1
    }
}

# Save PM2 configuration
try {
    pm2 save
    Write-Status "PM2 configuration saved"
} catch {
    Write-Warning "Failed to save PM2 configuration"
}

# Create backup
Write-Host "💾 Creating data backup..." -ForegroundColor Cyan
$BackupDir = "backups"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

if (Test-Path "server/data.json") {
    Copy-Item "server/data.json" "$BackupDir/data_$Date.json"
    Write-Status "Data backup created: $BackupDir/data_$Date.json"
    
    # Keep only last 7 days of backups
    Get-ChildItem -Path $BackupDir -Name "data_*.json" | Where-Object {
        (Get-Item "$BackupDir/$_").LastWriteTime -lt (Get-Date).AddDays(-7)
    } | ForEach-Object {
        Remove-Item "$BackupDir/$_" -Force
    }
    Write-Status "Old backups cleaned up"
} else {
    Write-Warning "No data.json file found to backup"
}

# Health check
Write-Host "🏥 Performing health check..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Check if backend is responding
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5174/api/tutors" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Status "Backend health check passed"
    } else {
        Write-Error "Backend health check failed with status: $($response.StatusCode)"
    }
} catch {
    Write-Error "Backend health check failed: $($_.Exception.Message)"
}

# Check if frontend is accessible
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Status "Frontend health check passed"
    } else {
        Write-Warning "Frontend health check failed with status: $($response.StatusCode)"
    }
} catch {
    Write-Warning "Frontend health check failed: $($_.Exception.Message)"
}

# Show PM2 status
Write-Host "📊 Current PM2 status:" -ForegroundColor Cyan
try {
    pm2 status
} catch {
    Write-Warning "Failed to get PM2 status"
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Status "Deployment completed successfully!"
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:8080 (or your configured domain)"
Write-Host "   Backend API: http://localhost:5174/api"
Write-Host "   Health Check: http://localhost:5174/api/health"
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Cyan
Write-Host "   pm2 status          - Check application status"
Write-Host "   pm2 logs            - View application logs"
Write-Host "   pm2 restart all     - Restart all applications"
Write-Host "   pm2 stop all        - Stop all applications"
Write-Host "   pm2 monit           - Monitor applications"
Write-Host ""
Write-Host "🔧 Configuration files:" -ForegroundColor Cyan
Write-Host "   PM2: ecosystem.config.js"
Write-Host "   Nginx: nginx.conf (Linux/Mac)"
Write-Host "   Logs: ./logs/"
Write-Host "   Backups: ./backups/"
Write-Host ""
Write-Status "TutorsPool is now running in production mode!"
