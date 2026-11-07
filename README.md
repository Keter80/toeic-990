# 多益 990 冒險（跨平台版）

60 天從零到多益 990 的學習程式，用打遊戲解任務的方式進行：60 天課表、文法 26 章、閱讀 12 章、457 題原創題庫、700 個單字。

## 遊戲系統

| 元素 | 說明 |
|---|---|
| 今日任務 | 每天 5 項任務（單字、文法／閱讀課、聽力、閱讀、複盤），每項 +20 XP，全部完成開寶箱 +100 XP |
| 冒險地圖 | 60 天分成 8 個世界：文法森林 → 動詞峽谷 → 子句迷宮 → 八百試煉塔 → 精準神殿 → 同義之海 → 模考競技場 → 滿分王座 |
| 首領戰 | 模考、診斷、總驗收那幾天標成首領關卡（皇冠） |
| 等級與段位 | 新手村見習生 → 青銅冒險者 → 白銀戰士 → 黃金騎士 → 白金法師 → 鑽石勇者 → 傳說・990 |
| 經驗值 | 任務 +20、答對 +10、答錯 +3、讀完一章 +30、學會一個單字 +5、寶箱 +100、成就 +50 |
| 連續天數、連擊 | 每天有學習就累積連續天數；題庫連續答對會出現連擊 |
| 成就徽章 | 20 個成就，例如十連擊、神射手、文法大師、三篇征服者 |
| 音效、震動 | 答題與升級有音效（「更多」裡可關閉）；iOS App 版另有觸覺回饋 |

經驗值是從學習紀錄計算出來的：取消勾選會扣回，不會重複加分。
同一份程式碼可以變成三種形式：

| 形式 | 適合 | 需要什麼 |
|---|---|---|
| **網頁版** | 電腦、任何手機的瀏覽器 | 一個網址（例如免費的 GitHub Pages） |
| **iPhone 主畫面版（PWA）** | 想在 iPhone 上像 App 一樣用，最快 | 網頁版網址 + Safari「加入主畫面」，可離線 |
| **iOS App（Capacitor）** | 上架 App Store / TestFlight 給學員下載 | Mac + Xcode；上架需 Apple Developer Program（每年 US$99） |

Android App 也能用同一套程式碼產生（見最後一節）。

---

## 1. 資料夾結構

```
toeic-app/
├─ index.html              頁面骨架（分頁、底部分頁列、更多選單）
├─ src/
│  ├─ main.js              啟動：讀取進度 → 啟動 App → 註冊離線功能
│  ├─ app.js               主程式：課表、文法、閱讀、題庫、單字、攻略
│  ├─ mobile.js            手機「更多」選單、備份與還原
│  ├─ game.js              遊戲系統：經驗值、等級、成就、寶箱、連擊、音效
│  ├─ game.css             遊戲風格主題（明亮／深色）
│  ├─ storage.js           進度儲存（網頁用 localStorage；App 版另存原生 Preferences）
│  ├─ styles.css           主要樣式（明亮／深色主題）
│  ├─ mobile.css           手機樣式（底部分頁列、安全區域、觸控尺寸）
│  └─ data/
│     ├─ bank.json         題庫：Part 5（154 題）、Part 6（20 篇）、Part 7（60 組）
│     └─ vocab990.json     990 進階 200 字
├─ public/                 App 圖示（apple-touch-icon、PWA 圖示）
├─ ios/                    Xcode 專案（Capacitor 產生，用 Mac 打開）
├─ scripts/make_icons.py   重新產生圖示與啟動畫面
├─ vite.config.js          建置與 PWA（離線、主畫面）設定
├─ capacitor.config.json   App 名稱、Bundle ID 等設定
└─ .github/workflows/deploy-pages.yml   推上 GitHub 後自動發布網頁版
```

> 文法、閱讀章節、課表與核心 500 字的內容在 `src/app.js` 裡（搜尋 `const G=`、`const RC=`、`const DAYS=`、`const VRAW=`）。

---

## 2. 在電腦上執行（開發模式）

1. 安裝 **Node.js 22 LTS**：https://nodejs.org
2. 在這個資料夾開啟終端機（Windows：在資料夾空白處按右鍵 →「在終端機中開啟」），執行：

```bash
npm install      # 第一次才需要，會下載套件到 node_modules
npm run dev      # 啟動開發伺服器
```

3. 電腦瀏覽器打開畫面上顯示的 `http://localhost:5173`。
4. **用 iPhone 預覽**：手機和電腦連同一個 Wi-Fi，在 iPhone Safari 輸入終端機顯示的 `Network: http://192.168.x.x:5173`。

改程式存檔後，畫面會自動更新。

