// 把 dist-artifact/ 的 HTML、CSS、JS 合併成一個檔案：dist-artifact/toeic-990.html
// （claude.ai 分享頁的格式：不含 <html>/<head>/<body> 外框）
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "dist-artifact";
let html = readFileSync(join(dir, "index.html"), "utf8");
const css = [], js = [];
html = html.replace(/<link rel="stylesheet"[^>]*href="\.?\/?(assets\/[^"]+\.css)"[^>]*>/g, (_, f) => { css.push(readFileSync(join(dir, f), "utf8")); return ""; });
html = html.replace(/<script type="module"[^>]*src="\.?\/?(assets\/[^"]+\.js)"[^>]*><\/script>/g, (_, f) => { js.push(readFileSync(join(dir, f), "utf8").replace(/<\/script/gi, "<\\/script")); return ""; });
html = html.replace(/<link rel="modulepreload"[^>]*>/g, "");

const head = html.slice(html.indexOf("<head>") + 6, html.indexOf("</head>"));
const body = html.slice(html.indexOf("<body>") + 6, html.indexOf("</body>"));
const keep = head.split("\n").filter((l) => /<title>|fonts\.googleapis|fonts\.gstatic/.test(l)).join("\n");
const out = `${keep}\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n${css.join("\n")}\n</style>\n${body.trim()}\n<script type="module">\n${js.join("\n")}\n</script>\n`;
writeFileSync(join(dir, "toeic-990.html"), out);
console.log("wrote", join(dir, "toeic-990.html"), (out.length / 1024).toFixed(0) + " KB");
