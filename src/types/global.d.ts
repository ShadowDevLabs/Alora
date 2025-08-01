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

interface Cloak {
    title: string | null;
    icon: string | null;
}

interface Settings {
    searchEngine: string;
    theme: string;
    proxy: string;
    shortcuts: Shortcut[];
    cloak: Cloak
}

interface SJopts {
    prefix: string;
    globals?: {
        wrapfn: string;
        wrapthisfn: string;
        trysetfn: string;
        rewritefn: string;
        metafn: string;
        setrealfn: string;
        pushsourcemapfn: string;
    };
    files: {
        wasm: string;
        all: string;
        sync: string;
    };
    flags?: {
        serviceworker?: boolean;
        syncxhr?: boolean;
        naiiveRewriter?: boolean;
        strictRewrites?: boolean;
        rewriterLogs?: boolean;
        captureErrors?: boolean;
        cleanErrors?: boolean;
        scramitize?: boolean;
        sourcemaps?: boolean;
    };
    siteFlags: {};
    codec?: {
        encode: string;
        decode: string;
    };
}

declare class ScramjetController {
    constructor(opts: SJopts);
    init(path?: string): Promise<void>;
    encodeUrl(term: string): string;
}
