import { Env, User, Clan, UserStats, ClanSyncLevel } from './types';

// Database helper functions for Cloudflare D1

export class Database {
    constructor(private db: D1Database) { }

    // User operations
    async createUser(user: Partial<User>): Promise<User> {
        const stats = JSON.stringify(user.stats || { vocabulary: 0, syntax: 0, fluency: 0 });

        const result = await this.db.prepare(`
      INSERT INTO users (username, telegram_id, clan_id, xp, digital_credits, daily_battle_completed, region, stats)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
            user.username,
            user.telegram_id || null,
            user.clan_id || null,
            user.xp || 0,
            user.digital_credits || 0,
            user.daily_battle_completed ? 1 : 0,
            user.region || 'Tashkent',
            stats
        ).first();

        return this.parseUser(result);
    }

    async getUserByUsername(username: string): Promise<User | null> {
        const result = await this.db.prepare(`
      SELECT * FROM users WHERE username = ?
    `).bind(username).first();

        return result ? this.parseUser(result) : null;
    }

    async getUserById(id: number): Promise<User | null> {
        const result = await this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(id).first();

        return result ? this.parseUser(result) : null;
    }

    async getUserByTelegramId(telegramId: string): Promise<User | null> {
        const result = await this.db.prepare(`
      SELECT * FROM users WHERE telegram_id = ?
    `).bind(telegramId).first();

        return result ? this.parseUser(result) : null;
    }

    async updateUser(username: string, updates: Partial<User>): Promise<User> {
        const user = await this.getUserByUsername(username);
        if (!user) throw new Error('User not found');

        const setClauses: string[] = [];
        const values: any[] = [];

        if (updates.xp !== undefined) {
            setClauses.push('xp = ?');
            values.push(updates.xp);
        }
        if (updates.digital_credits !== undefined) {
            setClauses.push('digital_credits = ?');
            values.push(updates.digital_credits);
        }
        if (updates.daily_battle_completed !== undefined) {
            setClauses.push('daily_battle_completed = ?');
            values.push(updates.daily_battle_completed ? 1 : 0);
        }
        if (updates.stats) {
            setClauses.push('stats = ?');
            values.push(JSON.stringify(updates.stats));
        }
        if (updates.clan_id !== undefined) {
            setClauses.push('clan_id = ?');
            values.push(updates.clan_id);
        }
        if (updates.region) {
            setClauses.push('region = ?');
            values.push(updates.region);
        }

        values.push(username);

        const result = await this.db.prepare(`
      UPDATE users SET ${setClauses.join(', ')} WHERE username = ?
      RETURNING *
    `).bind(...values).first();

        return this.parseUser(result);
    }

    // Clan operations
    async createClan(clan: Partial<Clan>): Promise<Clan> {
        const sync_level = JSON.stringify(clan.sync_level || { vocabulary: 0, syntax: 0, fluency: 0 });

        const result = await this.db.prepare(`
      INSERT INTO clans (name, sanity_meter, sync_level, region)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `).bind(
            clan.name,
            clan.sanity_meter || 100.0,
            sync_level,
            clan.region || 'Tashkent'
        ).first();

        return this.parseClan(result);
    }

    async getClanById(id: number): Promise<Clan | null> {
        const result = await this.db.prepare(`
      SELECT * FROM clans WHERE id = ?
    `).bind(id).first();

        return result ? this.parseClan(result) : null;
    }

    async getClanByName(name: string): Promise<Clan | null> {
        const result = await this.db.prepare(`
      SELECT * FROM clans WHERE name = ?
    `).bind(name).first();

        return result ? this.parseClan(result) : null;
    }

    async getClanMembers(clanId: number): Promise<User[]> {
        const results = await this.db.prepare(`
      SELECT * FROM users WHERE clan_id = ?
    `).bind(clanId).all();

        return results.results.map(r => this.parseUser(r));
    }

    async updateClan(clanId: number, updates: Partial<Clan>): Promise<Clan> {
        const setClauses: string[] = [];
        const values: any[] = [];

        if (updates.sanity_meter !== undefined) {
            setClauses.push('sanity_meter = ?');
            values.push(updates.sanity_meter);
        }
        if (updates.sync_level) {
            setClauses.push('sync_level = ?');
            values.push(JSON.stringify(updates.sync_level));
        }

        values.push(clanId);

        const result = await this.db.prepare(`
      UPDATE clans SET ${setClauses.join(', ')} WHERE id = ?
      RETURNING *
    `).bind(...values).first();

        return this.parseClan(result);
    }

    // Leaderboard operations
    async getTopClans(limit: number = 10): Promise<any[]> {
        const results = await this.db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.region,
        c.sanity_meter,
        c.sync_level,
        COUNT(u.id) as member_count,
        SUM(u.xp) as total_xp
      FROM clans c
      LEFT JOIN users u ON u.clan_id = c.id
      GROUP BY c.id
      ORDER BY total_xp DESC
      LIMIT ?
    `).bind(limit).all();

        return results.results.map((r: any) => ({
            rank: 0, // Will be set by caller
            clan_id: r.id,
            name: r.name,
            region: r.region,
            score: r.total_xp || 0,
            members: r.member_count || 0,
            sync_level: JSON.parse(r.sync_level),
            sanity_meter: r.sanity_meter
        }));
    }

    async getRegionalLeaderboard(): Promise<any[]> {
        const results = await this.db.prepare(`
      SELECT 
        c.region,
        COUNT(DISTINCT c.id) as clan_count,
        SUM(u.xp) as total_xp
      FROM clans c
      LEFT JOIN users u ON u.clan_id = c.id
      GROUP BY c.region
      ORDER BY total_xp DESC
    `).all();

        return results.results.map((r: any) => ({
            region: r.region,
            clan_count: r.clan_count || 0,
            total_xp: r.total_xp || 0
        }));
    }

    // Helper parsers
    private parseUser(row: any): User {
        return {
            id: row.id,
            username: row.username,
            telegram_id: row.telegram_id,
            clan_id: row.clan_id,
            xp: row.xp,
            digital_credits: row.digital_credits,
            daily_battle_completed: row.daily_battle_completed === 1,
            region: row.region,
            stats: JSON.parse(row.stats)
        };
    }

    private parseClan(row: any): Clan {
        return {
            id: row.id,
            name: row.name,
            sanity_meter: row.sanity_meter,
            created_at: row.created_at,
            sync_level: JSON.parse(row.sync_level),
            region: row.region
        };
    }
}
