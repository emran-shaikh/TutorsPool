# TutorsPool - Vercel Deployment Fix Script
Write-Host "🚀 TutorsPool - Vercel Deployment Fix" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Step 1: Clean and rebuild
Write-Host "`nℹ️  Step 1: Cleaning and rebuilding..." -ForegroundColor Blue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Step 2: Check if Vercel CLI is installed
Write-Host "`nℹ️  Step 2: Checking Vercel CLI..." -ForegroundColor Blue
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel CLI is not installed. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vercel CLI installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Check if we're logged in to Vercel
Write-Host "`nℹ️  Step 3: Checking Vercel login..." -ForegroundColor Blue
try {
    vercel whoami | Out-Null
    Write-Host "✅ Already logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not logged in to Vercel. Please login..." -ForegroundColor Yellow
    vercel login
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully logged in to Vercel" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to login to Vercel" -ForegroundColor Red
        exit 1
    }
}

# Step 4: Deploy with force flag to bypass cache
Write-Host "`nℹ️  Step 4: Deploying to Vercel (bypassing cache)..." -ForegroundColor Blue
vercel --prod --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Your app should now be live at:" -ForegroundColor Blue
    Write-Host "   https://tutors-pool.vercel.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  Important: Wait 2-3 minutes for deployment to fully propagate" -ForegroundColor Yellow
    Write-Host "⚠️  If you still see 404 errors, try:" -ForegroundColor Yellow
    Write-Host "   1. Hard refresh your browser (Ctrl+F5)" -ForegroundColor Yellow
    Write-Host "   2. Clear browser cache" -ForegroundColor Yellow
    Write-Host "   3. Try in incognito/private mode" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🧪 Test these URLs:" -ForegroundColor Blue
    Write-Host "   • https://tutors-pool.vercel.app/" -ForegroundColor Cyan
    Write-Host "   • https://tutors-pool.vercel.app/login" -ForegroundColor Cyan
    Write-Host "   • https://tutors-pool.vercel.app/signup" -ForegroundColor Cyan
    Write-Host "   • https://tutors-pool.vercel.app/tutor/dashboard" -ForegroundColor Cyan
    Write-Host "   • https://tutors-pool.vercel.app/student/dashboard" -ForegroundColor Cyan
    Write-Host "   • https://tutors-pool.vercel.app/admin" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Deployment failed" -ForegroundColor Red
    exit 1
}
