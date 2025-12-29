// TypeScript type definitions for Cloudflare Workers environment
export interface Env {
    DB: D1Database;
    RAID_ROOM: DurableObjectNamespace;
    OPENAI_API_KEY: string;
    TELEGRAM_BOT_TOKEN: string;
    WEBHOOK_SECRET: string;
    ENVIRONMENT: string;
    FRONTEND_URL?: string;
}

// User model
export interface User {
    id?: number;
    username: string;
    telegram_id?: string | null;
    clan_id?: number | null;
    xp: number;
    digital_credits: number;
    daily_battle_completed: boolean;
    region: string;
    stats: UserStats;
}

export interface UserStats {
    vocabulary: number;
    syntax: number;
    fluency: number;
}

// Clan model
export interface Clan {
    id?: number;
    name: string;
    sanity_meter: number;
    created_at?: string;
    sync_level: ClanSyncLevel;
    region: string;
}

export interface ClanSyncLevel {
    vocabulary: number;
    syntax: number;
    fluency: number;
}

// Request/Response types
export interface AnalysisResult {
    bandEstimate: number;
    errors: ErrorDetail[];
    enemy: CustomEnemy;
    gapGraph: Record<string, number>;
    questions: Question[];
}

export interface ErrorDetail {
    type: string;
    original: string;
    correction: string;
    explanation: string;
}

export interface CustomEnemy {
    name: string;
    type: string;
    description: string;
    weakness: string;
    hp: number;
    image: string;
    color: string;
}

export interface Question {
    id: number;
    prompt: string;
    options: string[];
    correctAnswer: string;
    complexity: number;
    explanation: string;
}

export interface VoiceCombatResult {
    transcript: string;
    damage: number;
    isCritical: boolean;
    feedback: string;
    recoilType: string;
}

export interface ClanCreate {
    username: string;
    telegram_id?: string;
}

export interface ClanInvite {
    inviter_username: string;
    invitee_username: string;
}

export interface ClanStatus {
    clan_name: string;
    members: string[];
    sync_level: ClanSyncLevel;
    sanity_meter: number;
    region: string;
}

export interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    members?: number;
    region?: string;
}
