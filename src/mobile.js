// 「更多」抽屜、備份與還原、iOS 小細節
const $ = (s) => document.querySelector(s);

export function initMobile({ app, store, isNative }) {
  const sheet = $("#moreSheet");
  const backdrop = $("#sheetBackdrop");
  let lastFocus = null;

  function openSheet(focusBackup) {
    lastFocus = document.activeElement;
    sheet.hidden = false;
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    msg("");
    if (focusBackup) setTimeout(() => $("#backupSec").scrollIntoView({ block: "start" }), 30);
    else sheet.scrollTop = 0;
    $("#sheetClose").focus();
  }
  function closeSheet() {
    sheet.hidden = true;
    backdrop.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-more]")) { openSheet(false); return; }
    if (e.target.closest("[data-open-backup]")) { openSheet(true); return; }
    if (e.target === backdrop || e.target.closest("#sheetClose")) { closeSheet(); return; }
    // 在抽屜裡選了分頁就關閉抽屜
    if (e.target.closest("#moreSheet .tab")) setTimeout(closeSheet, 0);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });

  // ---------- 備份與還原 ----------
  const box = $("#backupText");
  function msg(t, kind) { const m = $("#backupMsg"); m.textContent = t; m.className = "msg" + (kind ? " " + kind : ""); }
  function encode(obj) { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); }
  function decode(text) {
    const t = String(text || "").trim();
    if (!t) throw new Error("empty");
    const json = t.startsWith("{") ? t : decodeURIComponent(escape(atob(t)));
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== "object" || !("tasks" in obj || "ans" in obj || "known" in obj)) throw new Error("shape");
    return obj;
  }
  function summary(obj) {
    const days = Object.keys(obj.tasks || {}).length;
    const ans = Object.keys(obj.ans || {}).length;
    const known = Object.keys(obj.known || {}).length;
    return `課表 ${days} 項、題庫 ${ans} 題、已會單字 ${known} 個`;
  }

  $("#backupCopy").addEventListener("click", async () => {
    store.flushNow();
    const code = encode(app.state());
    box.value = code;
    try {
      await navigator.clipboard.writeText(code);
      msg("已複製備份碼（" + summary(app.state()) + "）。貼到備忘錄或傳給自己保存。", "ok");
    } catch (e) {
      box.focus(); box.select();
      msg("無法自動複製，備份碼已放在下方框內，請長按全選後複製。", "bad");
    }
  });

  const dl = $("#backupDownload");
  if (isNative || __ARTIFACT__) dl.hidden = true; // App 與分享頁不能下載檔案，改用備份碼
  dl.addEventListener("click", () => {
    store.flushNow();
    const blob = new Blob([JSON.stringify(app.state(), null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    const d = new Date();
    a.href = URL.createObjectURL(blob);
    a.download = `toeic-backup-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    msg("已下載備份檔。", "ok");
  });

  let pending = null;
  function stage(obj) {
    pending = obj;
    const b = $("#backupRestore");
    b.textContent = "確認還原（會覆蓋目前進度）";
    b.classList.add("primary");
    msg("讀到備份：" + summary(obj) + "。再按一次確認還原。", "ok");
  }
  $("#backupRestore").addEventListener("click", () => {
    if (pending) {
      store.replace(pending);
      msg("已還原，重新載入中…", "ok");
      setTimeout(() => location.reload(), 300);
      return;
    }
    try { stage(decode(box.value)); }
    catch (e) { msg("看不懂這段備份碼。請確認是完整複製的內容，或改用備份檔。", "bad"); }
  });
  box.addEventListener("input", () => {
    pending = null;
    const b = $("#backupRestore"); b.textContent = "從備份碼還原"; b.classList.remove("primary");
  });
  $("#backupFile").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try { stage(decode(r.result)); }
      catch (err) { msg("這個檔案不是本 App 的備份檔。", "bad"); }
    };
    r.readAsText(f);
    e.target.value = "";
  });

  // 版本資訊
  const v = $("#appVer");
  if (v) v.textContent = `多益滿分衝刺營 v${__APP_VERSION__} · ${isNative ? "App 版" : (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone ? "主畫面版" : "網頁版")}`;
}
