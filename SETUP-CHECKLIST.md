# Complete Setup Checklist

## Pre-Deployment Checklist

### 1. Supabase Setup (Main Database)
- [ ] Create main Supabase project
- [ ] Note down the following credentials:
  - [ ] Project URL (`https://xxxxx.supabase.co`)
  - [ ] Anon Key (`eyJhbGciOiJ...`)
  - [ ] Service Role Key (`eyJhbGciOiJ...`)
- [ ] Run `sql/main-database-setup.sql` in Supabase SQL Editor
- [ ] Verify all tables are created:
  - [ ] `users`
  - [ ] `roles` 
  - [ ] `courses`
  - [ ] `course_credentials`
  - [ ] `course_memberships`
  - [ ] `platform_settings`
  - [ ] `notifications`
  - [ ] `global_pinned_posts`
  - [ ] `user_badges`
- [ ] Enable Realtime on required tables
- [ ] Configure Auth settings (enable email confirmation if needed)

### 2. GitHub Repository
- [ ] Push complete codebase to GitHub
- [ ] Verify all files are included:
  - [ ] Source code (`client/`, `server/`, `shared/`)
  - [ ] SQL scripts (`sql/`)
  - [ ] Deployment guides (`DEPLOYMENT-*.md`)
  - [ ] Environment example (`.env.example`)
  - [ ] Package files (`package.json`, `package-lock.json`)

### 3. Course Rep Database Templates
- [ ] Keep `sql/course-database-setup.sql` ready
- [ ] Document course creation process for course reps
- [ ] Prepare instructions for course reps to create their Supabase projects

## Deployment Steps

### Phase 1: Backend Deployment (Ubuntu Server)

#### 1.1 Server Preparation
- [ ] Ubuntu 20.04+ server ready
- [ ] Domain name configured and pointing to server
- [ ] SSH access configured
- [ ] Firewall rules planned

