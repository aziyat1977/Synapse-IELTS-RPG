# 🎮 Synapse IELTS RPG - Telegram Mini App Deployment

> **The Three-Pillar Stack**: GitHub + Cloudflare + Telegram  
> **Zero Server Costs** | **Infinite Scale** | **2-Minute Setup**

---

## 📋 Prerequisites Checklist

Before you begin, gather these credentials:

- [ ] **GitHub Account** (with Synapse IELTS RPG repository)
- [ ] **Cloudflare Account** (free tier)
- [ ] **Telegram Bot Token** (from @BotFather)
- [ ] **OpenAI API Key** (for AI features)
- [ ] **Database URL** (Cloudflare D1 or PostgreSQL connection string)

---

## 🚀 Part 1: Deploy Frontend to Cloudflare Pages

### Step 1: Build Your Frontend

```bash
cd d:\apps\game\synapse-ielts-rpg
npm run build
```

**✅ Expected Output**: `dist/` folder created with optimized assets

### Step 2: Deploy to Cloudflare Pages

**Option A: Using Wrangler CLI (Recommended)**

```bash
# Login to Cloudflare
npx wrangler login

# Deploy frontend
npx wrangler pages deploy dist --project-name=synapse-ielts-rpg
```

**Option B: Manual Upload**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Workers & Pages"** → **"Create application"** → **"Pages"**
3. Click **"Upload assets"**
4. Drag the `dist/` folder
5. Project name: `synapse-ielts-rpg`
6. Click **"Deploy site"**

**🎯 Result**: You'll get a URL like:
```
https://synapse-ielts-rpg.pages.dev
```

**📝 Save this URL** - you'll need it for Telegram configuration.

---

## ⚙️ Part 2: Deploy Backend to Cloudflare Workers

### Step 1: Create D1 Database

```bash
cd backend-workers

# Create production database
npx wrangler d1 create synapse_players

# Copy the database_id from output and update wrangler.toml
```

**Update `backend-workers/wrangler.toml`** with the database ID:
```toml
[[d1_databases]]
binding = "DB"
database_name = "synapse_players"
database_id = "YOUR_DATABASE_ID_HERE"  # Paste from previous command
```

### Step 2: Initialize Database Schema

```bash
# Apply database schema
npx wrangler d1 execute synapse_players --file=./schema.sql
```

### Step 3: Set Environment Secrets

```bash
# Set OpenAI API Key
npx wrangler secret put OPENAI_API_KEY
# Paste your key when prompted

# Set Telegram Bot Token
npx wrangler secret put TELEGRAM_BOT_TOKEN
# Paste token from @BotFather

# Set Webhook Secret (generate random string)
npx wrangler secret put WEBHOOK_SECRET
# Paste a random 32-character string
```

**💡 To generate a secure webhook secret:**
```bash
# On Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Or use online: https://www.random.org/strings/
```

### Step 4: Deploy Worker

```bash
npx wrangler deploy
```

**🎯 Result**: You'll get a worker URL like:
```
https://synapse-ielts-api.YOUR_SUBDOMAIN.workers.dev
```

**📝 Save this URL** - this is your backend API endpoint.

---

## 🤖 Part 3: Configure Telegram Bot

### Step 1: Create Bot with @BotFather

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Choose bot name: **"Synapse IELTS RPG"**
4. Choose username: **"synapse_ielts_bot"** (must end with `_bot`)
5. **Save the bot token** - looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### Step 2: Set the Webhook

Replace placeholders with your actual values:

```
https://api.telegram.org/bot[YOUR_BOT_TOKEN]/setWebhook?url=[YOUR_WORKER_URL]/telegram&secret_token=[YOUR_WEBHOOK_SECRET]
```

**Example**:
```
https://api.telegram.org/bot1234567890:ABCdefGHIjklMNO/setWebhook?url=https://synapse-ielts-api.myname.workers.dev/telegram&secret_token=abc123xyz789random32chars
```

**✅ Success Response**:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

### Step 3: Configure Mini App Menu Button

1. Go to `@BotFather` on Telegram
2. Send `/mybots`
3. Select your bot: **"Synapse IELTS RPG"**
4. Click **"Bot Settings"**
5. Click **"Menu Button"**
6. Click **"Configure menu button"**
7. Send your Cloudflare Pages URL:
   ```
   https://synapse-ielts-rpg.pages.dev
   ```
8. Set button title:
   ```
   🎮 PLAY SYNAPSE
   ```

### Step 4: Enable Inline Mode (Optional)

