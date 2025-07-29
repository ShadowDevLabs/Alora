import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'AloraSettingsDB';
const STORE_NAME = 'settings';
const DB_VERSION = 1;

export default class SettingsManager {
    private static dbPromise: Promise<IDBPDatabase> | null = null;

    private static getDb(): Promise<IDBPDatabase> {
        if (!this.dbPromise) {
            this.dbPromise = openDB(DB_NAME, DB_VERSION, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME);
                    }
                },
            });
        }
        return this.dbPromise;
    }

    static async get<K extends keyof Settings>(key: K): Promise<Settings[K]> {
        const db = await this.getDb();
        const value = await db.get(STORE_NAME, key);
        if (value === undefined) {
            return this.defaultSettings[key];
        }
        return value;
    }

    static async set(key: string, value: any): Promise<void> {
        const db = await this.getDb();
        await db.put(STORE_NAME, value, key);
    }

    static async applyTheme(): Promise<void> {
        const theme = await this.get('theme');
        document.documentElement.className = theme ?? 'dark';
    }




    static defaultSettings: Settings = {
        searchEngine: "https://search.brave.com/search?q={query}",
        theme: "dark",
        proxy: "uv",
        shortcuts: [
            { name: 'YouTube', url: 'youtube.com' },
            { name: 'TikTok', url: 'tiktok.com' },
            { name: 'Discord', url: 'discord.com' },
            { name: 'GitHub', url: 'github.com' },
            { name: 'Twitter', url: 'twitter.com' },
        ]
    };
}