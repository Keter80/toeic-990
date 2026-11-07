// 遊戲系統：經驗值、等級、段位、連續天數、成就、寶箱、連擊、音效、震動
// 經驗值全部由學習紀錄「算出來」，所以取消勾選會扣回、不會重複加分。
const $ = (s) => document.querySelector(s);

export const XP = { task: 20, correct: 10, wrong: 3, chapter: 30, word: 5, chest: 100, ach: 50 };
const RANKS = [
  [1, "新手村見習生"], [4, "青銅冒險者"], [8, "白銀戰士"], [13, "黃金騎士"],
  [19, "白金法師"], [26, "鑽石勇者"], [33, "傳說・990"],
];
const xpAt = (L) => 50 * (L - 1) + 15 * (L - 1) * (L - 2); // 到達第 L 級需要的累積經驗
const levelOf = (xp) => { let L = 1; while (xpAt(L + 1) <= xp) L++; return L; };
const rankOf = (L) => { let i = 0; RANKS.forEach((r, k) => { if (L >= r[0]) i = k; }); return { i, name: RANKS[i][1], next: RANKS[i + 1] || null }; };

const pad = (n) => String(n).padStart(2, "0");
const dkey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function streakOf(days) {
  let c = 0; const d = new Date();
  if (!days[dkey(d)]) d.setDate(d.getDate() - 1); // 今天還沒讀，昨天有讀也算連續
  while (days[dkey(d)]) { c++; d.setDate(d.getDate() - 1); }
  return c;
}

/* ---------- icons ---------- */
const I = {
  flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c.6 3.2 4.8 5.3 4.8 10.3A4.8 4.8 0 0 1 12 17.6a4.8 4.8 0 0 1-4.8-4.8c0-2.4 1.3-3.6 2.1-4.6.2 1.6 1 2.6 2 3 0-3.6-.3-6 .7-8.7z"/><path d="M12 21.5a4 4 0 0 1-4-4c0-1.6 1-2.6 1.8-3.4.1 1.2.8 2 1.6 2.3 0-1.5.4-2.6 1.4-3.7.7 1.8 3.2 2.8 3.2 4.8a4 4 0 0 1-4 4z" opacity=".55"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1 6.2L12 17l-5.6 3 1-6.2L3 9.4l6.3-.9z"/></svg>',
  chest: '<svg viewBox="0 0 64 56" aria-hidden="true"><path class="lid" d="M6 22V16c0-6 5-11 11-11h30c6 0 11 5 11 11v6z"/><rect class="box" x="6" y="22" width="52" height="28" rx="4"/><path class="band" d="M6 30h52M28 22h8v14h-8z"/><circle class="lock" cx="32" cy="29" r="2.4"/></svg>',
  crown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8.5 7.5 12 12 5l4.5 7L21 8.5 19 18H5z"/><path d="M5 20.5h14"/></svg>',
  shield: (lv, tier) => `<svg viewBox="0 0 64 72" class="shield t${tier}" aria-hidden="true"><path class="sh-o" d="M32 3 59 13v20c0 18-12 30-27 36C17 63 5 51 5 33V13z"/><path class="sh-i" d="M32 10 52 17.5V33c0 13.6-8.6 23-20 28-11.4-5-20-14.4-20-28V17.5z"/><text x="32" y="${lv >= 10 ? 44 : 45}" text-anchor="middle" class="sh-t">${lv}</text></svg>`,
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>',
};
const TASK_NAME = { v: "單字修練", g: "文法／閱讀課", l: "聽力試煉", r: "閱讀任務", e: "錯題複盤" };

