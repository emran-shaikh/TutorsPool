# Fix Git Push Issue in Windsurf
# Run this script in PowerShell terminal

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fixing Git Push Authentication" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Configure credential helper
Write-Host "Step 1: Configuring Git credential manager..." -ForegroundColor Yellow
git config --global credential.helper manager-core
Write-Host "✅ Credential manager configured" -ForegroundColor Green
Write-Host ""

# Step 2: Check status
Write-Host "Step 2: Checking current status..." -ForegroundColor Yellow
git status -sb
Write-Host ""

# Step 3: Fetch latest
Write-Host "Step 3: Fetching latest from GitHub..." -ForegroundColor Yellow
git fetch origin
Write-Host "✅ Fetch complete" -ForegroundColor Green
Write-Host ""

# Step 4: Show commits to push
Write-Host "Step 4: Commits ready to push:" -ForegroundColor Yellow
git log --oneline origin/main..main
Write-Host ""

# Step 5: Push
Write-Host "Step 5: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  A browser window will open for authentication" -ForegroundColor Cyan
Write-Host ""

$pushResult = git push origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ SUCCESS! Pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your 3 commits are now on GitHub:" -ForegroundColor Green
    Write-Host "1. new changes with git fixes" -ForegroundColor White
    Write-Host "2. Merge branch 'main'" -ForegroundColor White
    Write-Host "3. fixed login issues and added all env variables" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Check GitHub: https://github.com/emran-shaikh/TutorsPool" -ForegroundColor White
    Write-Host "2. Vercel will auto-deploy (if connected)" -ForegroundColor White
    Write-Host "3. Check deployment: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ Push Failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error:" -ForegroundColor Yellow
    Write-Host $pushResult
    Write-Host ""
    Write-Host "Alternative solutions:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: Use GitHub Desktop" -ForegroundColor Yellow
    Write-Host "  - Open GitHub Desktop" -ForegroundColor White
    Write-Host "  - Click 'Push origin'" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Use Personal Access Token" -ForegroundColor Yellow
    Write-Host "  1. Create token: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "  2. Run: git push https://TOKEN@github.com/emran-shaikh/TutorsPool.git main" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 3: Configure SSH" -ForegroundColor Yellow
    Write-Host "  See: GIT_PUSH_INSTRUCTIONS.md" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
