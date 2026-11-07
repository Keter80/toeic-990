import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json" with { type: "json" };

// BASE_PATH：部署到 GitHub Pages 子路徑時由 CI 設定（例如 /toeic-990/）；
// 本機、Capacitor App 版一律用相對路徑。
const base = process.env.BASE_PATH || "./";

export default defineConfig(({ mode }) => {
  const artifact = mode === "artifact"; // 產生單一 HTML 檔（給 claude.ai 分享頁用）
  return {
  base: artifact ? "./" : base,
  define: { __APP_VERSION__: JSON.stringify(pkg.version), __ARTIFACT__: JSON.stringify(artifact) },
  resolve: artifact ? { alias: { "virtual:pwa-register": "/src/pwa-stub.js" } } : {},
  build: artifact
    ? { target: "es2020", outDir: "dist-artifact", chunkSizeWarningLimit: 2000, rollupOptions: { output: { inlineDynamicImports: true } } }
    : { target: "es2020", chunkSizeWarningLimit: 1200 },
  plugins: artifact ? [] : [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false, // 由 src/main.js 決定：只在網頁版註冊
      includeAssets: ["apple-touch-icon.png", "icons/*.png"],
      manifest: {
        name: "多益滿分衝刺營",
        short_name: "多益990",
        description: "60 天從零到多益 990：課表、文法、閱讀、題庫與單字。",
        lang: "zh-Hant",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F6F8FC",
        theme_color: "#E0335A",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,json}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts", expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
};
});
