import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL;
  const baseUrl = "https://food-pass-client.vercel.app";

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "E-Ticket",
          short_name: "E-Ticket",
          description: "Aplicativo de tickets",
          theme_color: "hsl(var(--background))",
          background_color: "hsl(var(--background))",
          display: "fullscreen",
          orientation: "portrait",
          scope: `${baseUrl}/`,
          start_url: `${baseUrl}/`,
          icons: [
            {
              src: `${baseUrl}/pwa-64x64.png`,
              sizes: "64x64",
              type: "image/png",
            },
            {
              src: `${baseUrl}/pwa-192x192.png`,
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: `${baseUrl}/pwa-512x512.png`,
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: `${baseUrl}/maskable-icon-512x512.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          shortcuts: [
            {
              name: "Tickets",
              url: `${baseUrl}/tickets`,
              description: "Lista de tickets",
            },
          ],
          related_applications: [],
          prefer_related_applications: false,
        },
        devOptions: {
          enabled: true,
          type: "module",
          navigateFallback: "index.html",
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5174,
      cors: {
        origin: apiUrl,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      },
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (_, req) => {
              console.log("Sending Request:", req.method, req.url);
            });
            proxy.on("proxyRes", (proxyRes, req) => {
              console.log("Received Response:", proxyRes.statusCode, req.url);
            });
          },
        },
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