1. Still in `@BotFather` → **"Bot Settings"**
2. Click **"Inline Mode"** → **"Turn on"**
3. Set inline placeholder: `"Search IELTS quests..."`

---

## 🔒 Part 4: Configure Environment Variables

### In Cloudflare Workers Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **"Workers & Pages"**
3. Click on **"synapse-ielts-api"**
4. Go to **"Settings"** → **"Variables"**

### Add These Secrets:

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | From @BotFather | `1234567890:ABCdef...` |
| `DATABASE_URL` | Cloudflare D1 (auto-bound) or PostgreSQL URL | `postgres://user:pass@host/db` |
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |
| `WEBHOOK_SECRET` | Random 32-char string | Generated in Step 2.3 |

**💡 Note**: For Cloudflare D1, you don't need `DATABASE_URL` - the binding in `wrangler.toml` handles it.

### Add These Environment Variables (Non-Secret):

| Variable Name | Value |
|--------------|-------|
| `ENVIRONMENT` | `production` |
| `FRONTEND_URL` | `https://synapse-ielts-rpg.pages.dev` |

---

## 🧪 Part 5: Testing & Verification

### Test 1: Check Webhook Status

Visit this URL in your browser:
```
https://api.telegram.org/bot[YOUR_BOT_TOKEN]/getWebhookInfo
```

**✅ Expected Response**:
```json
{
  "ok": true,
  "result": {
    "url": "https://synapse-ielts-api.YOUR_SUBDOMAIN.workers.dev/telegram",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```

### Test 2: Send Test Message to Bot

1. Open Telegram and search for your bot: `@synapse_ielts_bot`
2. Click **"Start"**
3. Type any message (e.g., "Hello")
4. Bot should respond (or log the message)

**🐛 If no response**, check Cloudflare Worker logs:
```bash
npx wrangler tail
```

### Test 3: Launch Mini App

1. In your bot chat, click the **Menu button** (bottom-left)
2. Click **"🎮 PLAY SYNAPSE"**
3. The Mini App should open with your game interface

**✅ Expected**: Landing page loads inside Telegram

### Test 4: Check Database Connection

In Cloudflare Worker logs (`wrangler tail`), look for:
```
✅ Database connected successfully
```

**🐛 If database errors**, verify:
- D1 database ID in `wrangler.toml` is correct
- Schema was applied (`wrangler d1 execute`)

### Test 5: Verify Telegram Authentication

The Mini App should:
- Receive `window.Telegram.WebApp.initData`
- Validate the signature on backend
- Authenticate the user

**Debug in browser console**:
```javascript
console.log(window.Telegram.WebApp.initData);
```

---

## 🔥 The System Architecture

Here's how everything connects:

```
┌─────────────────┐
│  Telegram User  │
└────────┬────────┘
         │ 1. Clicks "🎮 PLAY SYNAPSE"
         ↓
┌─────────────────────────┐
│  Telegram Mini App      │
│  (Cloudflare Pages)     │
│  synapse-ielts-rpg      │
└────────┬────────────────┘
         │ 2. Loads React App
         │ 3. Gets initData (user auth)
         ↓
┌─────────────────────────┐
│  Cloudflare Worker API  │
│  synapse-ielts-api      │
└────────┬────────────────┘
         │ 4. Validates Telegram signature
         │ 5. Processes game logic
         ↓
┌─────────────────────────┐
│  Cloudflare D1 Database │
│  synapse_players        │
└─────────────────────────┘
         │ 6. Stores player progress
         │
         ↓
┌─────────────────────────┐
│  OpenAI API             │
│  (GPT-4 + Whisper)      │
└─────────────────────────┘
         │ 7. AI feedback & voice analysis
```

**Data Flow for a Single Battle**:
1. User speaks into Telegram Mini App
2. Audio sent to Worker: `POST /api/combat-voice`
3. Worker → Whisper API (transcription)
4. Worker → GPT-4 (fluency analysis)
5. Worker → D1 Database (save XP)
6. Response → Mini App (UI updates)

---

## 🛡️ Troubleshooting: The Director's Shield

### Issue 1: Webhook Not Receiving Messages

**🔍 Debug Steps**:
```bash
# Check Cloudflare Worker logs
npx wrangler tail

# Verify webhook is set
curl https://api.telegram.org/bot[BOT_TOKEN]/getWebhookInfo

# Test webhook manually
curl -X POST https://YOUR_WORKER_URL/telegram \
  -H "X-Telegram-Bot-Api-Secret-Token: YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"message":{"text":"test"}}'
```