/* ---------- achievements ---------- */
const ACH = [
  ["first", "踏出第一步", "完成第一個任務", (s) => s.tasks >= 1, (s) => [s.tasks, 1]],
  ["day1", "首日通關", "任何一天 5 項全完成", (s) => s.fullDays >= 1, (s) => [s.fullDays, 1]],
  ["boss", "擊敗首領", "完成一個首領戰（模考日）", (s) => s.bossDays >= 1, (s) => [s.bossDays, 1]],
  ["streak3", "三日不中斷", "連續學習 3 天", (s) => s.best >= 3, (s) => [s.best, 3]],
  ["streak7", "一週勇者", "連續學習 7 天", (s) => s.best >= 7, (s) => [s.best, 7]],
  ["streak30", "鋼鐵意志", "連續學習 30 天", (s) => s.best >= 30, (s) => [s.best, 30]],
  ["q50", "初試身手", "題庫作答 50 題", (s) => s.ans >= 50, (s) => [s.ans, 50]],
  ["q200", "刷題狂人", "題庫作答 200 題", (s) => s.ans >= 200, (s) => [s.ans, 200]],
  ["qall", "題庫制霸", "題庫全部作答", (s) => s.ans >= s.totalQ, (s) => [s.ans, s.totalQ]],
  ["acc80", "神射手", "作答 50 題以上且正確率 80%", (s) => s.ans >= 50 && s.cor / s.ans >= 0.8, (s) => [s.ans >= 50 ? Math.round(s.cor / s.ans * 100) : 0, 80]],
  ["combo10", "十連擊", "連續答對 10 題", (s) => s.bestCombo >= 10, (s) => [s.bestCombo, 10]],
  ["lv3", "990 挑戰者", "答對 20 題 990 等級題目", (s) => s.cor3 >= 20, (s) => [s.cor3, 20]],
  ["triple", "三篇征服者", "任一組三篇閱讀 5 題全對", (s) => s.tripleFull >= 1, (s) => [s.tripleFull, 1]],
  ["g26", "文法大師", "文法 26 章全部讀完", (s) => s.gch >= 26, (s) => [s.gch, 26]],
  ["r12", "閱讀達人", "閱讀 12 章全部讀完", (s) => s.rch >= 12, (s) => [s.rch, 12]],
  ["w100", "百字斬", "標記已會 100 個單字", (s) => s.words >= 100, (s) => [s.words, 100]],
  ["w500", "字彙收藏家", "標記已會 500 個單字", (s) => s.words >= 500, (s) => [s.words, 500]],
  ["w700", "單字全圖鑑", "700 個單字全部已會", (s) => s.words >= s.totalW, (s) => [s.words, s.totalW]],
  ["stage1", "800 試煉通關", "第 1–30 天全部完成", (s) => s.full1 >= 30, (s) => [s.full1, 30]],
  ["stage2", "登上滿分王座", "60 天全部完成", (s) => s.fullDays >= 60, (s) => [s.fullDays, 60]],
];

/* ---------- sound & haptics ---------- */
let actx = null;
function tone(seq) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    let t = actx.currentTime;
    seq.forEach(([f, d, v = 0.08, type = "triangle"]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + 0.02); t += d * 0.82;
    });
  } catch (e) { /* 無音效環境 */ }
}
const SFX = {
  xp: [[880, 0.08], [1320, 0.12]],
  task: [[660, 0.07], [990, 0.07], [1320, 0.14]],
  wrong: [[220, 0.16, 0.06, "sine"]],
  level: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.28, 0.1]],
  ach: [[988, 0.09], [1319, 0.09], [1760, 0.22]],
  chest: [[392, 0.08], [523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.3, 0.1]],
};

