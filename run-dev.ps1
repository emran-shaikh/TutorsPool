# Run Development Server Script for TutorsPool
# This script bypasses PowerShell execution policy issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TutorsPool Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Parse command line arguments
$serverType = $args[0]

switch ($serverType) {
    "frontend" {
        Write-Host "Starting frontend development server..." -ForegroundColor Green
        Write-Host "Server will be available at: http://localhost:5173" -ForegroundColor Cyan
        npm run dev
    }
    "backend" {
        Write-Host "Starting backend server..." -ForegroundColor Green
        Write-Host "Server will be available at: http://localhost:5174" -ForegroundColor Cyan
        npm run server
    }
    "both" {
        Write-Host "Starting both frontend and backend servers..." -ForegroundColor Green
        Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
        Write-Host "Backend:  http://localhost:5174" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Note: You may need to run these in separate terminals:" -ForegroundColor Yellow
        Write-Host "  Terminal 1: .\run-dev.ps1 frontend" -ForegroundColor White
        Write-Host "  Terminal 2: .\run-dev.ps1 backend" -ForegroundColor White
        npm run dev
    }
    "build" {
        Write-Host "Building for production..." -ForegroundColor Green
        npm run build
    }
    "preview" {
        Write-Host "Starting production preview..." -ForegroundColor Green
        npm run preview
    }
    default {
        Write-Host "Usage: .\run-dev.ps1 [option]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Options:" -ForegroundColor Cyan
        Write-Host "  frontend  - Start frontend dev server (port 5173)" -ForegroundColor White
        Write-Host "  backend   - Start backend server (port 5174)" -ForegroundColor White
        Write-Host "  both      - Start both servers" -ForegroundColor White
        Write-Host "  build     - Build for production" -ForegroundColor White
        Write-Host "  preview   - Preview production build" -ForegroundColor White
        Write-Host ""
        Write-Host "Example: .\run-dev.ps1 frontend" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