#### 1.2 Software Installation
- [ ] System updated (`sudo apt update && sudo apt upgrade`)
- [ ] Node.js 20 LTS installed
- [ ] PM2 process manager installed
- [ ] Nginx installed
- [ ] Certbot (Let's Encrypt) installed

#### 1.3 Application Setup
- [ ] Code cloned to `/var/www/yct-platform`
- [ ] Dependencies installed (`npm install`)
- [ ] Environment file configured (`.env.production`)
- [ ] Application built (`npm run build`)
- [ ] PM2 ecosystem configured (`ecosystem.config.js`)

#### 1.4 Nginx Configuration
- [ ] Site configuration created (`/etc/nginx/sites-available/yct-platform`)
- [ ] API proxy configured for `/api` routes
- [ ] CORS headers configured for Vercel domain
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Site enabled and Nginx restarted

#### 1.5 Process Management
- [ ] Application started with PM2
- [ ] PM2 configuration saved
- [ ] PM2 startup script configured
- [ ] Application health check working

#### 1.6 Security & Monitoring
- [ ] UFW firewall configured
- [ ] SSL certificate auto-renewal tested
- [ ] Backup script created and scheduled
- [ ] Log rotation configured

### Phase 2: Frontend Deployment (Vercel)

#### 2.1 Vercel Project Setup
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Build configuration set (Vite framework)
- [ ] Output directory configured (`dist/public`)

#### 2.2 Environment Variables
- [ ] `VITE_SUPABASE_URL` set to main Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` set to main Supabase anon key
- [ ] `VITE_API_URL` set to Ubuntu server domain
- [ ] `NODE_ENV=production` set

#### 2.3 Vercel Configuration
- [ ] `vercel.json` created with API proxy rules
- [ ] Security headers configured
- [ ] Custom domain configured (optional)
- [ ] DNS records updated

#### 2.4 Deployment Testing
- [ ] Application builds successfully
- [ ] Frontend loads correctly
- [ ] API calls route to backend properly
- [ ] Authentication flow works

### Phase 3: Integration Testing

#### 3.1 Authentication System
- [ ] User registration works
- [ ] User login works
- [ ] Session persistence works
- [ ] Logout functionality works
- [ ] First user automatically becomes creator

#### 3.2 Core Features
- [ ] Dashboard loads with placeholder data
- [ ] Navigation between sections works
- [ ] Theme toggle (dark/light) works
- [ ] Responsive design works on mobile

#### 3.3 Admin Features
- [ ] Creator user has full access
- [ ] User management interface accessible
- [ ] Course creation interface ready
- [ ] Platform settings accessible

## Post-Deployment Configuration

### 1. First-Time Setup
- [ ] Register the first user (you) as creator
- [ ] Verify creator privileges are assigned
- [ ] Test basic platform functionality
- [ ] Configure initial platform settings

### 2. Course Rep Onboarding Process
- [ ] Create documentation for course reps
- [ ] Set up process for course rep to provide Supabase credentials
- [ ] Test course creation flow
- [ ] Verify course admin assignment works

### 3. Production Monitoring
- [ ] Set up monitoring dashboard
- [ ] Configure error alerts
- [ ] Monitor application logs
- [ ] Set up performance monitoring

## Troubleshooting Guide

### Common Issues

#### Backend Issues

**Issue**: API not responding
**Solutions**:
- Check PM2 status: `pm2 status`
- View logs: `pm2 logs yct-platform`
- Check Nginx status: `sudo systemctl status nginx`
- Verify firewall rules: `sudo ufw status`

**Issue**: Database connection failed
**Solutions**:
- Verify Supabase credentials in `.env.production`
- Check network connectivity to Supabase
- Verify RLS policies are correctly configured
- Check service role key permissions

**Issue**: CORS errors from frontend
**Solutions**:
- Verify `ALLOWED_ORIGINS` in backend environment
- Check Nginx CORS headers configuration
- Ensure Vercel domain is included in allowed origins
- Test with browser developer tools

#### Frontend Issues

**Issue**: Build fails on Vercel
**Solutions**:
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors

**Issue**: API calls failing
**Solutions**:
- Verify `VITE_API_URL` points to correct backend
- Check browser network tab for errors
- Verify backend is running and accessible
- Check CORS configuration

**Issue**: Authentication not working
**Solutions**:
- Verify Supabase URL and keys are correct
- Check Auth settings in Supabase dashboard
- Verify redirect URLs are configured
- Check browser localStorage for session data

#### Database Issues

**Issue**: SQL script execution fails
**Solutions**:
- Run scripts line by line to identify errors
- Check for syntax errors in SQL
- Verify extensions are enabled
- Check database permissions

**Issue**: RLS policies blocking access
**Solutions**:
- Review RLS policies in Supabase dashboard
- Verify user roles are properly assigned
- Check policy conditions match your use case
- Test with service role key to bypass RLS

### Performance Optimization

#### Backend Optimization
- [ ] Configure PM2 cluster mode
- [ ] Enable Nginx compression
- [ ] Set up database connection pooling
- [ ] Optimize database queries

#### Frontend Optimization
- [ ] Enable Vercel Analytics
- [ ] Configure CDN for static assets
- [ ] Implement lazy loading
- [ ] Optimize bundle size

### Security Checklist

#### Backend Security
- [ ] Environment variables secured
- [ ] Firewall properly configured
- [ ] SSL certificate valid and auto-renewing
- [ ] File upload size limited
- [ ] Rate limiting configured

#### Frontend Security
- [ ] No sensitive data in client code
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Content Security Policy set

#### Database Security
- [ ] RLS enabled on all tables
- [ ] Service role keys protected
- [ ] Audit logging enabled
- [ ] Regular security updates applied

## Maintenance Schedule

### Daily
- [ ] Monitor application logs
- [ ] Check system resources
- [ ] Verify backups completed

### Weekly
- [ ] Review security logs
- [ ] Update system packages
- [ ] Monitor performance metrics

### Monthly
- [ ] Rotate log files
- [ ] Review and test backup restoration
- [ ] Update dependencies
- [ ] Security audit

## Contact & Support

### Documentation Resources
- `README.md` - Project overview
- `replit.md` - Development documentation
- `DEPLOYMENT-VERCEL.md` - Frontend deployment
- `DEPLOYMENT-UBUNTU.md` - Backend deployment
- `sql/ARCHITECTURE.md` - Database architecture

### Support Channels
- GitHub Issues - Technical problems
- Documentation - Setup questions
- Logs - Debugging information

## Success Criteria

Your deployment is successful when:
- [ ] Users can register and login
- [ ] Creator account has admin privileges
- [ ] All main pages load correctly
- [ ] API endpoints respond properly
- [ ] Database operations work
- [ ] Security measures are active
- [ ] Monitoring is configured

**🎉 Congratulations! Your YCT ND1 Computer Science platform is now live and ready for your students!**