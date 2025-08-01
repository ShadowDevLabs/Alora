importScripts("/uv/uv.bundle.js");
importScripts("/uv/uv.config.js");
importScripts('/scram/scramjet.all.js')
importScripts(__uv$config.sw || "/uv/uv.sw.js");
const uv = new UVServiceWorker();
const sj = new ScramjetController();
console.log(sj);
(async function () {
    await sj.loadConfig();
})();

if (navigator.userAgent.includes("Firefox")) {
    Object.defineProperty(globalThis, "crossOriginIsolated", {
        value: true,
        writable: true
    });
}

self.addEventListener("fetch", function (event) {
    event.respondWith(
        (async () => {
            if (event.request.url.startsWith(location.origin + __uv$config.prefix)) {
                return await uv.fetch(event);
            }
            else if (sj.route(event)) {
                return await sj.fetch(event);
            }
            else {
                return await fetch(event.request);
            }
        })()
    );
});