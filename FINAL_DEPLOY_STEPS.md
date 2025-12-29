# Final Deployment Steps - Worker Secrets & Deployment

## Step 1: Create a New Worker via Dashboard

Since we can't use Wrangler CLI (auth issues), let's create the worker via dashboard:

### Option A: Upload Worker Code Manually

1. **Go to Cloudflare Dashboard** → **Workers & Pages**
2. Click **"Create application"** → **"Create Worker"**
3. Worker name: `synapse-ielts-api`
4. Click **"Deploy"** (it will create a basic worker)

### Option B: Deploy from GitHub (Easier!)

1. **Go to Cloudflare Dashboard** → **Workers & Pages**
2. Click **"Create application"**
3. Click **"Connect to Git"**
4. Select **GitHub** → Authorize → Select repository: **Synapse-IELTS-RPG**
5. **Project name**: `synapse-ielts-api`
6. **Production branch**: `main`
7. **Build configuration**:
   - **Framework preset**: None
   - **Build command**: Leave empty
   - **Build output directory**: Leave empty
   - **Root directory**: `backend-workers`

8. Click **"Save and Deploy"**

---

## Step 2: Configure Worker Settings

After the worker is created:

1. Go to your worker: **Workers & Pages** → **synapse-ielts-api**
2. Click **"Settings"** tab

### A. Add Environment Variables

Click **"Variables"** → **"Add variable"**:

**Regular Variables** (not encrypted):
- `ENVIRONMENT` = `production`
- `FRONTEND_URL` = `https://52f5ce03.synapse-ielts-rpg.pages.dev`

### B. Add Secrets (Encrypted)

Click **"Encrypt"** button for each:

**Secret 1: TELEGRAM_BOT_TOKEN**
```
YOUR_TELEGRAM_BOT_TOKEN_HERE
```

**Secret 2: OPENAI_API_KEY**
```
YOUR_OPENAI_API_KEY_HERE
```

**Secret 3: WEBHOOK_SECRET**
```
YOUR_WEBHOOK_SECRET_HERE
```

Click **"Deploy"** to save.

### C. Bind D1 Database

1. Still in **Settings**, go to **"Bindings"**
2. Click **"Add binding"**
3. **Type**: D1 Database
4. **Variable name**: `DB`
5. **D1 database**: Select `synapse_players`
6. Click **"Save"**

---

## Step 3: Trigger a Redeploy (if needed)

If the worker was already deployed before you added bindings:

1. Go to **"Deployments"** tab
2. Click **"Manage deployment"** → **"Redeploy"**

OR push a small change to GitHub to trigger auto-deploy.

---

## Step 4: Get Your Worker URL

After deployment completes, you'll see a URL like:
```
https://synapse-ielts-api.YOUR-SUBDOMAIN.workers.dev
```

**Copy this URL** - you'll need it for the Telegram webhook!

---

## Step 5: Set Telegram Webhook

Once you have the worker URL, open this in your browser (replace `YOUR_WORKER_URL` and use your bot token):

```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=YOUR_WORKER_URL/telegram&secret_token=YOUR_WEBHOOK_SECRET
```

**Example**:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://synapse-ielts-api.myname.workers.dev/telegram&secret_token=YOUR_WEBHOOK_SECRET
```

✅ You should see: `{"ok":true,"result":true,"description":"Webhook was set"}`

---

## Step 6: Configure Bot Menu Button

1. Open Telegram → Search for **@BotFather**
2. Send: `/mybots`
3. Select: **ielts_rater_bot**
4. Click: **"Bot Settings"** → **"Menu Button"** → **"Configure menu button"**
5. Send: `https://52f5ce03.synapse-ielts-rpg.pages.dev`
6. Button title: `🎮 PLAY SYNAPSE`

---

## ✅ Testing

### Test the Bot:
1. Search for **@ielts_rater_bot** on Telegram
2. Send: `/start`
3. Should see welcome message with "🎮 PLAY SYNAPSE" button
4. Click the button → Game should load!

### Test Worker Health:
Visit: `https://YOUR_WORKER_URL/health`

Should return:
```json
{"status":"healthy","timestamp":"..."}
```

---

## 🎯 Summary

**Frontend**: https://52f5ce03.synapse-ielts-rpg.pages.dev/  
**Backend Worker**: (You'll get this after deployment)  
**Bot**: @ielts_rater_bot  
**Database**: synapse_players (D1)

**All secrets configured**:
- ✅ TELEGRAM_BOT_TOKEN
- ✅ OPENAI_API_KEY  
- ✅ WEBHOOK_SECRET
- ✅ DB binding

**Once you complete Steps 1-6 above, your Telegram Mini App will be fully deployed and working!** 🚀
