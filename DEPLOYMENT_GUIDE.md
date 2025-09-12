# TutorsPool - Production Deployment Guide

## 🚀 Production Deployment Checklist

### ✅ Application Status
- **Backend Server**: ✅ Running on port 5174
- **Frontend Server**: ✅ Running on port 8080
- **Database**: ✅ JSON-based data persistence
- **Real-time Features**: ✅ Socket.IO integration
- **Authentication**: ✅ JWT-based auth system

### 🏗️ Production Build Process

#### 1. Backend Production Setup
```bash
# Install production dependencies
npm install --production

# Set production environment
export NODE_ENV=production

# Start production server
npm run server:prod
```

#### 2. Frontend Production Build
```bash
# Build for production
npm run build

# The build output will be in 'dist' folder
# Serve the dist folder with a web server
```

### 🔧 Environment Configuration

#### Backend Environment Variables
Create `.env` file:
```env
NODE_ENV=production
PORT=5174
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://yourdomain.com
```

#### Frontend Environment Variables
Create `.env.production` file:
```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=TutorsPool
```

### 🌐 Production Server Configuration

#### Nginx Configuration (Recommended)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend static files
    location / {
        root /path/to/tutorspool/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to backend
    location /api {
        proxy_pass http://localhost:5174;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket proxy for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5174;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### PM2 Process Management
```bash
# Install PM2
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'tutorspool-backend',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5174
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5174
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 🔒 Security Configuration

#### SSL/HTTPS Setup
```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d yourdomain.com

# Or use Cloudflare SSL
# Configure SSL/TLS settings in Cloudflare dashboard
```

#### Security Headers
Add to Nginx configuration:
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss:;" always;
```

### 📊 Monitoring & Logging

#### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# PM2 logs
pm2 logs tutorspool-backend

# Real-time logs
pm2 logs tutorspool-backend --lines 100 --raw
```

#### Log Rotation
```bash
# Install logrotate
sudo apt-get install logrotate

# Create logrotate configuration
sudo tee /etc/logrotate.d/tutorspool << EOF
/path/to/tutorspool/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### 🗄️ Database & Data Management

#### Data Backup Strategy
```bash
#!/bin/bash
# backup-data.sh

BACKUP_DIR="/backups/tutorspool"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup JSON data files
cp server/data.json $BACKUP_DIR/data_$DATE.json

# Keep only last 30 days of backups
find $BACKUP_DIR -name "data_*.json" -mtime +30 -delete

echo "Backup completed: data_$DATE.json"
```

#### Automated Backup Cron Job
```bash
# Add to crontab
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /path/to/backup-data.sh
```

### 🚀 Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash

echo "🚀 Starting TutorsPool Production Deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Build frontend
npm run build

# Restart services
pm2 restart tutorspool-backend

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Run backup
./backup-data.sh

echo "✅ Deployment completed successfully!"
```

### 📈 Performance Optimization

#### Frontend Optimization
- ✅ Code splitting implemented
- ✅ Lazy loading for routes
- ✅ Optimized bundle size
- ✅ Asset compression

#### Backend Optimization
- ✅ Efficient data queries
- ✅ Socket.IO room management
- ✅ Error handling and logging
- ✅ CORS configuration

### 🔄 CI/CD Pipeline (Optional)

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to server
      run: |
        # Add deployment commands here
        echo "Deploying to production server..."
```

### ✅ Production Readiness Checklist

- [x] **Application Testing**: All features tested and working
- [x] **Security**: JWT authentication, CORS, input validation
- [x] **Performance**: Optimized builds, efficient queries
- [x] **Monitoring**: Logging and error tracking
- [x] **Backup**: Data backup strategy implemented
- [x] **SSL**: HTTPS configuration ready
- [x] **Process Management**: PM2 configuration ready
- [x] **Web Server**: Nginx configuration ready
- [x] **Environment**: Production environment variables
- [x] **Documentation**: Complete deployment guide

### 🎯 Final Deployment Steps

1. **Prepare Server Environment**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-repo/tutorspool.git
   cd tutorspool
   
   # Install dependencies
   npm install --production
   
   # Build frontend
   npm run build
   
   # Configure PM2
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

3. **Configure Web Server**
   ```bash
   # Copy Nginx configuration
   sudo cp nginx.conf /etc/nginx/sites-available/tutorspool
   sudo ln -s /etc/nginx/sites-available/tutorspool /etc/nginx/sites-enabled/
   
   # Test and reload Nginx
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Setup SSL**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # Get SSL certificate
   sudo certbot --nginx -d yourdomain.com
   ```

5. **Verify Deployment**
   ```bash
   # Check services
   pm2 status
   sudo systemctl status nginx
   
   # Test endpoints
   curl https://yourdomain.com/api/tutors
   curl https://yourdomain.com
   ```

## 🎉 Production Deployment Complete!

Your TutorsPool application is now ready for production deployment with:
- ✅ Scalable architecture
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Monitoring and logging
- ✅ Backup and recovery
- ✅ SSL/HTTPS support
- ✅ Process management

The application is fully functional and production-ready!
