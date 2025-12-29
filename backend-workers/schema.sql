-- Clans table
CREATE TABLE IF NOT EXISTS clans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    sanity_meter REAL DEFAULT 100.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sync_level TEXT DEFAULT '{"vocabulary":0,"syntax":0,"fluency":0}',
    region TEXT DEFAULT 'Tashkent'
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    telegram_id TEXT UNIQUE,
    clan_id INTEGER,
    xp INTEGER DEFAULT 0,
    digital_credits REAL DEFAULT 0.0,
    daily_battle_completed INTEGER DEFAULT 0,
    region TEXT DEFAULT 'Tashkent',
    stats TEXT DEFAULT '{"vocabulary":0,"syntax":0,"fluency":0}',
    FOREIGN KEY (clan_id) REFERENCES clans(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_clan_id ON users(clan_id);
CREATE INDEX IF NOT EXISTS idx_clans_name ON clans(name);
CREATE INDEX IF NOT EXISTS idx_clans_region ON clans(region);
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region);
