# TutorsPool Production Deployment Script
# Run this script to deploy to Vercel production

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TutorsPool Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Project directory verified" -ForegroundColor Green
Write-Host ""

# Step 2: Check for uncommitted changes
Write-Host "📋 Checking for uncommitted changes..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $commit = Read-Host "Do you want to commit these changes? (y/n)"
    
    if ($commit -eq "y" -or $commit -eq "Y") {
        $message = Read-Host "Enter commit message"
        if (-not $message) {
            $message = "Production deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        
        Write-Host "📝 Committing changes..." -ForegroundColor Yellow
        git add .
        git commit -m "$message"
        Write-Host "✅ Changes committed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Proceeding without committing changes" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}
Write-Host ""

# Step 3: Run production build test
Write-Host "🔨 Testing production build..." -ForegroundColor Yellow
$buildResult = npm run build:production 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "Please fix build errors before deploying." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Build output:" -ForegroundColor Yellow
    Write-Host $buildResult
    exit 1
}
Write-Host "✅ Production build successful" -ForegroundColor Green
Write-Host ""

# Step 4: Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

$push = Read-Host "Push to GitHub? (y/n)"
if ($push -eq "y" -or $push -eq "Y") {
    git push origin $currentBranch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Push failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipping GitHub push" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Check if Vercel CLI is installed
Write-Host "🔍 Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI not found" -ForegroundColor Yellow
    $install = Read-Host "Install Vercel CLI? (y/n)"
    if ($install -eq "y" -or $install -eq "Y") {
        Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
        Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Skipping Vercel deployment" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To deploy manually:" -ForegroundColor Cyan
        Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "2. Your project will auto-deploy from GitHub" -ForegroundColor White
        Write-Host "3. Or install Vercel CLI: npm install -g vercel" -ForegroundColor White
        exit 0
    }
}
Write-Host "✅ Vercel CLI ready" -ForegroundColor Green
Write-Host ""

# Step 6: Deploy to Vercel
Write-Host "🚀 Deploying to Vercel production..." -ForegroundColor Yellow
$deploy = Read-Host "Deploy to Vercel production now? (y/n)"
if ($deploy -eq "y" -or $deploy -eq "Y") {
    Write-Host "Deploying..." -ForegroundColor Yellow
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Check deployment at: https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "2. Test your site at: https://tutorspool.com" -ForegroundColor White
        Write-Host "3. Verify all features are working" -ForegroundColor White
        Write-Host ""
        Write-Host "Testing checklist:" -ForegroundColor Cyan
        Write-Host "- Student registration" -ForegroundColor White
        Write-Host "- Tutor registration" -ForegroundColor White
        Write-Host "- Admin registration" -ForegroundColor White
        Write-Host "- Login functionality" -ForegroundColor White
        Write-Host "- Contact form" -ForegroundColor White
        Write-Host "- Email sending" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        Write-Host "Check the error messages above." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Cyan
        Write-Host "- Environment variables not set in Vercel" -ForegroundColor White
        Write-Host "- Build errors" -ForegroundColor White
        Write-Host "- Network issues" -ForegroundColor White
        Write-Host ""
        Write-Host "For help, see: VERCEL_PRODUCTION_DEPLOYMENT.md" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Deployment Cancelled" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your changes have been:" -ForegroundColor Yellow
    Write-Host "✅ Built successfully" -ForegroundColor Green
    Write-Host "✅ Pushed to GitHub (if selected)" -ForegroundColor Green
    Write-Host ""
    Write-Host "To deploy later:" -ForegroundColor Cyan
    Write-Host "- Run: vercel --prod" -ForegroundColor White
    Write-Host "- Or wait for auto-deployment from GitHub" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Script Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