---

## 3. 發布網頁版，讓 iPhone 加入主畫面（最快）

iPhone 的「加入主畫面」與離線功能需要 **https 網址**。最簡單的免費作法是 GitHub Pages：

1. 到 GitHub 建立新的 repository（例如 `toeic-990`），把這個資料夾的內容上傳（`node_modules`、`dist` 不用傳，`.gitignore` 已排除）。
2. 在 repository 的 **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**。
3. 推到 `main` 分支後，`.github/workflows/deploy-pages.yml` 會自動建置並發布，網址是
   `https://<你的帳號>.github.io/toeic-990/`。

**iPhone 安裝方式（給學員）：**
1. 用 **Safari** 打開網址。
2. 點下方「分享」按鈕 → 「加入主畫面」→「新增」。
3. 主畫面會出現「多益990」圖示，打開後是全螢幕，沒有網路也能使用（第一次需連網載入）。

> 其他免費選擇：Netlify、Cloudflare Pages、Vercel。執行 `npm run build` 後，把 `dist` 資料夾上傳即可。

---

## 4. 做成 iOS App（Capacitor）

### 需要
- 一台 **Mac**，安裝 **Xcode 16 以上**（App Store 免費下載）
- Node.js 22 LTS
- 只裝到自己的 iPhone：免費 Apple ID 即可（每 7 天要重新安裝一次）
- 發給學員（TestFlight）或上架 App Store：**Apple Developer Program**（每年 US$99）

### 步驟
```bash
npm install
npm run ios        # = 建置網頁 → 同步到 ios/ → 打開 Xcode
```
在 Xcode 裡：
1. 左側點 **App** 專案 → **Signing & Capabilities** → **Team** 選你的 Apple ID。
2. 如果顯示 Bundle Identifier 已被使用，把 `com.toeic990.app` 改成你自己的（例如 `com.你的名字.toeic990`），並同步修改 `capacitor.config.json` 的 `appId`。
3. iPhone 用線接上 Mac（第一次需在 iPhone 開啟「開發者模式」：設定 → 隱私權與安全性 → 開發者模式），上方選你的 iPhone，按 ▶︎ 執行。

### 上架 / TestFlight
Xcode 選單 **Product → Archive** → **Distribute App** → **App Store Connect**，上傳後到 App Store Connect 開 TestFlight 測試，或送審上架。

### 沒有 Mac 怎麼辦
- 先用第 3 節的 **主畫面版**，iPhone 上的體驗和 App 很接近，而且免費。
- 需要 App Store 版本時，可以用雲端 Mac 建置服務（例如 Codemagic、GitHub Actions 的 macOS 機器）搭配 Apple Developer 帳號簽章，或借一台 Mac 做上傳那一步。

### 每次改了程式之後
```bash
npm run ios:sync   # 重新建置並把新版網頁同步進 iOS 專案
```
然後在 Xcode 重新執行。

---

## 5. 進度保存與備份

- **網頁版／主畫面版**：存在瀏覽器裡（並請求「持久保存」）。在 Safari 清除網站資料會清掉進度。
- **App 版**：另外存在 iOS 原生儲存區，比較不會被清除。
- **換裝置**：點「更多 → 備份與還原」→「複製備份碼」，到新裝置貼上後按「從備份碼還原」。網頁版也可以下載備份檔。

---

## 6. 常用指令

| 指令 | 作用 |
|---|---|
| `npm run dev` | 開發模式（同 Wi-Fi 的手機也能開） |
| `npm run build` | 產生正式版到 `dist/` |
| `npm run preview` | 在本機預覽正式版（可測試離線功能） |
| `npm run ios` | 建置並用 Xcode 打開 iOS 專案（Mac） |
| `npm run ios:sync` | 只同步，不打開 Xcode |
| `npm run build:artifact` | 產生單一 HTML 檔（`dist-artifact/toeic-990.html`），可直接分享或放到任何網站 |
| `npm run icons` | 重新產生圖示與啟動畫面（需要 Python 與 `pip install pillow`） |

---

## 7. 之後要做 Android 版

```bash
npm install --save-exact @capacitor/android@8.6.0
npx cap add android
npm run android    # 需要安裝 Android Studio
```

---

## 版本
- 前端：原生 JavaScript + Vite 8.3.5
- 離線／主畫面：vite-plugin-pwa 2.0.0
- 原生殼：Capacitor 8.6.0（iOS 使用 Swift Package Manager，不需要 CocoaPods）；觸覺回饋 @capacitor/haptics 8.0.2
- 題庫為原創練習題，非 ETS 官方試題；完整模考請搭配 ETS 官方試題本。
