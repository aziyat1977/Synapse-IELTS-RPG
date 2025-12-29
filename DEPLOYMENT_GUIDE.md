# Synapse IELTS RPG - Quick Deployment Guide

## ✅ Code Ready
Your latest changes have been pushed to GitHub:
- Repository: https://github.com/aziyat1977/Synapse-IELTS-RPG
- Latest commit: 66c7bf4 (Import fixes)

## 🚀 Deployment Options

### Option 1: Cloudflare Pages (Dashboard - Manual)

1. **Login to Cloudflare**
   - Go to: https://dash.cloudflare.com
   - Solve captcha and log in

2. **Create Pages Project**
   - Click "Workers & Pages" in sidebar
   - Click "Create application" → "Pages" tab
   - Click "Connect to Git"

3. **Select Repository**
   - Choose: `Synapse-IELTS-RPG`
   - Branch: `main`

4. **Configure Build**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

5. **Deploy**
   - Click "Save and Deploy"
   - Wait ~2-3 minutes
   - Get your URL: `https://synapse-ielts-rpg.pages.dev`

### Option 2: Wrangler CLI (Automated)

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy Pages
npx wrangler pages deploy dist --project-name=synapse-ielts-rpg
```

**Note:** You need to build first:
```bash
npm run build
```

### Option 3: Railway Backend (Recommended for FastAPI)

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   cd backend
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set OPENAI_API_KEY=your_key_here
   ```

4. **Get Backend URL**
   - Railway will provide: `https://synapse-backend-production.up.railway.app`

5. **Update Frontend API URLs**
   - Edit all fetch calls in:
     - `src/store/gameStore.js`
     - `src/components/*.jsx`
   - Replace `http://localhost:8000` with Railway URL

## 🔧 Post-Deployment

### Frontend on Cloudflare Pages
- URL: `https://synapse-ielts-rpg.pages.dev`
- Auto-deploys on git push to main

### Backend on Railway
- URL: `https://your-app.railway.app`
- Set environment variables in Railway dashboard

### Update CORS
In `backend/main.py`, update allowed origins:
```python
allow_origins=["https://synapse-ielts-rpg.pages.dev"]
```

## 📝 Next Steps

1. Deploy frontend to Cloudflare Pages
2. Deploy backend to Railway
3. Update API URLs in frontend
4. Test live deployment
5. Set up Telegram Bot

## 🆘 Need Help?

If deploying via dashboard, I've already:
- ✅ Fixed code errors
- ✅ Pushed to GitHub
- ✅ Opened Cloudflare login page for you

Just complete the login and follow "Option 1: Cloudflare Pages (Dashboard)" above!
