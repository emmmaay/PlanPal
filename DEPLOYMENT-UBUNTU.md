# Ubuntu Cloud Server Deployment Guide

## Prerequisites
- Ubuntu 20.04+ server with root access
- Domain name pointing to your server
- SSL certificate (Let's Encrypt recommended)
- Your application code repository

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git nginx certbot python3-certbot-nginx -y
```

### 1.2 Install Node.js (LTS)
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.3 Install PM2 Process Manager
```bash
sudo npm install -g pm2
```

## Step 2: Application Deployment

### 2.1 Clone Repository
```bash
# Navigate to web directory
cd /var/www

# Clone your repository
sudo git clone https://github.com/your-username/your-repo.git yct-platform
cd yct-platform

# Set proper permissions
sudo chown -R $USER:$USER /var/www/yct-platform
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Environment Configuration
```bash
# Create production environment file
sudo nano .env.production

# Add the following variables:
```

```bash
# ========================================
# MAIN SUPABASE DATABASE CONFIGURATION
# ========================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=3000
NODE_ENV=production

# ========================================
# SECURITY CONFIGURATION
# ========================================
JWT_SECRET=your-super-secure-jwt-secret-256-bits-long
SESSION_SECRET=your-super-secure-session-secret-256-bits-long

# ========================================
# FRONTEND CONFIGURATION
# ========================================
FRONTEND_URL=https://your-domain.vercel.app
ALLOWED_ORIGINS=https://your-domain.vercel.app,https://your-domain.com

# ========================================
# OPTIONAL CONFIGURATIONS
# ========================================
DEBUG=false
MAX_UPLOAD_SIZE=10
```

### 2.4 Build Application
```bash
npm run build
```

## Step 3: PM2 Configuration

### 3.1 Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'yct-platform',
    script: 'dist/index.js',
    instances: 2, // Use number of CPU cores
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/yct-platform/error.log',
    out_file: '/var/log/yct-platform/out.log',
    log_file: '/var/log/yct-platform/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000
  }]
};
```

### 3.2 Create Log Directory
```bash
sudo mkdir -p /var/log/yct-platform
sudo chown -R $USER:$USER /var/log/yct-platform
```

### 3.3 Start Application
```bash
# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions displayed
```

## Step 4: Nginx Configuration

### 4.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/yct-platform
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://your-domain.vercel.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://your-domain.vercel.app';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # File upload size
    client_max_body_size 10M;
}
```

### 4.2 Enable Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/yct-platform /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 5: SSL Certificate Setup

### 5.1 Install SSL Certificate
```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Step 6: Firewall Configuration

### 6.1 Configure UFW
```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

## Step 7: Database Setup

### 7.1 Run SQL Scripts on Supabase

1. **Main Database Setup**:
   - Login to your main Supabase dashboard
   - Go to SQL Editor
   - Run the contents of `sql/main-database-setup.sql`

2. **Course Database Template**:
   - Keep `sql/course-database-setup.sql` for course creation
   - This will be run automatically when creating new courses

## Step 8: Application Testing

### 8.1 Test API Endpoints
```bash
# Test health endpoint
curl https://your-domain.com/health

# Test API endpoint
curl https://your-domain.com/api/auth/me
```

### 8.2 Monitor Logs
```bash
# View PM2 logs
pm2 logs yct-platform

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Step 9: Backup & Monitoring

### 9.1 Setup Automated Backups
```bash
# Create backup script
sudo nano /usr/local/bin/backup-yct.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/yct-platform"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /var/www yct-platform

# Backup environment
cp /var/www/yct-platform/.env.production $BACKUP_DIR/env_$DATE.backup

# Keep only last 7 backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-yct.sh

# Add to crontab (daily backup at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-yct.sh
```

### 9.2 Setup Monitoring
```bash
# Install htop for monitoring
sudo apt install htop

# Monitor PM2 processes
pm2 monit
```

## Step 10: Deployment Script

### 10.1 Create Update Script
```bash
nano /var/www/yct-platform/deploy.sh
```

```bash
#!/bin/bash
echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Install/update dependencies
npm install

# Build application
npm run build

# Restart PM2 application
pm2 restart yct-platform

echo "Deployment complete!"
```

```bash
chmod +x deploy.sh
```

## Maintenance Commands

```bash
# View application status
pm2 status

# Restart application
pm2 restart yct-platform

# View logs
pm2 logs yct-platform

# Update application
./deploy.sh

# Monitor system resources
htop

# Check disk space
df -h

# View Nginx status
sudo systemctl status nginx
```

## Security Checklist

- ✅ Firewall configured (UFW)
- ✅ SSL certificate installed
- ✅ Environment variables secured
- ✅ Regular backups automated
- ✅ PM2 restart limits configured
- ✅ Nginx security headers enabled
- ✅ File upload size limited
- ✅ CORS properly configured

Your backend API will be available at `https://your-domain.com/api`!