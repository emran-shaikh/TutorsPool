# Git Push Script for TutorsPool
# This script will push your commits to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pushing to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check current status
Write-Host "📊 Checking Git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""

# Try to push
$pushResult = git push origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your changes are now on GitHub!" -ForegroundColor Green
    Write-Host "Vercel will automatically deploy if connected." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Check deployment at:" -ForegroundColor Yellow
    Write-Host "https://vercel.com/dashboard" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ Push failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $pushResult
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Cyan
    Write-Host "1. Use GitHub Desktop to push" -ForegroundColor White
    Write-Host "2. Or run in PowerShell (not Git Bash):" -ForegroundColor White
    Write-Host "   git push origin main" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
