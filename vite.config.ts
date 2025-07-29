import { defineConfig, ViteDevServer } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { scramjetPath } from "@mercuryworkshop/scramjet";
//@ts-expect-error
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import sirv from 'sirv';

const devProxyAssets = () => ({
  name: 'dev-proxy-assets',
  configureServer(server: ViteDevServer) {
    // Your existing static asset middleware
    server.middlewares.use('/uv/', sirv('public/uv', { dev: true }));
    server.middlewares.use('/bare-mux/', sirv(baremuxPath, { dev: true }));
    server.middlewares.use('/uv/', sirv(uvPath, { dev: true }));
    server.middlewares.use('/epoxy/', sirv(epoxyPath, { dev: true }));
    server.middlewares.use('/scram/', sirv(scramjetPath, { dev: true }));

    server.middlewares.use('/api/ask', async (req, res, next) => {
      if (req.method !== 'POST') {
        return next();
      }

      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', async () => {
        try {
          const response = await fetch('https://goshadow.net/ask', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body,
          });

          const data = await response.text();
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(data);

        } catch (error) {
          console.error('Proxy error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Proxy failed' }));
        }
      });
    });
  },
});

export default defineConfig({
  plugins: [
    solidPlugin(),
    devProxyAssets(),
    viteStaticCopy({
      targets: [
        { src: [`${uvPath}/**/*`, `!${uvPath}/uv.config.js`].map(p => p.replace(/\\/g, "/")), dest: "uv" },
        { src: `${epoxyPath}/**/*`.replace(/\\/g, "/"), dest: "epoxy" },
        { src: `${scramjetPath}/**/*`.replace(/\\/g, "/"), dest: "scram" },
        { src: `${baremuxPath}/**/*`.replace(/\\/g, "/"), dest: "baremux" },
      ],
    }),
  ],
  build: {
    target: 'esnext',
  },
});