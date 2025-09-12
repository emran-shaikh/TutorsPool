#!/bin/bash

echo "🚀 TutorsPool - Vercel Deployment Fix"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Clean and rebuild
print_info "Step 1: Cleaning and rebuilding..."
rm -rf dist
rm -rf node_modules/.vite
npm run build

if [ $? -eq 0 ]; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 2: Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed. Installing..."
    npm install -g vercel
    if [ $? -eq 0 ]; then
        print_status "Vercel CLI installed successfully"
    else
        print_error "Failed to install Vercel CLI"
        exit 1
    fi
fi

# Step 3: Check if we're logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please login..."
    vercel login
    if [ $? -eq 0 ]; then
        print_status "Successfully logged in to Vercel"
    else
        print_error "Failed to login to Vercel"
        exit 1
    fi
fi

# Step 4: Deploy with force flag to bypass cache
print_info "Step 4: Deploying to Vercel (bypassing cache)..."
vercel --prod --force

if [ $? -eq 0 ]; then
    print_status "Deployment completed successfully!"
    echo ""
    print_info "🔗 Your app should now be live at:"
    print_info "   https://tutors-pool.vercel.app"
    echo ""
    print_warning "⚠️  Important: Wait 2-3 minutes for deployment to fully propagate"
    print_warning "⚠️  If you still see 404 errors, try:"
    print_warning "   1. Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)"
    print_warning "   2. Clear browser cache"
    print_warning "   3. Try in incognito/private mode"
    echo ""
    print_info "🧪 Test these URLs:"
    print_info "   • https://tutors-pool.vercel.app/"
    print_info "   • https://tutors-pool.vercel.app/login"
    print_info "   • https://tutors-pool.vercel.app/signup"
    print_info "   • https://tutors-pool.vercel.app/tutor/dashboard"
    print_info "   • https://tutors-pool.vercel.app/student/dashboard"
    print_info "   • https://tutors-pool.vercel.app/admin"
else
    print_error "Deployment failed"
    exit 1
fi
