/**
 * Telegram Mini App Integration Module
 * Handles webhook validation, initData authentication, and bot messages
 */

export interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
    callback_query?: TelegramCallbackQuery;
    pre_checkout_query?: any;
}

export interface TelegramMessage {
    message_id: number;
    from: TelegramUser;
    chat: TelegramChat;
    date: number;
    text?: string;
    entities?: any[];
}

export interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

export interface TelegramChat {
    id: number;
    type: string;
    first_name?: string;
    username?: string;
}

export interface TelegramCallbackQuery {
    id: string;
    from: TelegramUser;
    message?: TelegramMessage;
    data?: string;
}

export class TelegramService {
    private botToken: string;
    private webhookSecret: string;

    constructor(botToken: string, webhookSecret: string) {
        this.botToken = botToken;
        this.webhookSecret = webhookSecret;
    }

    /**
     * Validate webhook request signature
     */
    validateWebhookRequest(secretToken: string | null | undefined): boolean {
        return secretToken === this.webhookSecret;
    }

    /**
     * Validate Telegram Mini App initData
     * Based on: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
     */
    async validateInitData(initData: string): Promise<{ valid: boolean; user?: TelegramUser; authDate?: number }> {
        try {
            const urlParams = new URLSearchParams(initData);
            const hash = urlParams.get('hash');

            if (!hash) {
                return { valid: false };
            }

            // Remove hash from params
            urlParams.delete('hash');

            // Sort params alphabetically and create data-check-string
            const dataCheckArray: string[] = [];
            const sortedParams = Array.from(urlParams.entries()).sort(([a], [b]) => a.localeCompare(b));

            for (const [key, value] of sortedParams) {
                dataCheckArray.push(`${key}=${value}`);
            }

            const dataCheckString = dataCheckArray.join('\n');

            // Create secret key using HMAC-SHA256 of bot token
            const secretKey = await this.hmacSha256('WebAppData', this.botToken);

            // Create hash of data-check-string
            const calculatedHash = await this.hmacSha256Hex(dataCheckString, secretKey);

            // Compare hashes
            const valid = calculatedHash === hash;

            if (valid) {
                // Parse user data
                const userParam = urlParams.get('user');
                const authDateParam = urlParams.get('auth_date');

                let user: TelegramUser | undefined;
                if (userParam) {
                    user = JSON.parse(userParam);
                }

                return {
                    valid: true,
                    user,
                    authDate: authDateParam ? parseInt(authDateParam) : undefined
                };
            }

            return { valid: false };
        } catch (error) {
            console.error('initData validation error:', error);
            return { valid: false };
        }
    }

    /**
     * Send message to Telegram user
     */
    async sendMessage(chatId: number, text: string, options?: any): Promise<boolean> {
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text,
                    parse_mode: 'HTML',
                    ...options
                })
            });

            const result: any = await response.json();
            return result.ok;
        } catch (error) {
            console.error('Send message error:', error);
            return false;
        }
    }

    /**
     * Send inline keyboard to user
     */
    async sendInlineKeyboard(
        chatId: number,
        text: string,
        buttons: Array<Array<{ text: string; callback_data?: string; url?: string; web_app?: { url: string } }>>
    ): Promise<boolean> {
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                })
            });

            const result: any = await response.json();
            return result.ok;
        } catch (error) {
            console.error('Send inline keyboard error:', error);
            return false;
        }
    }

    /**
     * Answer callback query
     */
    async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<boolean> {
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callback_query_id: callbackQueryId,
                    text,
                    show_alert: false
                })
            });

            const result: any = await response.json();
            return result.ok;
        } catch (error) {
            console.error('Answer callback query error:', error);
            return false;
        }
    }

    /**
     * HMAC-SHA256 helper (returns ArrayBuffer)
     */
    private async hmacSha256(data: string, key: string): Promise<ArrayBuffer> {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(key);
        const dataToSign = encoder.encode(data);

        // Use Web Crypto API (available in Cloudflare Workers)
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        return await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);
    }

    /**
     * HMAC-SHA256 helper (returns hex string)
     */
    private async hmacSha256Hex(data: string, key: ArrayBuffer): Promise<string> {
        const encoder = new TextEncoder();
        const dataToSign = encoder.encode(data);

        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);

        // Convert ArrayBuffer to hex string
        return Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Handle /start command
     */
    async handleStartCommand(message: TelegramMessage, frontendUrl: string): Promise<void> {
        const chatId = message.chat.id;
        const firstName = message.from.first_name;

        const welcomeText = `
🎮 <b>Welcome to Synapse IELTS RPG, ${firstName}!</b>

⚔️ Battle monsters by speaking English
🎯 Master IELTS through voice combat
🏆 Compete in regional leaderboards

Click the button below to start your journey!
        `.trim();

        await this.sendInlineKeyboard(chatId, welcomeText, [
            [
                {
                    text: '🎮 PLAY SYNAPSE',
                    web_app: { url: frontendUrl }
                }
            ]
        ]);
    }

    /**
     * Handle /help command
     */
    async handleHelpCommand(message: TelegramMessage): Promise<void> {
        const chatId = message.chat.id;

        const helpText = `
<b>📚 Synapse IELTS RPG Commands</b>

/start - Launch the game
/help - Show this help message
/stats - View your statistics
/leaderboard - Regional rankings

<b>🎮 How to Play</b>
1. Click "🎮 PLAY SYNAPSE" button
2. Speak into your microphone to attack
3. AI analyzes your English fluency
4. Defeat monsters and earn XP

<b>🏆 Features</b>
• Voice-based combat system
• Real-time IELTS feedback
• Clan battles and raids
• Regional competitions
        `.trim();

        await this.sendMessage(chatId, helpText);
    }
}
