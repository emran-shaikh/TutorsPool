# WhatsApp Setup Script for TutorsPool
# This script creates the .env.local file with your WhatsApp credentials

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TutorsPool WhatsApp Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envContent = @"
# TutorsPool Local Development Environment Variables
# WhatsApp Business API Configuration

# WhatsApp Business API Configuration (Client-side - for frontend)
VITE_WHATSAPP_ACCESS_TOKEN=EAAXUlG3a7GcBPg9iZCkJu0cZC6ZBvTauIFk5bx34eswoj9AY7031zegN72DxV906o6ivzRJMaVnBlUuVd4ZAOPNSei4ZA08jYCgMZCJEHtzvljGaZAMnh53xgUIqrimW8tsZAluK4PYQc5skpsLulaw2SPAEZAsFRFbPYQZCRoUPOQKeo8qmZBtXAVSh1iBD7QVZBCUttQEh8OMGqY7Fl6zO3HDMJLyLevx1zw2cnMmDVUzXkp7rXnujbDOPwemJl3AeOgZDZD
VITE_WHATSAPP_PHONE_NUMBER_ID=841145552417635
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=792592937027748
VITE_ADMIN_WHATSAPP_NUMBER=+923009271976

# WhatsApp Server-side Configuration (for webhooks)
WHATSAPP_ACCESS_TOKEN=EAAXUlG3a7GcBPg9iZCkJu0cZC6ZBvTauIFk5bx34eswoj9AY7031zegN72DxV906o6ivzRJMaVnBlUuVd4ZAOPNSei4ZA08jYCgMZCJEHtzvljGaZAMnh53xgUIqrimW8tsZAluK4PYQc5skpsLulaw2SPAEZAsFRFbPYQZCRoUPOQKeo8qmZBtXAVSh1iBD7QVZBCUttQEh8OMGqY7Fl6zO3HDMJLyLevx1zw2cnMmDVUzXkp7rXnujbDOPwemJl3AeOgZDZD
WHATSAPP_PHONE_NUMBER_ID=841145552417635
WHATSAPP_BUSINESS_ACCOUNT_ID=792592937027748
WHATSAPP_WEBHOOK_SECRET=tutorspool_webhook_secret_2025
WHATSAPP_VERIFY_TOKEN=tutorspool_verify_token_2025

# Server Configuration
PORT=5174
NODE_ENV=development

# Security Settings
JWT_SECRET=tutorspool_jwt_secret_development_only
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5174

# API Configuration
VITE_API_URL=http://localhost:5174/api
"@

# Check if .env.local already exists
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (yes/no)"
    
    if ($overwrite -ne "yes") {
        Write-Host ""
        Write-Host "❌ Setup cancelled. Existing file preserved." -ForegroundColor Red
        exit
    }
}

# Create the .env.local file
try {
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local file created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Your WhatsApp credentials have been configured:" -ForegroundColor Cyan
    Write-Host "   Phone Number ID: 841145552417635" -ForegroundColor White
    Write-Host "   Business Account ID: 792592937027748" -ForegroundColor White
    Write-Host "   Access Token: EAAXUlG3a7Gc... (configured)" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Stop your servers (Ctrl+C in both terminals)" -ForegroundColor White
    Write-Host "   2. Restart frontend: npm run dev" -ForegroundColor White
    Write-Host "   3. Restart backend: npm run server:dev" -ForegroundColor White
    Write-Host "   4. Open http://localhost:5173 and test the chatbot!" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 For detailed instructions, see: WHATSAPP_SETUP_COMPLETE.md" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✨ Setup complete! Your WhatsApp chatbot is ready to use!" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "❌ Error creating .env.local file: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create the file manually. See WHATSAPP_SETUP_COMPLETE.md for instructions." -ForegroundColor Yellow
    Write-Host ""
}

