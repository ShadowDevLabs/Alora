interface UVConfig {
    prefix: string;
    bare: string;
    encodeUrl: (url: string) => string;
    decodeUrl: (url: string) => string;
    handler: string;
    client: string;
    bundle: string;
    config: string;
    sw: string;
}

declare const __uv$config: UVConfig;

interface TransportEvent extends Event {
    detail?: {
        transport: string;
        server: string;
    };
}

interface Shortcut {
    name: string;
    url: string;
}

interface Settings {
  searchEngine: string;
  theme: string;
  proxy: string;
  shortcuts: Shortcut[];
}