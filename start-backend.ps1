# TutorsPool Backend Setup & Start Script
# This script will install dependencies and start the backend server

Write-Host "🚀 TutorsPool Backend Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Google Generative AI package
Write-Host "📦 Step 1/3: Installing @google/generative-ai package..." -ForegroundColor Yellow
npm install @google/generative-ai

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Package installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Package installation failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Step 2: Create .env.local file
Write-Host "⚙️  Step 2/3: Setting up environment variables..." -ForegroundColor Yellow

$envContent = @"
# AI Configuration
GOOGLE_AI_API_KEY=AIzaSyAkeA7LykGr9ckcT50JH7Ie2kUUU5s7T4M
AI_PROVIDER=google
GOOGLE_AI_MODEL=gemini-pro

# WhatsApp Configuration
VITE_WHATSAPP_ACCESS_TOKEN=EAAXUlG3a7GcBPg9iZCkJu0cZC6ZBvTauIFk5bx34eswoj9AY7031zegN72DxV906o6ivzRJMaVnBlUuVd4ZAOPNSei4ZA08jYCgMZCJEHtzvljGaZAMnh53xgUIqrimW8tsZAluK4PYQc5skpsLulaw2SPAEZAsFRFbPYQZCRoUPOQKeo8qmZBtXAVSh1iBD7QVZBCUttQEh8OMGqY7Fl6zO3HDMJLyLevx1zw2cnMmDVUzXkp7rXnujbDOPwemJl3AeOgZDZD
VITE_WHATSAPP_PHONE_NUMBER_ID=841145552417635
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=792592937027748
VITE_ADMIN_WHATSAPP_NUMBER=+923009271976

# Server Configuration
PORT=5174
NODE_ENV=development

# JWT Secret (change in production)
JWT_SECRET=4792d1dd4dc9998372456c8e8369767b
"@

Set-Content -Path ".env.local" -Value $envContent
Write-Host "✅ Environment file created!" -ForegroundColor Green
Write-Host ""

# Step 3: Start backend server
Write-Host "🔥 Step 3/3: Starting backend server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Backend will run on: http://localhost:5174" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

npm run server:dev

