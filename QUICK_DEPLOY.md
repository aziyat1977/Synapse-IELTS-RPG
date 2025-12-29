# Quick Deployment Steps

## ✅ What's Ready
- ✅ Code built successfully (`npm run build`)
- ✅ Latest changes committed to Git
- ✅ Production files in `dist/` folder

## 🚀 Choose Your Deployment Method

### Method 1: Cloudflare Pages - Wrangler CLI (Fastest)

**Step 1: Authenticate Wrangler**
```bash
npx wrangler login
```
This will open your browser - **log in to Cloudflare** and authorize Wrangler.

**Step 2: Deploy**
```bash
npx wrangler pages deploy dist --project-name=synapse-ielts-rpg
```

Done! You'll get a URL like: `https://synapse-ielts-rpg.pages.dev`

---

### Method 2: Cloudflare Pages - Dashboard (Manual)

1. Open https://dash.cloudflare.com in your browser
2. Log in to your Cloudflare account
3. Go to "Workers & Pages" → "Create application" → "Pages"
4. Click "Upload assets"
5. Drag the entire `dist/` folder
6. Project name: `synapse-ielts-rpg`
7. Click "Deploy site"

Done! URL: `https://synapse-ielts-rpg.pages.dev`

---

### Method 3: GitHub Pages (Alternative)

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

URL: `https://aziyat1977.github.io/Synapse-IELTS-RPG`

---

## 🤖 Backend Deployment (Cloudflare Workers)

### For Telegram Mini App Integration

See the comprehensive **[TELEGRAM_DEPLOY.md](./TELEGRAM_DEPLOY.md)** guide for:
- Deploying backend to Cloudflare Workers
- Setting up Telegram bot with @BotFather
- Configuring webhooks and Mini App
- Environment variables and secrets
- Database setup with Cloudflare D1
- Complete troubleshooting guide

**Quick Backend Deploy**:
```bash
cd backend-workers

# Create D1 database
npx wrangler d1 create synapse_players

# Set secrets
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put WEBHOOK_SECRET

# Deploy
npx wrangler deploy
```

---

## 📝 After Deployment

Your backend will be deployed to Cloudflare Workers with a URL like:
```
https://synapse-ielts-api.YOUR_SUBDOMAIN.workers.dev
```

The frontend automatically connects to the worker API when deployed to Cloudflare Pages.

---

## 🎯 Recommended: Start with Method 1 (Wrangler)

Run this command and follow the browser authorization:
```bash
npx wrangler login
```

Then deploy:
```bash
npx wrangler pages deploy dist --project-name=synapse-ielts-rpg
```

**That's it!** 🚀
