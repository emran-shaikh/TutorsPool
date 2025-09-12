#!/bin/bash

echo "🚀 Starting TutorsPool Production Deployment..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Environment checks passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production
if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Build frontend
echo "🏗️  Building frontend..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Frontend built successfully"
else
    print_error "Failed to build frontend"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing PM2..."
    npm install -g pm2
    if [ $? -eq 0 ]; then
        print_status "PM2 installed successfully"
    else
        print_error "Failed to install PM2"
        exit 1
    fi
fi

# Create logs directory
mkdir -p logs
print_status "Logs directory created"

# Start/restart PM2 processes
echo "🔄 Starting/restarting PM2 processes..."
pm2 restart ecosystem.config.js --env production
if [ $? -eq 0 ]; then
    print_status "PM2 processes restarted successfully"
else
    print_warning "PM2 restart failed, trying to start..."
    pm2 start ecosystem.config.js --env production
    if [ $? -eq 0 ]; then
        print_status "PM2 processes started successfully"
    else
        print_error "Failed to start PM2 processes"
        exit 1
    fi
fi

# Save PM2 configuration
pm2 save
print_status "PM2 configuration saved"

# Setup PM2 startup (if not already done)
if ! pm2 startup | grep -q "already"; then
    print_warning "Setting up PM2 startup..."
    pm2 startup
    print_status "PM2 startup configured"
fi

# Check if Nginx is installed and running
if command -v nginx &> /dev/null; then
    echo "🌐 Checking Nginx configuration..."
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        print_status "Nginx configuration reloaded"
    else
        print_warning "Nginx configuration test failed. Please check nginx.conf"
    fi
else
    print_warning "Nginx is not installed. Please install and configure Nginx for production."
fi

# Create backup
echo "💾 Creating data backup..."
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

if [ -f "server/data.json" ]; then
    cp server/data.json $BACKUP_DIR/data_$DATE.json
    print_status "Data backup created: $BACKUP_DIR/data_$DATE.json"
    
    # Keep only last 7 days of backups
    find $BACKUP_DIR -name "data_*.json" -mtime +7 -delete 2>/dev/null || true
    print_status "Old backups cleaned up"
else
    print_warning "No data.json file found to backup"
fi

# Health check
echo "🏥 Performing health check..."
sleep 5

# Check if backend is responding
if curl -s http://localhost:5174/api/tutors > /dev/null; then
    print_status "Backend health check passed"
else
    print_error "Backend health check failed"
fi

# Check if frontend is accessible
if curl -s http://localhost:8080 > /dev/null; then
    print_status "Frontend health check passed"
else
    print_warning "Frontend health check failed (this might be expected if using Nginx)"
fi

# Show PM2 status
echo "📊 Current PM2 status:"
pm2 status

echo ""
echo "=============================================="
print_status "Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:8080 (or your configured domain)"
echo "   Backend API: http://localhost:5174/api"
echo "   Health Check: http://localhost:5174/api/health"
echo ""
echo "📋 Useful commands:"
echo "   pm2 status          - Check application status"
echo "   pm2 logs            - View application logs"
echo "   pm2 restart all     - Restart all applications"
echo "   pm2 stop all        - Stop all applications"
echo "   pm2 monit           - Monitor applications"
echo ""
echo "🔧 Configuration files:"
echo "   PM2: ecosystem.config.js"
echo "   Nginx: nginx.conf"
echo "   Logs: ./logs/"
echo "   Backups: ./backups/"
echo ""
print_status "TutorsPool is now running in production mode!"
