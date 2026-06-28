"""Generate PWA icons (192x192, 512x512, apple-touch-icon, favicon) for the Sadvichar Surgery Records app."""
import os
from PIL import Image, ImageDraw

OUT_DIR = "/home/z/my-project/public"
os.makedirs(OUT_DIR, exist_ok=True)

PRIMARY_BG = (15, 118, 110)        # teal-700 (#0f766e) — primary
PRIMARY_FG = (255, 255, 255)       # white
ACCENT = (251, 191, 36)            # amber-400

def draw_icon(size: int, path: str) -> None:
    img = Image.new("RGB", (size, size), PRIMARY_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = size / 2, size / 2
    arm_w = int(size * 0.16)
    arm_h = int(size * 0.50)
    h_arm_w = int(size * 0.50)
    h_arm_h = int(size * 0.16)
    draw.rectangle(
        [cx - arm_w / 2, cy - arm_h / 2, cx + arm_w / 2, cy + arm_h / 2],
        fill=PRIMARY_FG,
    )
    draw.rectangle(
        [cx - h_arm_w / 2, cy - h_arm_h / 2, cx + h_arm_w / 2, cy + h_arm_h / 2],
        fill=PRIMARY_FG,
    )
    if size >= 192:
        dot_r = int(size * 0.08)
        dot_x = size - int(size * 0.18)
        dot_y = int(size * 0.18)
        draw.ellipse(
            [dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r],
            fill=ACCENT,
        )
    img.save(path, "PNG", optimize=True)
    print(f"Generated {path} ({size}x{size})")

draw_icon(192, os.path.join(OUT_DIR, "icon-192.png"))
draw_icon(512, os.path.join(OUT_DIR, "icon-512.png"))
draw_icon(180, os.path.join(OUT_DIR, "apple-touch-icon.png"))
draw_icon(32, os.path.join(OUT_DIR, "favicon-32.png"))
draw_icon(16, os.path.join(OUT_DIR, "favicon-16.png"))

def draw_maskable(size: int, path: str) -> None:
    img = Image.new("RGB", (size, size), PRIMARY_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = size / 2, size / 2
    arm_w = int(size * 0.12)
    arm_h = int(size * 0.38)
    h_arm_w = int(size * 0.38)
    h_arm_h = int(size * 0.12)
    draw.rectangle(
        [cx - arm_w / 2, cy - arm_h / 2, cx + arm_w / 2, cy + arm_h / 2],
        fill=PRIMARY_FG,
    )
    draw.rectangle(
        [cx - h_arm_w / 2, cy - h_arm_h / 2, cx + h_arm_w / 2, cy + h_arm_h / 2],
        fill=PRIMARY_FG,
    )
    img.save(path, "PNG", optimize=True)
    print(f"Generated {path} ({size}x{size}, maskable)")

draw_maskable(512, os.path.join(OUT_DIR, "icon-512-maskable.png"))
draw_maskable(192, os.path.join(OUT_DIR, "icon-192-maskable.png"))

ico = Image.new("RGB", (32, 32), PRIMARY_BG)
d = ImageDraw.Draw(ico)
cx, cy = 16, 16
d.rectangle([cx - 3, cy - 9, cx + 3, cy + 9], fill=PRIMARY_FG)
d.rectangle([cx - 9, cy - 3, cx + 9, cy + 3], fill=PRIMARY_FG)
ico.save(os.path.join(OUT_DIR, "favicon.ico"), format="ICO", sizes=[(32, 32)])
print("Generated favicon.ico")

print("\nAll icons generated successfully.")
