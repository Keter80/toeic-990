import "./styles.css";
import "./mobile.css";
import "./game.css";
import { initStore, store, isNative, platform } from "./storage.js";
import { startApp } from "./app.js";
import { initMobile } from "./mobile.js";
import { initGame } from "./game.js";

(async () => {
  await initStore();
  document.documentElement.dataset.platform = platform;
  const app = startApp({ store, platform });
  initMobile({ app, store, isNative });
  initGame({ app, store, isNative });

  // 只有網頁版（PWA）需要 Service Worker；App 版的檔案本來就在手機裡
  if (!isNative && !__ARTIFACT__ && "serviceWorker" in navigator) {
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({ immediate: true });
  }
})();
