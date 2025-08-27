import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL;

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "apple-touch-icon.png",
          "favicon.ico",
          "maskable-icon.png",
        ],
        manifest: {
          name: "Restaurante",
          short_name: "Restaurante",
          description: "App para validação de tickets de alimentação",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/?source=pwa",
          lang: "pt-BR",
          categories: ["food", "business", "productivity"],
          icons: [
            {
              src: "/pwa-48x48.png",
              sizes: "48x48",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-72x72.png",
              sizes: "72x72",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-96x96.png",
              sizes: "96x96",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-144x144.png",
              sizes: "144x144",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          shortcuts: [
            {
              name: "Validar Ticket",
              short_name: "Validar",
              url: "/validate",
              description: "Validar um ticket",
              icons: [
                {
                  src: "/icon-validate.png",
                  sizes: "96x96",
                  type: "image/png",
                },
              ],
            },
            {
              name: "Meus Tickets",
              short_name: "Tickets",
              url: "/tickets",
              description: "Visualizar tickets",
              icons: [
                {
                  src: "/icon-tickets.png",
                  sizes: "96x96",
                  type: "image/png",
                },
              ],
            },
          ],
          screenshots: [
            {
              src: "/screenshot1.png",
              sizes: "1280x720",
              type: "image/png",
              label: "Tela de validação",
              platform: "web",
            },
          ],
          related_applications: [],
          prefer_related_applications: false,
        },
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 5000000,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:js|css|html|json)$/,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "static-resources",
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "images-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
        strategies: "generateSW",
        devOptions: {
          enabled: true,
          type: "module",
          navigateFallback: "index.html",
        },
        injectRegister: "auto",
        minify: true,
        manifestFilename: "manifest.webmanifest",
        includeManifestIcons: true,
        useCredentials: true,
        mode: mode === "development" ? "development" : "production",
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5175,
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
        },
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            http: ["axios"],
            utils: ["date-fns"],
            lodash: ["lodash"],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
