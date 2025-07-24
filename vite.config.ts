// vite.config.ts
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
    server.middlewares.use('/uv/', sirv('public/uv', { dev: true }));
    server.middlewares.use('/bare-mux/', sirv(baremuxPath, { dev: true }));
    server.middlewares.use('/uv/', sirv(uvPath, { dev: true }));
    server.middlewares.use('/epoxy/', sirv(epoxyPath, { dev: true }));
    server.middlewares.use('/scram/', sirv(scramjetPath, { dev: true }));
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