**✅ Fix**: Ensure `WEBHOOK_SECRET` matches in both Telegram webhook URL and Worker environment variables.

---

### Issue 2: Database Connection Fails

**🔍 Symptoms**:
```
Error: D1_ERROR: no such table: players
```

**✅ Fix**:
```bash
# Re-apply schema
cd backend-workers
npx wrangler d1 execute synapse_players --file=./schema.sql

# Verify tables exist
npx wrangler d1 execute synapse_players --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

### Issue 3: Telegram initData Signature Validation Fails

**🔍 Symptoms**:
```
Error: Invalid Telegram signature
```

**✅ Fix**:
- Verify `TELEGRAM_BOT_TOKEN` is correct in Worker secrets
- Check that frontend is sending `initData` correctly
- Ensure Worker is using the correct validation algorithm

**Test initData in browser console**:
```javascript
// In Telegram Mini App, run:
console.log(window.Telegram.WebApp.initData);
// Should output: "query_id=...&user=...&auth_date=...&hash=..."
```

---

### Issue 4: Audio Recording Not Working

**🔍 Symptoms**:
- "Click to start recording" button does nothing
- Console error: `NotAllowedError: Permission denied`

**✅ Fix**:
- Telegram Mini Apps require HTTPS (Cloudflare provides this)
- User must **click** a button to start recording (Web Audio API requirement)
- Check microphone permissions in Telegram app settings

**Add this to your frontend**:
```javascript
// In RaidArena.jsx or CombatArena.jsx
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("✅ Microphone access granted");
    // Start recording logic...
  } catch (err) {
    console.error("❌ Microphone error:", err);
    alert("Please allow microphone access in Telegram settings");
  }
};
```

---

### Issue 5: Worker Deployment Fails

**🔍 Symptoms**:
```
Error: No such binding: DB
```

**✅ Fix**:
```bash
# Ensure wrangler.toml has correct D1 binding
# [[d1_databases]]
# binding = "DB"
# database_name = "synapse_players"
# database_id = "YOUR_ID_HERE"

# Redeploy
npx wrangler deploy
```

---

### Issue 6: CORS Errors in Mini App

**🔍 Symptoms**:
```
Access to fetch at 'https://worker.dev/api' blocked by CORS
```

**✅ Fix**: Add CORS headers to Worker responses:
```typescript
// In worker.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await handleRequest(request, env);
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', env.FRONTEND_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
};
```

---

## 📊 Success Metrics

After deployment, verify:

- [ ] **Frontend loads** at `https://synapse-ielts-rpg.pages.dev`
- [ ] **Worker responds** at `https://synapse-ielts-api.*.workers.dev/health`
- [ ] **Telegram webhook** shows `"ok": true` in getWebhookInfo
- [ ] **Mini App opens** from Telegram bot menu button
- [ ] **User authentication** works (initData validated)
- [ ] **Database queries** succeed (check Worker logs)
- [ ] **Voice recording** captures audio
- [ ] **OpenAI integration** returns feedback

---

## 🎯 Next Steps

1. **Custom Domain** (Optional):
   - Add custom domain in Cloudflare Pages settings
   - Update `@BotFather` menu button with new URL

2. **Monitoring**:
   ```bash
   # Watch real-time logs
   npx wrangler tail
   
   # Check D1 database size
   npx wrangler d1 info synapse_players
   ```

3. **Scaling**:
   - Cloudflare Workers: **10 million requests/day** (free tier)
   - Cloudflare D1: **5 GB storage** (free tier)
   - Upgrade only when you hit limits

4. **Analytics** (Optional):
   - Enable Cloudflare Web Analytics
   - Add Telegram Analytics Bot

---

## 🆘 Need Help?

**Cloudflare Worker logs**:
```bash
npx wrangler tail
```

**Check Telegram webhook**:
```bash
curl https://api.telegram.org/bot[TOKEN]/getWebhookInfo
```

**Database status**:
```bash
npx wrangler d1 info synapse_players
```

**Test worker health**:
```bash
curl https://synapse-ielts-api.YOUR_SUBDOMAIN.workers.dev/health
```

---

**🎮 You're Ready to Launch!**

Your Synapse IELTS RPG is now live on Telegram. Students can:
1. Search for your bot
2. Click "🎮 PLAY SYNAPSE"
3. Speak to battle monsters
4. Master IELTS through voice combat

**Deploy once. Scale infinitely. Zero servers. 🚀**
