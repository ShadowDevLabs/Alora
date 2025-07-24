import { BareMuxConnection } from "@mercuryworkshop/bare-mux";
import Settings from "./settings";

const conn = new BareMuxConnection("/bare-mux/worker.js");
const proxy = await Settings.get("proxy")
const transports = {
    epoxy: "/epoxy/index.mjs",
    libcurl: "/libcurl/index.mjs"
}

async function init(e?: TransportEvent) {
    if (!e) navigator.serviceWorker.register('/sw.js');
    await setTransport(undefined, "epoxy");
}

async function setTransport(server: string | undefined, transport?: string) {
    server = server || "wss://phantom.lol/wisp/";
    transport = transport || "epoxy"
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

        return (proxy === "uv") ? __uv$config.prefix + __uv$config.encodeUrl(inWProto) : __uv$config.prefix + __uv$config.encodeUrl(inWProto);
    } catch {
        const searchUrl = searchEngine.replace("{query}", encodeURIComponent(input));
        return __uv$config.prefix + __uv$config.encodeUrl(searchUrl);
    }
}



function readable(input: string): string {
    console.log(input);
    if (input.startsWith(__uv$config.prefix)) {
        return __uv$config.decodeUrl(input.replace(__uv$config.prefix, ""));
    } else {
        return "alora:/" + input;
    }
}

export { init, setTransport, parse, readable }; 