importScripts("/uv/uv.bundle.js");
importScripts("/uv/uv.config.js");
// importScripts('/scramjet/scramjet.shared.js')
// importScripts('/scramjet/scramjet.worker.js')
importScripts(__uv$config.sw || "/uv/uv.sw.js");
const uv = new UVServiceWorker();
// const sj = new ScramjetServiceWorker();

// (async function () {
//     await sj.loadConfig();
// })();

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
            // else if (sj.route(event)) {
            //     return await sj.fetch(event);
            // }
            else {
                return await fetch(event.request);
            }
        })()
    );
});