# Vercel Frontend Deployment Guide

## Prerequisites
- GitHub repository with your code
- Vercel account (free tier available)
- Main Supabase project configured

## Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

2. **Verify build configuration** in `package.json`:
   ```json
   {
     "scripts": {
       "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
       "start": "NODE_ENV=production node dist/index.js"
     }
   }
   ```

## Step 2: Configure Vercel Project

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository

2. **Build Configuration**:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`

## Step 3: Environment Variables

Add these environment variables in Vercel dashboard (Settings → Environment Variables):

### Production Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API URL (Ubuntu server)
VITE_API_URL=https://your-ubuntu-server.com

# Application Configuration
NODE_ENV=production
```

### Important Notes:
- Only `VITE_` prefixed variables are accessible in frontend
- Never expose service role keys in frontend environment
- Backend API URL should point to your Ubuntu cloud server

## Step 4: Vercel Configuration File

Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-ubuntu-server.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Step 5: Deploy

1. **Automatic Deployment**:
   - Push to your main branch
   - Vercel automatically builds and deploys
   - Check deployment status in Vercel dashboard

2. **Custom Domain** (Optional):
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

## Step 6: Post-Deployment Configuration

1. **Update Supabase URLs**:
   - Add your Vercel domain to Supabase Auth settings
   - Update redirect URLs in Supabase dashboard

2. **Test Application**:
   - Visit your Vercel URL
   - Test login/registration
   - Verify all features work correctly

## Common Issues & Solutions

### Build Errors
```bash
# Clear build cache
vercel --prod --force

# Check build logs in Vercel dashboard
# Ensure all dependencies are in package.json
```

### Environment Variable Issues
- Verify all `VITE_` prefixed variables are set
- Check case sensitivity
- Restart deployment after adding variables

### API Connection Issues
- Ensure Ubuntu server is running and accessible
- Check CORS configuration on backend
- Verify API URL in environment variables

## Performance Optimization

1. **Enable Vercel Analytics**:
   - Go to Project Settings → Analytics
   - Enable Web Analytics

2. **Configure Caching**:
   ```json
   {
     "headers": [
       {
         "source": "/static/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

## Monitoring

- **Vercel Dashboard**: Monitor deployment status and performance
- **Function Logs**: Check serverless function logs
- **Error Tracking**: Integrate with Sentry or similar service

## Security Checklist

- ✅ Environment variables properly configured
- ✅ HTTPS enabled by default
- ✅ Security headers added
- ✅ No sensitive keys in frontend code
- ✅ Supabase RLS policies enabled
- ✅ CORS properly configured

Your frontend will be available at `https://your-project.vercel.app`!