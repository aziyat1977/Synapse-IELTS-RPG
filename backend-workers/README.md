# Synapse IELTS RPG - Cloudflare Workers Backend

TypeScript backend for Synapse IELTS RPG, running on Cloudflare Workers.

## Features

- **Speech Analysis**: OpenAI Whisper + GPT-4o-mini for IELTS error detection
- **Voice Combat**: Real-time voice attack analysis
- **Clan System**: User referrals and clan management
- **Leaderboard**: National and regional rankings
- **WebSocket Raids**: Real-time multiplayer raids using Durable Objects
- **Scheduled Jobs**: Cron triggers for Sunday raids and notifications

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create D1 database:**
   ```bash
   wrangler d1 create synapse_players
   ```
   
   Copy the database ID and update `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "synapse_players"
   database_id = "YOUR_DATABASE_ID_HERE"
   ```

3. **Run migrations:**
   ```bash
   wrangler d1 execute synapse_players --file=./schema.sql
   ```

4. **Set OpenAI API key:**
   ```bash
   wrangler secret put OPENAI_API_KEY
   ```

5. **Local development:**
   ```bash
   npm run dev
   ```
   API will be available at `http://localhost:8787`

6. **Deploy to Cloudflare:**
   ```bash
   npm run deploy
   ```

## API Endpoints

- `POST /api/analyze-speech` - Analyze speech audio
- `POST /api/combat-voice` - Voice combat attack
- `POST /api/refine-content` - PDF content processing
- `POST /api/clan/summon` - Invite clan member
- `GET /api/clan/status/:username` - Get clan status
- `GET /api/leaderboard?by=national|regional` - Leaderboard
- `WS /ws/raid/:clan_id/:username` - WebSocket raid connection

## Architecture

- **Hono**: Fast web framework for Workers
- **D1**: Serverless SQL database
- **Durable Objects**: Stateful WebSocket connections
- **OpenAI**: Speech transcription and analysis
- **Cron Triggers**: Scheduled background tasks
