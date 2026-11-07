// 進度儲存：網頁版用 localStorage；iOS / Android App 版另外寫入原生 Preferences，
// 避免 WebView 清快取時進度遺失。對 app.js 來說兩者都是同步的 get / set。
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const KEY = "toeic800-v1";
export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // "ios" | "android" | "web"

let cache = null;
let timer = null;

function readLocal() {
  try {
    const v = localStorage.getItem(KEY);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
}

function flush() {
  if (cache == null) return;
  const json = JSON.stringify(cache);
  try { localStorage.setItem(KEY, json); } catch (e) { /* 私密瀏覽等情況 */ }
  if (isNative) Preferences.set({ key: KEY, value: json }).catch(() => {});
}

export const store = {
  get: () => cache,
  set(obj) {
    cache = obj;
    clearTimeout(timer);
    timer = setTimeout(flush, 150);
  },
  flushNow() {
    clearTimeout(timer);
    flush();
  },
  replace(obj) {
    cache = obj;
    this.flushNow();
  },
};

export async function initStore() {
  cache = readLocal();
  if (isNative) {
    try {
      const { value } = await Preferences.get({ key: KEY });
      if (value) cache = JSON.parse(value);
    } catch (e) { /* 用 localStorage 的內容 */ }
  } else if (navigator.storage && navigator.storage.persist) {
    // 請瀏覽器把這個網站的資料標成「持久保存」，降低被系統清除的機會
    navigator.storage.persist().catch(() => {});
  }
  window.addEventListener("pagehide", () => store.flushNow());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") store.flushNow();
  });
  return store;
}
