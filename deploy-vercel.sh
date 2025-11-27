#!/bin/bash

echo "🚀 Deploying TutorsPool to Vercel..."
echo "=================================="

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

# Check if Vercel CLI is installed
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

print_status "Vercel CLI is available"

# Check if we're logged in to Vercel
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

print_status "Logged in to Vercel"

# Choose deployment type
echo ""
echo "Choose deployment type:"
echo "1. Frontend only (recommended for quick fix)"
echo "2. Full stack (frontend + backend)"
echo "3. Backend only"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        print_info "Deploying frontend only..."
        
        # Use frontend configuration
        cp vercel-frontend.json vercel.json
        print_status "Configuration updated for frontend deployment"
        
        # Deploy frontend
        print_info "Deploying to Vercel..."
        vercel --prod
        
        if [ $? -eq 0 ]; then
            print_status "Frontend deployed successfully!"
            print_warning "Don't forget to:"
            print_warning "1. Set VITE_API_URL environment variable in Vercel dashboard"
            print_warning "2. Deploy your backend separately"
        else
            print_error "Frontend deployment failed"
            exit 1
        fi
        ;;
        
    2)
        print_info "Deploying full stack..."
        
        # Use full stack configuration
        cp vercel-fullstack.json vercel.json 2>/dev/null || {
            print_warning "Full stack config not found, using frontend config..."
            cp vercel-frontend.json vercel.json
        }
        
        # Deploy
        vercel --prod
        
        if [ $? -eq 0 ]; then
            print_status "Full stack deployed successfully!"
        else
            print_error "Full stack deployment failed"
            exit 1
        fi
        ;;
        
    3)
        print_info "Deploying backend only..."
        
        # Use backend configuration
        cp vercel-backend.json vercel.json
        print_status "Configuration updated for backend deployment"
        
        # Deploy backend
        vercel --prod
        
        if [ $? -eq 0 ]; then
            print_status "Backend deployed successfully!"
        else
            print_error "Backend deployment failed"
            exit 1
        fi
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_status "Deployment completed!"
print_info "Check your Vercel dashboard for the deployment URL"
print_info "Don't forget to configure environment variables if needed"

echo ""
print_info "Environment variables to set in Vercel dashboard:"
echo "  Frontend: VITE_API_URL=https://your-backend-url.vercel.app"
echo "  Backend: JWT_SECRET=4792d1dd4dc9998372456c8e8369767b"
echo "  Backend: FRONTEND_URL=https://your-frontend-url.vercel.app"
