# Fix Dependencies Script
# This script will clean up and reinstall dependencies to resolve version conflicts

Write-Host "🧹 Cleaning up node_modules and package-lock.json..." -ForegroundColor Yellow
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

Write-Host "📦 Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "🔧 Installing dependencies with legacy peer deps..." -ForegroundColor Yellow
npm install --legacy-peer-deps

Write-Host "✅ Dependencies installation completed!" -ForegroundColor Green
