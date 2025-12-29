# Synapse IELTS RPG - Automated Deployment Script

## 🔑 Credentials Configured

✅ **Telegram Bot**: `ielts_rater_bot`  
✅ **Bot Token**: `YOUR_TELEGRAM_BOT_TOKEN`  
✅ **OpenAI API Key**: `YOUR_OPENAI_API_KEY`  
✅ **Webhook Secret**: `YOUR_WEBHOOK_SECRET`  
✅ **Click Payment Credentials**:
- SERVICE_ID: YOUR_SERVICE_ID
- MERCHANT_ID: YOUR_MERCHANT_ID
- SECRET_KEY: YOUR_SECRET_KEY
- Merchant User ID: YOUR_MERCHANT_USER_ID

---

## 📦 Step 1: Frontend Deployment (Already Built)

Frontend is built and ready in `dist/` folder (1.83MB).

**Option A: Via Cloudflare Dashboard** (Recommended for now)
1. Go to: https://dash.cloudflare.com
2. Click **"Workers & Pages"** → **"Create application"** → **"Pages"**
3. Click **"Upload assets"**
4. Upload the entire `dist/` folder from:
   ```
   D:\apps\game\synapse-ielts-rpg\dist\
   ```
5. Project name: `synapse-ielts-rpg`
6. Click **"Deploy site"**
7. Save the URL you get (e.g., `https://synapse-ielts-rpg.pages.dev`)

**Option B: Via Wrangler CLI** (if OAuth login works)
```bash
cd D:\apps\game\synapse-ielts-rpg
npx wrangler pages deploy dist --project-name=synapse-ielts-rpg
```

---

## 🔧 Step 2: Backend Deployment

### 2.1 Create D1 Database

```bash
cd D:\apps\game\synapse-ielts-rpg\backend-workers
npx wrangler d1 create synapse_players
```

**Copy the database ID** from the output and update `wrangler.toml`:

Edit `backend-workers/wrangler.toml` line 9:
```toml
database_id = "PASTE_DATABASE_ID_HERE"
```

### 2.2 Apply Database Schema

```bash
npx wrangler d1 execute synapse_players --file=./schema.sql
```

### 2.3 Set Environment Secrets

```bash
# Set Telegram Bot Token
npx wrangler secret put TELEGRAM_BOT_TOKEN
# When prompted, paste your Telegram bot token

# Set OpenAI API Key
npx wrangler secret put OPENAI_API_KEY
# When prompted, paste your OpenAI API key

# Set Webhook Secret
npx wrangler secret put WEBHOOK_SECRET
# When prompted, paste your webhook secret
```

### 2.4 Update Wrangler Variables

Edit `backend-workers/wrangler.toml` to add your frontend URL and payment credentials:

```toml
[vars]
ENVIRONMENT = "production"
FRONTEND_URL = "https://synapse-ielts-rpg.pages.dev"  # Replace with actual URL from Step 1
CLICK_SERVICE_ID = "81769"
CLICK_MERCHANT_ID = "45478"
CLICK_MERCHANT_USER_ID = "63189"
```

For Click payment secret key, add as secret:
```bash
npx wrangler secret put CLICK_SECRET_KEY
# When prompted, paste your Click secret key
```

### 2.5 Deploy Worker

```bash
npx wrangler deploy
```

**Save the worker URL** (e.g., `https://synapse-ielts-api.YOURNAME.workers.dev`)

---

## 🤖 Step 3: Configure Telegram Bot

### 3.1 Set Webhook

Open this URL in your browser, replacing `WORKER_URL` with your actual worker URL:

```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://synapse-ielts-api.YOURNAME.workers.dev/telegram&secret_token=YOUR_WEBHOOK_SECRET
```

**✅ Expected Response:**
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### 3.2 Verify Webhook

Check webhook status:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

### 3.3 Configure Bot Menu Button

1. Open Telegram and search for **@BotFather**
2. Send: `/mybots`
3. Select: **ielts_rater_bot**
4. Click: **"Bot Settings"**
5. Click: **"Menu Button"**
6. Click: **"Configure menu button"**
7. Send your Cloudflare Pages URL: `https://synapse-ielts-rpg.pages.dev`
8. Set button title: `🎮 PLAY SYNAPSE`

---

## 🧪 Step 4: Testing

### Test Bot Commands

1. Open Telegram and search for **@ielts_rater_bot**
2. Send: `/start`
   - Should reply with welcome message and "🎮 PLAY SYNAPSE" button
3. Send: `/help`
   - Should show command list
4. Click the **"🎮 PLAY SYNAPSE"** button
   - Mini App should open with your game

### Test Full Flow

1. Click "🎮 PLAY SYNAPSE" in bot
2. Landing page should load
3. Try speaking (allow microphone access)
4. Check if authentication works
5. Test combat system

---

## 📊 Monitoring

### View Worker Logs
```bash
cd D:\apps\game\synapse-ielts-rpg\backend-workers
npx wrangler tail
```

### Check Database
```bash
npx wrangler d1 info synapse_players
npx wrangler d1 execute synapse_players --command="SELECT * FROM users LIMIT 5"
```

---

## 🔗 Quick Reference

**Bot**: https://t.me/ielts_rater_bot  
**Frontend**: https://synapse-ielts-rpg.pages.dev (after deployment)  
**Backend**: https://synapse-ielts-api.*.workers.dev (after deployment)  
**Webhook Secret**: `YOUR_WEBHOOK_SECRET`

---

## 🆘 Troubleshooting

### Frontend Not Loading
- Check Cloudflare Pages deployment status
- Verify dist/ folder was uploaded correctly

### Webhook Not Working
- Verify webhook URL is set correctly
- Check secret token matches in webhook URL and worker secrets
- View worker logs: `npx wrangler tail`

### Database Errors
- Ensure database_id in wrangler.toml is correct
- Verify schema was applied: `npx wrangler d1 info synapse_players`

### Authentication Fails
- Check TELEGRAM_BOT_TOKEN secret is set
- Verify initData validation in worker logs

---

**🚀 Ready to Deploy!**

All credentials are configured. Follow steps 1-4 above to deploy your Telegram Mini App.
