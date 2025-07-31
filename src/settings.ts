import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'AloraSettingsDB';
const STORE_NAME = 'settings';
const DB_VERSION = 1;

type SettingsUpdateMessage = {
    type: 'setting_updated';
    key: string;
};

export default class SettingsManager {
    private static dbPromise: Promise<IDBPDatabase> | null = null;
    private static channel = new BroadcastChannel('settings_channel');

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
        this.channel.postMessage({ type: 'setting_updated', key: key });
    }

    static onUpdate(callback: (key: string) => void): () => void {
        const messageHandler = (event: MessageEvent<SettingsUpdateMessage>) => {
            if (event.data && event.data.type === 'setting_updated') {
                callback(event.data.key);
            }
        };

        this.channel.addEventListener('message', messageHandler);

        return () => {
            this.channel.removeEventListener('message', messageHandler);
        };
    }

    static applyTheme(): void {
        document.documentElement.className = localStorage.getItem('theme') ?? 'dark';
    }

    static setupThemeSignal(createSignal: any, createEffect: any) {
        const [theme, setTheme] = createSignal(localStorage.getItem('theme') ?? 'dark');

        createEffect(() => {
            const t = theme();
            document.documentElement.className = t;
            localStorage.setItem('theme', t);
        });

        window.addEventListener('storage', e => {
            if (e.key === 'theme' && e.newValue) setTheme(e.newValue);
        });

        return { theme, setTheme };
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
        ],
        cloak: {
            title: null,
            icon: null
        }
    };
}