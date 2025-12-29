# Manual Cloudflare Pages Deployment

## Your Build is Ready! ✅

The production build is complete and ready in the `dist/` folder:
- Bundle: 1.83MB JavaScript
- Styles: 40KB CSS  
- All assets optimized

## Why Manual Deployment?

The API token in your environment doesn't have Pages deployment permissions. Manual upload is the quickest solution.

## Step-by-Step Deployment

### 1. Open Cloudflare Dashboard
Go to: **https://dash.cloudflare.com**

### 2. Navigate to Pages
- Click **"Workers & Pages"** in the left sidebar
- Click **"Create application"** button
- Select the **"Pages"** tab

### 3. Choose Upload Method
Click **"Upload assets"** (not "Connect to Git")

### 4. Upload Your Build
- Drag and drop the entire **`dist`** folder from:
  `D:\apps\game\synapse-ielts-rpg\dist\`
- Or click "Select from computer" and choose the `dist` folder

### 5. Configure Project
- **Project name**: `synapse-ielts-rpg`
- **Production branch**: (leave default)

### 6. Deploy
Click **"Save and Deploy"**

Wait 30-60 seconds for deployment to complete.

### 7. Get Your URL
You'll receive a URL like:
```
https://synapse-ielts-rpg.pages.dev
```

or

```
https://<random-hash>.synapse-ielts-rpg.pages.dev
```

## Test Your Deployment

Visit your new URL and verify:
- ✅ Landing page loads
- ✅ Buttons are clickable
- ✅ Navigation works

**Note**: Backend features won't work yet (they still point to localhost:8000). We'll fix that in the next step.

## Next: Backend & Telegram Integration

After frontend is live, deploy the backend to Cloudflare Workers and set up Telegram Mini App.

**See the comprehensive guide**: [TELEGRAM_DEPLOY.md](./TELEGRAM_DEPLOY.md)

---

**Need help?** Open the Cloudflare dashboard now and I'll guide you through each screen!
