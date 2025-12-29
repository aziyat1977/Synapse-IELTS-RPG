// Durable Object for WebSocket raid functionality
export class RaidRoom {
    private state: DurableObjectState;
    private sessions: Map<WebSocket, { username: string; clanId: number }>;
    private raidState: {
        active: boolean;
        startTime?: number;
        participants: string[];
        bossHP: number;
        maxBossHP: number;
    };

    constructor(state: DurableObjectState, env: any) {
        this.state = state;
        this.sessions = new Map();
        this.raidState = {
            active: false,
            participants: [],
            bossHP: 0,
            maxBossHP: 0
        };
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // WebSocket upgrade
        if (request.headers.get('Upgrade') === 'websocket') {
            const pair = new WebSocketPair();
            const [client, server] = Object.values(pair);

            // Extract clan_id and username from query params
            const clanId = parseInt(url.searchParams.get('clan_id') || '0');
            const username = url.searchParams.get('username') || 'anonymous';

            await this.handleSession(server, { username, clanId });

            return new Response(null, {
                status: 101,
                webSocket: client,
            });
        }

        // HTTP endpoints for raid control
        if (request.method === 'POST' && url.pathname === '/start') {
            const body = await request.json() as { bossHP: number };
            this.startRaid(body.bossHP);
            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response('Not found', { status: 404 });
    }

    async handleSession(websocket: WebSocket, meta: { username: string; clanId: number }) {
        this.state.acceptWebSocket(websocket);
        this.sessions.set(websocket, meta);

        // Send current raid state
        websocket.send(JSON.stringify({
            type: 'raid_state',
            data: this.raidState
        }));

        // Notify others about new participant
        this.broadcast({
            type: 'player_joined',
            data: { username: meta.username }
        }, websocket);

        // Add to participants if raid is active
        if (this.raidState.active && !this.raidState.participants.includes(meta.username)) {
            this.raidState.participants.push(meta.username);
        }
    }

    async webSocketMessage(websocket: WebSocket, message: string | ArrayBuffer) {
        try {
            const data = JSON.parse(message as string);
            const session = this.sessions.get(websocket);

            if (!session) return;

            switch (data.type) {
                case 'attack':
                    this.handleAttack(data.damage, session.username);
                    break;
                case 'voice_attack':
                    this.handleVoiceAttack(data.transcript, data.damage, session.username);
                    break;
                case 'chat':
                    this.broadcast({
                        type: 'chat',
                        data: {
                            username: session.username,
                            message: data.message
                        }
                    });
                    break;
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    }

    async webSocketClose(websocket: WebSocket, code: number, reason: string) {
        const session = this.sessions.get(websocket);
        if (session) {
            this.broadcast({
                type: 'player_left',
                data: { username: session.username }
            }, websocket);

            // Remove from participants
            this.raidState.participants = this.raidState.participants.filter(
                p => p !== session.username
            );
        }
        this.sessions.delete(websocket);
        websocket.close(code, reason);
    }

    private startRaid(bossHP: number) {
        this.raidState = {
            active: true,
            startTime: Date.now(),
            participants: Array.from(this.sessions.values()).map(s => s.username),
            bossHP,
            maxBossHP: bossHP
        };

        this.broadcast({
            type: 'raid_started',
            data: this.raidState
        });
    }

    private handleAttack(damage: number, username: string) {
        if (!this.raidState.active) return;

        this.raidState.bossHP = Math.max(0, this.raidState.bossHP - damage);

        this.broadcast({
            type: 'boss_damaged',
            data: {
                username,
                damage,
                remainingHP: this.raidState.bossHP,
                percentage: (this.raidState.bossHP / this.raidState.maxBossHP) * 100
            }
        });

        // Check if boss is defeated
        if (this.raidState.bossHP <= 0) {
            this.endRaid(true);
        }
    }

    private handleVoiceAttack(transcript: string, damage: number, username: string) {
        if (!this.raidState.active) return;

        this.raidState.bossHP = Math.max(0, this.raidState.bossHP - damage);

        this.broadcast({
            type: 'voice_attack',
            data: {
                username,
                transcript,
                damage,
                remainingHP: this.raidState.bossHP,
                percentage: (this.raidState.bossHP / this.raidState.maxBossHP) * 100
            }
        });

        if (this.raidState.bossHP <= 0) {
            this.endRaid(true);
        }
    }

    private endRaid(victory: boolean) {
        this.raidState.active = false;

        this.broadcast({
            type: 'raid_ended',
            data: {
                victory,
                participants: this.raidState.participants,
                duration: this.raidState.startTime ? Date.now() - this.raidState.startTime : 0
            }
        });
    }

    private broadcast(message: any, except?: WebSocket) {
        const messageStr = JSON.stringify(message);

        for (const [ws, session] of this.sessions) {
            if (ws !== except) {
                try {
                    ws.send(messageStr);
                } catch (error) {
                    console.error('Broadcast error:', error);
                }
            }
        }
    }
}
