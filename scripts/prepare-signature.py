"""Turn a photo/scan of a signature into public/signature.png: ink only, transparent paper.

usage:  python scripts/prepare-signature.py path/to/signature.jpg
then set `signature: "/signature.png"` in src/lib/content.ts
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

INK = (29, 42, 90)  # blue-black fountain-pen ink, matches the site's signature colour

src = Path(sys.argv[1])
img = Image.open(src).convert("L")
# small screenshots get enlarged first so the strokes stay smooth on large screens
if img.width < 900:
    scale = 900 / img.width
    img = img.resize((900, round(img.height * scale)), Image.LANCZOS)
gray = np.asarray(img, dtype=np.float32)

# paper = bright median, ink = darkest pixels; everything between fades smoothly
paper = np.percentile(gray, 60)
ink = np.percentile(gray, 0.5)
alpha = np.clip((paper - 18 - gray) / max(paper - 18 - ink, 1), 0, 1)
alpha[alpha < 0.12] = 0  # drop faint ruled lines and paper texture
alpha = (alpha ** 0.8 * 255).astype(np.uint8)

ys, xs = np.nonzero(alpha)
if len(xs) == 0:
    sys.exit("No ink found. Try a photo with more contrast.")
pad = 12
y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, alpha.shape[0])
x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, alpha.shape[1])

rgba = np.zeros((y1 - y0, x1 - x0, 4), dtype=np.uint8)
rgba[..., :3] = INK
rgba[..., 3] = alpha[y0:y1, x0:x1]

out = Path(__file__).resolve().parent.parent / "public" / "signature.png"
Image.fromarray(rgba, "RGBA").save(out, optimize=True)
print(f"saved {out} ({x1 - x0}x{y1 - y0})")
