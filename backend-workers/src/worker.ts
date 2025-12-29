import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, ClanCreate, ClanInvite, ClanStatus } from './types';
import { Database } from './database';
import { OpenAIService } from './openai';
import { RaidRoom } from './raid';
import { TelegramService, TelegramUpdate } from './telegram';

// Export Durable Object
export { RaidRoom };

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors({
    origin: '*', // In production, specify your frontend domain
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Root endpoint
app.get('/', (c) => {
    return c.json({
        message: 'Synapse IELTS RPG API',
        version: '1.0.0',
        status: 'online'
    });
});

// Health check endpoint
app.get('/health', (c) => {
    return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Telegram webhook endpoint
app.post('/telegram', async (c) => {
    try {
        // Validate webhook secret
        const secretToken = c.req.header('X-Telegram-Bot-Api-Secret-Token');
        const telegram = new TelegramService(c.env.TELEGRAM_BOT_TOKEN, c.env.WEBHOOK_SECRET);

        if (!telegram.validateWebhookRequest(secretToken)) {
            console.error('Invalid webhook secret');
            return c.json({ ok: false, error: 'Unauthorized' }, 401);
        }

        const update: TelegramUpdate = await c.req.json();
        console.log('Telegram update received:', update.update_id);

        // Handle bot messages
        if (update.message) {
            const message = update.message;
            const text = message.text || '';
            const frontendUrl = c.env.FRONTEND_URL || 'https://synapse-ielts-rpg.pages.dev';

            // Handle commands
            if (text.startsWith('/start')) {
                await telegram.handleStartCommand(message, frontendUrl);
            } else if (text.startsWith('/help')) {
                await telegram.handleHelpCommand(message);
            } else if (text.startsWith('/stats')) {
                // Get user stats from database
                const db = new Database(c.env.DB);
                const telegramId = message.from.id.toString();
                const user = await db.getUserByTelegramId(telegramId);

                if (user) {
                    const statsText = `
📊 <b>Your Stats</b>

🎯 XP: ${user.xp}
💰 Credits: ${user.digital_credits}
📚 Vocabulary: ${user.stats.vocabulary}
✍️ Syntax: ${user.stats.syntax}
🗣️ Fluency: ${user.stats.fluency}
                    `.trim();
                    await telegram.sendMessage(message.chat.id, statsText);
                } else {
                    await telegram.sendMessage(message.chat.id, 'No stats found. Play the game first!');
                }
            } else {
                // Default response
                await telegram.sendMessage(
                    message.chat.id,
                    'Welcome! Use /start to play the game or /help for commands.'
                );
            }
        }

        // Handle callback queries (inline button presses)
        if (update.callback_query) {
            await telegram.answerCallbackQuery(update.callback_query.id, 'Processing...');
        }

        // Handle pre-checkout queries (payments)
        if (update.pre_checkout_query) {
            console.log('Pre-checkout query:', update.pre_checkout_query);
            // Validate payment here if needed
        }

        return c.json({ ok: true });
    } catch (error: any) {
        console.error('Telegram webhook error:', error);
        return c.json({ ok: false, error: error.message }, 500);
    }
});

// Validate Telegram Mini App initData
app.post('/api/telegram/validate', async (c) => {
    try {
        const { initData } = await c.req.json();

        if (!initData) {
            return c.json({ valid: false, error: 'No initData provided' }, 400);
        }

        const telegram = new TelegramService(c.env.TELEGRAM_BOT_TOKEN, c.env.WEBHOOK_SECRET);
        const validation = telegram.validateInitData(initData);

        if (!validation.valid) {
            return c.json({ valid: false, error: 'Invalid signature' }, 401);
        }

        // User authenticated - create/update in database
        const db = new Database(c.env.DB);

        if (validation.user) {
            const telegramId = validation.user.id.toString();
            const username = validation.user.username || `user_${telegramId}`;

            let user = await db.getUserByTelegramId(telegramId);

            if (!user) {
                // Create new user
                user = await db.createUser({
                    username,
                    telegram_id: telegramId,
                    xp: 0,
                    digital_credits: 0,
                    daily_battle_completed: false,
                    region: validation.user.language_code || 'uz',
                    stats: { vocabulary: 0, syntax: 0, fluency: 0 }
                });
            }

            return c.json({
                valid: true,
                user: {
                    id: user.id,
                    username: user.username,
                    telegram_id: user.telegram_id,
                    xp: user.xp,
                    credits: user.digital_credits,
                    stats: user.stats
                }
            });
        }

        return c.json({ valid: true });
    } catch (error: any) {
        console.error('Telegram validation error:', error);
        return c.json({ valid: false, error: error.message }, 500);
    }
});

// Speech analysis endpoint
app.post('/api/analyze-speech', async (c) => {
    try {
        const formData = await c.req.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return c.json({ error: 'No audio file provided' }, 400);
        }

        // Initialize OpenAI service
        const openai = new OpenAIService(c.env.OPENAI_API_KEY);

        // Convert File to ArrayBuffer
        const audioBuffer = await audioFile.arrayBuffer();

        // Transcribe
        const transcript = await openai.transcribeAudio(audioBuffer);

        // Analyze
        const analysis = await openai.analyzeTranscript(transcript);

        return c.json(analysis);
    } catch (error: any) {
        console.error('Analysis error:', error);
        return c.json({
            error: 'Speech analysis failed',
            details: error.message
        }, 500);
    }
});

// Voice combat endpoint
app.post('/api/combat-voice', async (c) => {
    try {
        const formData = await c.req.formData();
        const audioFile = formData.get('audio') as File;
        const prompt = formData.get('prompt') as string || '';

        if (!audioFile) {
            return c.json({ error: 'No audio file provided' }, 400);
        }

        const openai = new OpenAIService(c.env.OPENAI_API_KEY);
        const audioBuffer = await audioFile.arrayBuffer();

        // Transcribe with specialized prompt
        const customPrompt = 'English speech with Uzbek accent. Focus on comprehensibility. Common issues: W/V sounds, TH pronunciation.';
        const transcript = await openai.transcribeAudio(audioBuffer, customPrompt);

        // Analyze combat effectiveness
        const combatResult = await openai.analyzeVoiceCombat(transcript, prompt || 'grammar');

        return c.json({
            transcript,
            ...combatResult
        });
    } catch (error: any) {
        console.error('Voice combat error:', error);
        return c.json({
            error: 'Voice combat failed',
            details: error.message
        }, 500);
    }
});

// Content refinery endpoint (PDF processing)
app.post('/api/refine-content', async (c) => {
    try {
        const formData = await c.req.formData();
        const pdfFile = formData.get('file') as File;

        if (!pdfFile) {
            return c.json({ error: 'No PDF file provided' }, 400);
        }

        // For now, return a mock response
        // In production, you'd use a PDF parsing library
        return c.json({
            success: true,
            message: 'PDF processing coming soon',
            quests: []
        });
    } catch (error: any) {
        console.error('Content refinery error:', error);
        return c.json({
            error: 'PDF processing failed',
            details: error.message
        }, 500);
    }
});

// Clan: Summon (Invite) Member
app.post('/api/clan/summon', async (c) => {
    try {
        const body = await c.req.json<ClanInvite>();
        const db = new Database(c.env.DB);

        // Get inviter
        const inviter = await db.getUserByUsername(body.inviter_username);

        if (!inviter) {
            return c.json({ error: 'Inviter not found' }, 404);
        }

        // Create or get invitee
        let invitee = await db.getUserByUsername(body.invitee_username);

        if (!invitee) {
            // Create new user
            invitee = await db.createUser({
                username: body.invitee_username,
                xp: 0,
                digital_credits: 0,
                daily_battle_completed: false,
                region: inviter.region,
                stats: { vocabulary: 0, syntax: 0, fluency: 0 }
            });
        }

        // Handle clan assignment
        let clan;
        if (inviter.clan_id) {
            // Join inviter's clan
            clan = await db.getClanById(inviter.clan_id);
            await db.updateUser(invitee.username, { clan_id: inviter.clan_id });
        } else {
            // Create new clan
            clan = await db.createClan({
                name: `${inviter.username}'s Clan`,
                sanity_meter: 100,
                sync_level: { vocabulary: 0, syntax: 0, fluency: 0 },
                region: inviter.region
            });

            // Assign both users to new clan
            await db.updateUser(inviter.username, { clan_id: clan.id });
            await db.updateUser(invitee.username, { clan_id: clan.id });
        }

        return c.json({
            success: true,
            clan_name: clan?.name,
            invitee_username: invitee.username,
            message: `${invitee.username} has joined ${clan?.name}!`
        });
    } catch (error: any) {
        console.error('Clan summon error:', error);
        return c.json({
            error: 'Failed to summon clan member',
            details: error.message
        }, 500);
    }
});

// Clan: Get Status
app.get('/api/clan/status/:username', async (c) => {
    try {
        const username = c.req.param('username');
        const db = new Database(c.env.DB);

        const user = await db.getUserByUsername(username);

        if (!user || !user.clan_id) {
            return c.json({ error: 'User has no clan' }, 404);
        }

        const clan = await db.getClanById(user.clan_id);

        if (!clan) {
            return c.json({ error: 'Clan not found' }, 404);
        }

        const members = await db.getClanMembers(user.clan_id);

        const status: ClanStatus = {
            clan_name: clan.name,
            members: members.map(m => m.username),
            sync_level: clan.sync_level,
            sanity_meter: clan.sanity_meter,
            region: clan.region
        };

        return c.json(status);
    } catch (error: any) {
        console.error('Clan status error:', error);
        return c.json({
            error: 'Failed to get clan status',
            details: error.message
        }, 500);
    }
});

// Leaderboard
app.get('/api/leaderboard', async (c) => {
    try {
        const by = c.req.query('by') || 'national';
        const db = new Database(c.env.DB);

        if (by === 'regional') {
            const regionalData = await db.getRegionalLeaderboard();

            const leaderboard = regionalData.map((r, index) => ({
                rank: index + 1,
                name: r.region,
                score: r.total_xp,
                clan_count: r.clan_count
            }));

            return c.json({ type: 'regional', data: leaderboard });
        } else {
            // National (top clans)
            const clans = await db.getTopClans(10);

            const leaderboard = clans.map((clan, index) => ({
                ...clan,
                rank: index + 1
            }));

            return c.json({ type: 'national', data: leaderboard });
        }
    } catch (error: any) {
        console.error('Leaderboard error:', error);
        return c.json({
            error: 'Failed to fetch leaderboard',
            details: error.message
        }, 500);
    }
});

// WebSocket endpoint for raids
app.get('/ws/raid/:clan_id/:username', async (c) => {
    const clanId = c.req.param('clan_id');
    const username = c.req.param('username');

    // Get Durable Object ID for this clan
    const id = c.env.RAID_ROOM.idFromName(`clan-${clanId}`);
    const stub = c.env.RAID_ROOM.get(id);

    // Forward the request to the Durable Object with query params
    const url = new URL(c.req.url);
    url.searchParams.set('clan_id', clanId);
    url.searchParams.set('username', username);

    return stub.fetch(new Request(url.toString(), c.req.raw));
});

// Scheduled cron handlers
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        return app.fetch(request, env, ctx);
    },

    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
        // Sunday raid trigger
        const now = new Date();
        if (now.getDay() === 0 && now.getHours() === 0) {
            console.log('🎯 Sunday Raid Trigger activated!');
            // In production, trigger raid notifications via Telegram or email
        }

        // Andisha (sanity) notification check (every 5 minutes)
        console.log('🔔 Checking Andisha notifications...');
        // Check users' sanity meters and send notifications if needed
    }
};
