"""Prepare a photograph or a scanned PDF page for local OCR. No network calls."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def enhance(src: Path, dest: Path) -> None:
    from PIL import Image, ImageEnhance, ImageOps

    with Image.open(src) as img:
        rgb = ImageOps.autocontrast(img.convert("RGB"), cutoff=1)
        width, height = rgb.size
        longest = max(width, height, 1)
        if longest > 2000:
            scale = 2000 / longest
        elif longest < 1200:
            scale = min(3.0, 1600 / longest)
        else:
            scale = 1.0
        if scale != 1.0:
            rgb = rgb.resize((max(1, int(width * scale)), max(1, int(height * scale))), Image.Resampling.LANCZOS)
        rgb = ImageEnhance.Contrast(rgb).enhance(1.4)
        rgb.save(dest, format="PNG")


def render_pdf(src: Path, dest: Path) -> str:
    try:
        import pypdfium2 as pdfium
    except ImportError:
        return "renderer_missing"
    pdf = pdfium.PdfDocument(str(src))
    try:
        if len(pdf) < 1:
            return "empty"
        bitmap = pdf[0].render(scale=2)
        image = bitmap.to_pil().convert("RGB")
        image.save(dest, format="PNG")
        return "rendered"
    finally:
        pdf.close()


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        src = Path(payload["source"])
        dest = Path(payload["dest"])
        kind = payload.get("kind")
        if kind == "image":
            enhance(src, dest)
            json.dump({"ok": True, "status": "enhanced"}, sys.stdout)
            return
        if kind == "pdf":
            status = render_pdf(src, dest)
            json.dump({"ok": status == "rendered", "status": status}, sys.stdout)
            return
        json.dump({"ok": False, "status": "unsupported"}, sys.stdout)
    except Exception as error:
        json.dump({"ok": False, "status": "failed", "error": str(error)[:180]}, sys.stdout)


if __name__ == "__main__":
    main()
