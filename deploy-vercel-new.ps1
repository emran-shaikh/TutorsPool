# 🚀 TutorsPool Vercel Deployment Script
# Updated for current project structure

Write-Host "🚀 TutorsPool Vercel Deployment" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Vercel CLI is installed
Write-Host "📦 Checking Vercel CLI..." -ForegroundColor Blue
try {
    $vercelVersion = vercel --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
    } else {
        throw "Vercel CLI not found"
    }
} catch {
    Write-Host "❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host "Installing Vercel CLI globally..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Step 2: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install --legacy-peer-deps
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Type Check
Write-Host "🔍 Running TypeScript type check..." -ForegroundColor Blue
npm run type-check
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Type check passed" -ForegroundColor Green
} else {
    Write-Host "❌ Type check failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Build Test
Write-Host "🏗️  Testing production build..." -ForegroundColor Blue
npm run vercel-build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
Write-Host "This will deploy to preview first. Check the preview, then deploy to production." -ForegroundColor Yellow
Write-Host ""

vercel

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your application preview is now live!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Test the preview deployment thoroughly"
    Write-Host "  2. Set environment variables in Vercel Dashboard if needed"
    Write-Host "  3. Run 'vercel --prod' to deploy to production"
    Write-Host "  4. Monitor Vercel dashboard for errors"
    Write-Host ""
    Write-Host "📊 View deployment: https://vercel.com/dashboard" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Check the error messages above and try again"
    exit 1
}
