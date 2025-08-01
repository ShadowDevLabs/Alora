import { BareMuxConnection } from "@mercuryworkshop/bare-mux";
import Settings from "./settings";

const conn = new BareMuxConnection("/bare-mux/worker.js");
let proxy = await Settings.get("proxy")

Settings.onUpdate(async (e) => {
    if (e === 'proxy') proxy = await Settings.get("proxy")
})

const transports = {
    epoxy: "/epoxy/index.mjs",
    libcurl: "/libcurl/index.mjs"
}
let sj;

async function init(e?: TransportEvent) {
    await initScramjet();
    if (!e) navigator.serviceWorker.register('/sw.js');
    console.log("[INIT] Setting transport...");
    await setTransport();
    console.log("[DEBUG] SJ at:");
}

async function initScramjet() {
    //@ts-ignore
    const { ScramjetController } = $scramjetLoadController();
    sj = new ScramjetController({
        prefix: "/service/scram/",
        files: {
            wasm: "/scram/scramjet.wasm.wasm",
            all: "/scram/scramjet.all.js",
            sync: "/scam/scramjet.sync.js"
        },
        codec: {
            encode: (url: string) => {
                return __uv$config.encodeUrl(url);
            },
            decode: (url: string) => {
                return __uv$config.decodeUrl(url);
            }
        }
    });

    sj.init();
}

async function setTransport(server?: string | undefined, transport?: string) {
    server = server || "wss://phantom.lol/wisp/";
    transport = transport || "epoxy"
    console.log(`[ST] Setting transport as ${transport} with server ${server}`);
    await conn.setTransport(transports[transport as keyof typeof transports], [{ wisp: server }]);
}

async function parse(input: string): Promise<string> {
    if (input.startsWith("alora://")) {
        return input.replace("alora://", "/");
    }

    const searchEngine = await Settings.get("searchEngine") as string || "https://google.com/search?q={query}";

    try {
        const inWProto = input.replace(/^(?!https?:\/\/)(?:\/\/)?/, "https://");
        const hostname = new URL(inWProto).hostname;
        if (!hostname.includes(".") || /[^a-z0-9.-]/i.test(hostname)) throw new Error("No TLD or invalid characters");

        return (proxy === "uv") ? __uv$config.prefix + __uv$config.encodeUrl(inWProto) : "/service/scram/" + __uv$config.encodeUrl(inWProto);
    } catch {
        const searchUrl = searchEngine.replace("{query}", encodeURIComponent(input));
        return (proxy === "uv" ? __uv$config.prefix : "/service/scram/") + __uv$config.encodeUrl(searchUrl);
    }
}



function readable(input: string): string {
    console.log(input);
    if (input.startsWith(__uv$config.prefix)) {
        return __uv$config.decodeUrl(input.replace(__uv$config.prefix, ""));
    } else if (input.startsWith("/service/scram")) {
        console.log(input.replace("/service/scram/", ""))
        return __uv$config.decodeUrl(input.replace("/service/scram/", ""));
    } else {
        return "alora:/" + input;
    }
}

function icon(url: string): string {
    return url.startsWith("alora:/") ? '/icons/alora-transparent-thick.png' : `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
}

export { init, setTransport, parse, readable, icon }; 