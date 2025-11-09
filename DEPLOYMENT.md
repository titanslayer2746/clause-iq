# Clause-IQ Deployment Guide

## Overview
This guide covers deploying Clause-IQ to production using Vercel (frontend) and Render/Docker (backend).

## Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Google Gemini API key
- SendGrid account (optional, for emails)

---

## Backend Deployment

### Option 1: Render (Recommended for Free Tier)

1. **Create `render.yaml`** (already included)

2. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

3. **Connect to Render**
   - Go to https://render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` automatically

4. **Set Environment Variables** in Render Dashboard:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Random 32+ character string
   - `CLOUDINARY_CLOUD_NAME` - From Cloudinary dashboard
   - `CLOUDINARY_API_KEY` - From Cloudinary dashboard
   - `CLOUDINARY_API_SECRET` - From Cloudinary dashboard
   - `GEMINI_API_KEY` - From Google AI Studio
   - `SENDGRID_API_KEY` - (Optional) For email notifications
   - `SENDGRID_FROM_EMAIL` - (Optional) Verified sender email
   - `FRONTEND_URL` - Your Vercel URL (after frontend deployment)

5. **Deploy**
   - Render will automatically deploy on push
   - Health check: `https://your-app.onrender.com/health`

### Option 2: Docker Deployment

1. **Build Docker image**
   ```bash
   cd backend
   docker build -t clause-iq-backend .
   ```

2. **Run container**
   ```bash
   docker run -p 5000:5000 \
     -e MONGODB_URI="your_mongodb_uri" \
     -e JWT_SECRET="your_jwt_secret" \
     -e CLOUDINARY_CLOUD_NAME="your_cloud_name" \
     -e CLOUDINARY_API_KEY="your_api_key" \
     -e CLOUDINARY_API_SECRET="your_api_secret" \
     -e GEMINI_API_KEY="your_gemini_key" \
     clause-iq-backend
   ```

---

## Frontend Deployment (Vercel)

1. **Create `vercel.json`** (already included)

2. **Update environment variables**
   Create `.env.production` in frontend:
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

3. **Deploy to Vercel**
   ```bash
   cd frontend
   npm install -g vercel
   vercel
   ```

4. **Configure Vercel Project**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Set Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend.onrender.com/api`

6. **Deploy**
   ```bash
   vercel --prod
   ```

---

## MongoDB Atlas Setup

1. **Create Cluster**
   - Go to https://cloud.mongodb.com
   - Create free M0 cluster

2. **Configure Network Access**
   - Add `0.0.0.0/0` to allow connections from anywhere
   - (Or whitelist Render's IP ranges)

3. **Create Database User**
   - Username: `clauseiq`
   - Password: Generate strong password
   - Permissions: Read/Write to any database

4. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `clauseiq`

---

## Post-Deployment Configuration

### Update Backend URL
After Render deployment, update `FRONTEND_URL` in Render dashboard to your Vercel URL.

### Update Frontend URL
In Vercel, set `VITE_API_URL` to your Render backend URL.

### Test Deployment
1. Visit your Vercel URL
2. Create an account
3. Upload a test contract
4. Run AI extraction
5. Check all features work

---

## Rate Limits (Free Tier)

### Render Free Tier:
- 750 hours/month
- Spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds

### Vercel Free Tier:
- 100GB bandwidth/month
- Serverless function execution

### MongoDB Atlas Free Tier:
- 512MB storage
- Shared CPU
- ~500 connections

### Gemini API Free Tier:
- 15 requests/minute
- 1500 requests/day

---

## API Rate Limits (Built-in)

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 attempts per 15 minutes per IP
- **AI Operations**: 20 requests per hour per IP
- **File Uploads**: 50 per hour per IP

---

## Monitoring

### Health Checks
- Backend: `https://your-backend.onrender.com/health`
- Returns: Server status, timestamp, environment

### Logs
- **Render**: View in Render Dashboard → Logs
- **Vercel**: View in Vercel Dashboard → Deployments → Function Logs

### Error Monitoring (Optional)
Consider integrating Sentry for error tracking:
```bash
npm install @sentry/node # Backend
npm install @sentry/react # Frontend
```

---

## Environment Variables Checklist

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GEMINI_API_KEY=your-gemini-key
FRONTEND_URL=https://your-app.vercel.app
SENDGRID_API_KEY=optional
SENDGRID_FROM_EMAIL=optional
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify all environment variables are set
- Check Render logs for errors

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend is running (not sleeping)

### AI extraction fails
- Verify Gemini API key is valid
- Check API rate limits
- Ensure text extraction completed first

### File uploads fail
- Verify Cloudinary credentials
- Check file size limits (50MB default)
- Ensure uploads directory exists

---

## Security Considerations

✅ **Implemented:**
- Helmet for security headers
- Rate limiting on all routes
- JWT authentication
- Role-based access control
- CORS configuration
- Input validation
- MongoDB injection prevention

🔐 **Recommendations:**
- Use strong JWT_SECRET (32+ characters)
- Enable MongoDB backup
- Regular security audits
- Monitor rate limit abuse
- Review audit logs regularly

---

## Scaling Beyond Free Tier

When you need more resources:

1. **Render**: Upgrade to Starter ($7/month)
   - Always-on (no sleep)
   - More CPU/RAM

2. **Vercel**: Pro ($20/month)
   - More bandwidth
   - Better analytics

3. **MongoDB Atlas**: M10 cluster ($57/month)
   - Dedicated resources
   - Backups included

4. **Cloudinary**: Plus ($89/month)
   - More storage/transformations

---

## Support

For issues or questions, check:
- GitHub Issues
- Documentation in README.md
- API endpoint: `/api` for API status