export function initGame({ app, store, isNative }) {
  const S = app.state();
  S.g = Object.assign({ days: {}, ach: {}, lv: 0, best: 0, bestCombo: 0, sound: true, chests: {} }, S.g || {});
  let haptics = null;
  if (isNative) import("@capacitor/haptics").then((m) => { haptics = m; }).catch(() => {});
  const buzz = (kind) => {
    if (!haptics) return;
    const { Haptics, ImpactStyle, NotificationType } = haptics;
    if (kind === "success") Haptics.notification({ type: NotificationType.Success }).catch(() => {});
    else Haptics.impact({ style: kind === "heavy" ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
  };
  const sfx = (k) => { if (S.g.sound !== false) tone(SFX[k]); };

  const totalQ = app.P5.length + app.SETS.reduce((a, s) => a + s.qs.length, 0);
  const totalW = app.VOCAB.length;

  function compute() {
    const s = { totalQ, totalW };
    s.tasks = Object.keys(S.tasks).filter((k) => S.tasks[k]).length;
    let ans = 0, cor = 0, cor3 = 0, tripleFull = 0;
    app.P5.forEach((q) => { const a = S.ans[q.id]; if (a !== undefined) { ans++; if (a === q.a) { cor++; if (q.lv === 3) cor3++; } } });
    app.SETS.forEach((st) => {
      let all = true;
      st.qs.forEach((q, i) => { const a = S.ans[st.id + "#" + i]; if (a !== undefined) { ans++; if (a === q.a) { cor++; if (st.lv === 3) cor3++; } else all = false; } else all = false; });
      if (all && st.part === "p7t") tripleFull++;
    });
    Object.assign(s, { ans, cor, cor3, tripleFull });
    s.gch = Object.keys(S.chap || {}).filter((k) => S.chap[k]).length;
    s.rch = Object.keys(S.rchap || {}).filter((k) => S.rchap[k]).length;
    s.words = Object.keys(S.known || {}).filter((k) => S.known[k]).length;
    const full = app.DAYS.filter((d) => app.dayDone(d.d) === 5);
    s.fullDays = full.length;
    s.full1 = full.filter((d) => d.d <= 30).length;
    s.bossDays = full.filter(app.isBoss).length;
    s.streak = streakOf(S.g.days);
    s.best = Math.max(S.g.best || 0, s.streak);
    s.bestCombo = S.g.bestCombo || 0;
    s.achList = ACH.filter((a) => a[3](s)).map((a) => a[0]);
    s.xp = s.tasks * XP.task + cor * XP.correct + (ans - cor) * XP.wrong + (s.gch + s.rch) * XP.chapter + s.words * XP.word + s.fullDays * XP.chest + s.achList.length * XP.ach;
    s.level = levelOf(s.xp);
    s.rank = rankOf(s.level);
    s.lvFrom = xpAt(s.level); s.lvTo = xpAt(s.level + 1);
    return s;
  }

  /* ---------- quest day ---------- */
  const firstOpen = () => (app.DAYS.find((d) => app.dayDone(d.d) < 5) || app.DAYS[59]).d;
  const questDay = () => app.todayIndex() || firstOpen();
  let viewDay = questDay();

  /* ---------- feedback layer ---------- */
  const toasts = $("#toasts");
  function toast(icon, title, desc, cls = "") {
    const el = document.createElement("div");
    el.className = "toast " + cls;
    el.innerHTML = `<span class="t-ic">${icon}</span><div><b>${title}</b><span>${desc}</span></div>`;
    toasts.appendChild(el);
    setTimeout(() => el.classList.add("out"), 3000);
    setTimeout(() => el.remove(), 3500);
  }
  let lastPoint = null;
  document.addEventListener("pointerdown", (e) => { lastPoint = { x: e.clientX, y: e.clientY, t: Date.now() }; }, true);
  function floatXP(delta) {
    if (!lastPoint || Date.now() - lastPoint.t > 1500 || !delta) return;
    const el = document.createElement("div");
    el.className = "xp-float " + (delta > 0 ? "" : "neg");
    el.textContent = (delta > 0 ? "+" : "") + delta + " XP";
    el.style.left = lastPoint.x + "px"; el.style.top = lastPoint.y + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
  function levelUp(s) {
    const ov = $("#levelUp");
    ov.innerHTML = `<div class="lu-card" role="dialog" aria-label="升級"><div class="lu-burst">${Array.from({ length: 12 }, (_, i) => `<i style="--a:${i * 30}deg"></i>`).join("")}</div>
      ${I.shield(s.level, s.rank.i)}<p class="lu-k">LEVEL UP</p><h3>升到 Lv ${s.level}</h3><p class="lu-r">${s.rank.name}</p>
      <button class="btn primary" id="luClose">繼續冒險</button></div>`;
    ov.hidden = false;
    $("#luClose").focus();
    const close = () => { ov.hidden = true; };
    $("#luClose").onclick = close; ov.onclick = (e) => { if (e.target === ov) close(); };
    setTimeout(close, 5000);
  }

  /* ---------- combo (題庫) ---------- */
  let combo = 0;
  document.addEventListener("click", (e) => {
    const o = e.target.closest(".ropt");
    if (!o) return;
    setTimeout(() => {
      if (o.classList.contains("right")) {
        combo++;
        if (combo > (S.g.bestCombo || 0)) S.g.bestCombo = combo;
        if (combo >= 3 && (combo % 5 === 0 || combo === 3)) toast(I.flame, `連擊 x${combo}！`, combo >= 10 ? "手感火燙，繼續保持" : "連續答對，繼續衝", "combo");
        buzz("light");
      } else { combo = 0; sfx("wrong"); }
      $("#hudCombo").textContent = combo >= 2 ? `x${combo}` : "";
      sync(false);
    }, 0);
  });

  /* ---------- core sync ---------- */
  let prev = null;
  function sync(silent) {
    let s = compute();
    if (prev && s.xp > prev.xp) {
      const k = dkey(new Date());
      if (!S.g.days[k]) { S.g.days[k] = true; s = compute(); }
    }
    S.g.best = s.best;
    if (!silent && prev) {
      const delta = s.xp - prev.xp;
      floatXP(delta);
      if (delta > 0) sfx(s.fullDays > prev.fullDays ? "chest" : delta >= XP.task ? "task" : "xp");
      if (s.fullDays > prev.fullDays) { toast(I.chest, "寶箱開啟！", `完成一整天的任務 +${XP.chest} XP`, "gold"); buzz("success"); }
      s.achList.filter((id) => !S.g.ach[id]).forEach((id) => {
        const a = ACH.find((x) => x[0] === id);
        toast(I.star, "成就解鎖：" + a[1], a[2] + `　+${XP.ach} XP`, "gold"); sfx("ach"); buzz("success");
      });
      if (s.level > (S.g.lv || 1)) { levelUp(s); sfx("level"); buzz("success"); }
    }
    s.achList.forEach((id) => { if (!S.g.ach[id]) S.g.ach[id] = Date.now(); });
    S.g.lv = Math.max(S.g.lv || 0, s.level);
    store.set(S);
    prev = s;
    renderHUD(s);
    if (!$("#v-quest").hidden) renderQuest(s);
    return s;
  }

  /* ---------- HUD ---------- */
  function renderHUD(s) {
    const pct = Math.min(100, ((s.xp - s.lvFrom) / (s.lvTo - s.lvFrom)) * 100);
    const qd = questDay(); const n = app.dayDone(qd);
    $("#hud").innerHTML = `<div class="wrap hud-in">
      <button class="hud-lv" data-go="quest" aria-label="冒險者：Lv ${s.level} ${s.rank.name}">${I.shield(s.level, s.rank.i)}<span class="hud-name"><b>${s.rank.name}</b><span class="hud-bar"><i style="width:${pct}%"></i></span><span class="hud-xp num">${s.xp - s.lvFrom} / ${s.lvTo - s.lvFrom} XP</span></span></button>
      <div class="hud-stats">
        <span class="hud-chip streak ${s.streak ? "on" : ""}" title="連續學習天數">${I.flame}<b class="num">${s.streak}</b><span class="lbl">天</span></span>
        <span class="hud-chip combo" id="hudCombo" aria-live="polite">${combo >= 2 ? "x" + combo : ""}</span>
        <button class="hud-chip quest" data-go="quest" title="今日任務">${I.crown}<b class="num">${n}/5</b><span class="lbl">DAY ${pad(qd)}</span></button>
      </div></div>`;
  }
  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]");
    if (g) { app.show(g.dataset.go); app.topScroll(); }
  });

  /* ---------- quest board ---------- */
  function ring(n) {
    const c = 2 * Math.PI * 26, off = c * (1 - n / 5);
    return `<svg viewBox="0 0 64 64" class="ring" aria-hidden="true"><circle cx="32" cy="32" r="26" class="rg-bg"/><circle cx="32" cy="32" r="26" class="rg-fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/><text x="32" y="37" text-anchor="middle">${n}/5</text></svg>`;
  }
  function renderQuest(s) {
    s = s || prev || compute();
    const d = app.DAYS[viewDay - 1];
    const wi = app.PHASES.findIndex((p) => d.d >= p.r[0] && d.d <= p.r[1]);
    const n = app.dayDone(d.d);
    const boss = app.isBoss(d);
    const rows = app.dayRows(d);
    const isToday = viewDay === questDay();
    const date = app.dateOf(d.d);
    const pct = Math.min(100, ((s.xp - s.lvFrom) / (s.lvTo - s.lvFrom)) * 100);
    const nextRank = s.rank.next ? `再升到 Lv ${s.rank.next[0]} 成為「${s.rank.next[1]}」` : "已是最高段位";
    const acc = s.ans ? Math.round((s.cor / s.ans) * 100) : 0;
    $("#questBody").innerHTML = `
    <div class="q-grid">
      <div class="quest-card ${boss ? "boss" : ""} ${d.s === 2 ? "s2" : ""} ${n === 5 ? "cleared" : ""}">
        <div class="qc-top"><span class="world-tag">WORLD ${wi + 1} · ${app.WORLDS[wi]}</span>${boss ? `<span class="boss-tag">${I.crown}首領戰</span>` : ""}<span class="qc-day num">DAY ${pad(d.d)}${date ? " · " + date : ""}</span></div>
        <div class="qc-head">${ring(n)}<div><p class="qc-k">${isToday ? "今日任務" : viewDay < questDay() ? "已過關卡" : "預覽關卡"}</p><h2>${app.esc(d.t)}</h2><p class="qc-rw">全部完成可得 <b>${5 * XP.task + XP.chest} XP</b>（任務 5 × ${XP.task} ＋ 寶箱 ${XP.chest}）</p></div></div>
        <ol class="quests">${app.TASKS.map((t) => {
          const done = !!S.tasks[d.d + t[0]];
          return `<li class="qrow ${done ? "done" : ""}"><button class="bub qbub" data-task="${d.d}${t[0]}" aria-pressed="${done}" aria-label="${TASK_NAME[t[0]]} 完成">${t[1]}</button><div class="qtxt"><div class="qname">${TASK_NAME[t[0]]}<span class="xpc">+${XP.task} XP</span></div><div class="qdesc">${rows[t[0]]}</div></div></li>`;
        }).join("")}</ol>
        <div class="chest ${n === 5 ? "open" : ""}">${I.chest}<div><b>${n === 5 ? "寶箱已開啟" : "關卡寶箱"}</b><span>${n === 5 ? `已獲得 ${XP.chest} XP。前往下一關吧！` : `再完成 ${5 - n} 項任務即可開啟（+${XP.chest} XP）`}</span></div>${n === 5 && viewDay < 60 ? `<button class="btn primary" data-qnav="next">下一關 ›</button>` : ""}</div>
        <div class="qc-nav"><button class="btn" data-qnav="prev" ${viewDay <= 1 ? "disabled" : ""}>‹ 前一天</button><button class="btn" data-qnav="today" ${isToday ? "disabled" : ""}>回到今日任務</button><button class="btn" data-qnav="next" ${viewDay >= 60 ? "disabled" : ""}>下一天 ›</button></div>
        ${S.start ? "" : `<div class="qc-start"><label for="qStart">設定開始日期，每天自動帶出當天任務：</label><input type="date" id="qStart"></div>`}
      </div>
      <aside class="q-side">
        <div class="hero-card">
          ${I.shield(s.level, s.rank.i)}
          <div class="hc-txt"><p class="qc-k">冒險者</p><h3>Lv ${s.level}・${s.rank.name}</h3>
          <div class="xpbar"><i style="width:${pct}%"></i></div><p class="hc-sub num">${s.xp - s.lvFrom} / ${s.lvTo - s.lvFrom} XP ・ 總經驗 ${s.xp}</p><p class="hc-sub">${nextRank}</p></div>
        </div>
        <div class="statgrid">
          <div class="st"><span class="k">連續天數</span><b class="num">${s.streak}</b><span class="u">最佳 ${s.best}</span></div>
          <div class="st"><span class="k">通關天數</span><b class="num">${s.fullDays}</b><span class="u">/ 60</span></div>
          <div class="st"><span class="k">題庫作答</span><b class="num">${s.ans}</b><span class="u">正確率 ${acc}%</span></div>
          <div class="st"><span class="k">已會單字</span><b class="num">${s.words}</b><span class="u">/ ${s.totalW}</span></div>
          <div class="st"><span class="k">讀完章節</span><b class="num">${s.gch + s.rch}</b><span class="u">/ 38</span></div>
          <div class="st"><span class="k">最高連擊</span><b class="num">${s.bestCombo}</b><span class="u">題</span></div>
        </div>
        <div class="xp-rules"><b>經驗值怎麼拿</b><span>任務 +${XP.task}・答對 +${XP.correct}・答錯也有 +${XP.wrong}・讀完一章 +${XP.chapter}・學會一個單字 +${XP.word}・開寶箱 +${XP.chest}・成就 +${XP.ach}</span></div>
      </aside>
    </div>
    <div class="ach-head"><h3>成就徽章</h3><span class="num">${s.achList.length} / ${ACH.length}</span></div>
    <div class="ach-grid">${ACH.map((a) => {
      const on = s.achList.includes(a[0]); const [v, m] = a[4](s);
      return `<div class="ach ${on ? "on" : ""}"><span class="ach-ic">${on ? I.star : I.lock}</span><div><b>${a[1]}</b><span>${a[2]}</span>${on ? "" : `<span class="ach-bar"><i style="width:${Math.min(100, (v / m) * 100)}%"></i></span>`}</div></div>`;
    }).join("")}</div>`;
    const qs = $("#qStart");
    if (qs) qs.addEventListener("change", (e) => { S.start = e.target.value; const sd = $("#startDate"); if (sd) sd.value = S.start; viewDay = questDay(); app.renderPlan(); app.renderStrip(); app.save(); });
  }
  $("#questBody").addEventListener("click", (e) => {
    const nv = e.target.closest("[data-qnav]");
    if (nv) {
      const a = nv.dataset.qnav;
      viewDay = a === "today" ? questDay() : Math.min(60, Math.max(1, viewDay + (a === "next" ? 1 : -1)));
      renderQuest(); $("#v-quest").scrollIntoView({ block: "start" }); app.topScroll(); return;
    }
    app.handleDayClick(e);
  });

  /* ---------- sound toggle ---------- */
  const st = $("#soundToggle");
  if (st) {
    const paint = () => { st.setAttribute("aria-pressed", S.g.sound !== false ? "true" : "false"); st.querySelector("span").textContent = S.g.sound !== false ? "開" : "關"; };
    st.addEventListener("click", () => { S.g.sound = S.g.sound === false; paint(); store.set(S); if (S.g.sound) sfx("xp"); });
    paint();
  }

  app.onSave(() => sync(false));
  app.onShow((v) => { if (v === "quest") { renderQuest(); } });
  sync(true); // 開啟時只同步，不跳通知
  if (!$("#v-quest").hidden) renderQuest();
}
