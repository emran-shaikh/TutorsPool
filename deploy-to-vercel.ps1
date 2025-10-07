# 🚀 TutorsPool Vercel Deployment Script (PowerShell)
# This script automates the deployment process to Vercel on Windows

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

# Step 2: Type Check
Write-Host "🔍 Running TypeScript type check..." -ForegroundColor Blue
npm run type-check
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Type check passed" -ForegroundColor Green
} else {
    Write-Host "❌ Type check failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Lint Check
Write-Host "🧹 Running ESLint..." -ForegroundColor Blue
npm run lint
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Lint check passed" -ForegroundColor Green
} else {
    Write-Host "❌ Lint check failed" -ForegroundColor Red
    Write-Host "Attempting to fix..." -ForegroundColor Yellow
    npm run lint:fix
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Lint issues fixed" -ForegroundColor Green
    } else {
        Write-Host "❌ Could not fix all lint issues" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Step 4: Security Check
Write-Host "🔒 Running security check..." -ForegroundColor Blue
npm run security:check
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Security check passed" -ForegroundColor Green
} else {
    Write-Host "❌ Security check failed - hardcoded secrets detected!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Build Test
Write-Host "🏗️  Testing production build..." -ForegroundColor Blue
npm run build:production
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 6: Confirmation
Write-Host "⚠️  Ready to deploy to Vercel Production" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please confirm the following:"
Write-Host "  1. All environment variables are set in Vercel Dashboard"
Write-Host "  2. Firebase credentials are correct"
Write-Host "  3. Stripe keys are LIVE (pk_live_, sk_live_)"
Write-Host "  4. You have tested in preview/staging environment"
Write-Host ""
$confirmation = Read-Host "Do you want to continue? (yes/no)"
Write-Host ""

if ($confirmation -ne "yes" -and $confirmation -ne "Yes" -and $confirmation -ne "YES" -and $confirmation -ne "y") {
    Write-Host "Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

# Step 7: Deploy to Vercel
Write-Host "🚀 Deploying to Vercel Production..." -ForegroundColor Blue
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your application is now live!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Test the live application thoroughly"
    Write-Host "  2. Update Stripe webhooks with production URL"
    Write-Host "  3. Add production domain to Firebase Authorized Domains"
    Write-Host "  4. Monitor Vercel dashboard for errors"
    Write-Host "  5. Enable Vercel Analytics"
    Write-Host ""
    Write-Host "📊 View deployment: https://vercel.com/dashboard" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Check the error messages above and try again"
    exit 1
}

