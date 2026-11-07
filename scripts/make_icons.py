"""產生 App 圖示與啟動畫面（答案卡泡泡造型）。需要 Pillow：pip install pillow
輸出：public/ 的網頁圖示；若已執行過 npx cap add ios，也會覆蓋 iOS 的 App 圖示與啟動畫面。"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ACCENT, GRAPHITE, WHITE, PAPER = (224, 51, 90), (32, 36, 47), (255, 255, 255), (246, 248, 252)

def icon(size=1024, inset=0.16, bg=ACCENT):
    S = 4  # 超取樣讓邊緣平滑
    W = size * S
    im = Image.new("RGB", (W, W), bg)
    d = ImageDraw.Draw(im)
    pad = int(W * inset)
    d.rounded_rectangle([pad, pad, W - pad, W - pad], radius=int(W * 0.09), fill=WHITE)
    inner = W - 2 * pad
    cols, rows, filled = 4, 3, {(0, 1), (1, 3), (2, 0)}
    cell = inner / (cols + 0.6)
    r = cell * 0.36
    x0 = pad + (inner - cell * cols) / 2 + cell / 2
    y0 = pad + (inner - cell * rows) / 2 + cell / 2
    for row in range(rows):
        for col in range(cols):
            cx, cy = x0 + col * cell, y0 + row * cell
            box = [cx - r, cy - r, cx + r, cy + r]
            if (row, col) in filled:
                d.ellipse(box, fill=GRAPHITE)
            else:
                d.ellipse(box, outline=ACCENT, width=max(2, int(r * 0.22)))
    return im.resize((size, size), Image.LANCZOS)

def splash(size=2732):
    im = Image.new("RGB", (size, size), PAPER)
    ic = icon(560)
    mask = Image.new("L", (560, 560), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, 559, 559], radius=124, fill=255)
    im.paste(ic, ((size - 560) // 2, (size - 560) // 2), mask)
    return im

def save(im, rel):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, optimize=True)
    print("wrote", rel)

big = icon(1024)
save(big.resize((512, 512), Image.LANCZOS), "public/icons/icon-512.png")
save(big.resize((192, 192), Image.LANCZOS), "public/icons/icon-192.png")
save(big.resize((180, 180), Image.LANCZOS), "public/apple-touch-icon.png")
save(icon(512, inset=0.22), "public/icons/icon-maskable-512.png")

ios_icon = os.path.join(ROOT, "ios/App/App/Assets.xcassets/AppIcon.appiconset")
if os.path.isdir(ios_icon):
    for f in os.listdir(ios_icon):
        if f.endswith(".png"):
            save(big, os.path.relpath(os.path.join(ios_icon, f), ROOT))
ios_splash = os.path.join(ROOT, "ios/App/App/Assets.xcassets/Splash.imageset")
if os.path.isdir(ios_splash):
    sp = splash()
    for f in os.listdir(ios_splash):
        if f.endswith(".png"):
            save(sp, os.path.relpath(os.path.join(ios_splash, f), ROOT))
