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


def normalize_pdf_text(raw: str) -> str:
    text = raw.replace("\u0002", "-").replace("\x00", "")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [" ".join(line.split()) for line in text.split("\n")]
    collapsed = "\n".join(lines)
    while "\n\n\n" in collapsed:
        collapsed = collapsed.replace("\n\n\n", "\n\n")
    return collapsed.strip()


def extract_pdf_text(src: Path, password: str | None = None) -> dict:
    try:
        import pypdfium2 as pdfium
    except ImportError:
        return {"ok": False, "status": "renderer_missing", "text": "", "error": "pypdfium2 is not installed"}
    try:
        pdf = pdfium.PdfDocument(str(src), password=password)
    except Exception as error:
        err_code = getattr(error, "err_code", None)
        message = str(error).lower()
        if err_code == 4 or "password" in message:
            if not password:
                return {
                    "ok": False,
                    "status": "password_required",
                    "text": "",
                    "error": "This PDF is encrypted. A password is required to unlock it."
                }
            return {
                "ok": False,
                "status": "incorrect_password",
                "text": "",
                "error": "The password supplied was incorrect for this document."
            }
        if err_code == 5 or "security" in message or "encryption" in message:
            return {
                "ok": False,
                "status": "unsupported_encryption",
                "text": "",
                "error": "This PDF uses an unsupported encryption algorithm or security handler."
            }
        if err_code == 3 or "format" in message:
            return {
                "ok": False,
                "status": "malformed",
                "text": "",
                "error": "The PDF file structure is damaged or malformed."
            }
        return {"ok": False, "status": "failed", "text": "", "error": "PDF processing could not open the document."}
    try:
        parts: list[str] = []
        for index in range(len(pdf)):
            page = pdf[index]
            text_page = page.get_textpage()
            try:
                text = text_page.get_text_bounded() or ""
            finally:
                text_page.close()
            cleaned = normalize_pdf_text(text)
            if cleaned:
                parts.append(cleaned)
        joined = "\n\n".join(parts).strip()
        limited = joined[:20000]
        return {
            "ok": bool(limited),
            "status": "extracted" if limited else "empty",
            "text": limited,
            "truncated": len(joined) > 20000,
            "pages": len(pdf),
            "note": "Text extracted successfully" if limited else "This PDF has no extractable text layer. An OCR scan is required."
        }
    finally:
        pdf.close()


def render_pdf(src: Path, dest: Path, password: str | None = None) -> str:
    try:
        import pypdfium2 as pdfium
    except ImportError:
        return "renderer_missing"
    try:
        pdf = pdfium.PdfDocument(str(src), password=password)
    except Exception as error:
        err_code = getattr(error, "err_code", None)
        message = str(error).lower()
        if err_code == 4 or "password" in message:
            return "password_required" if not password else "incorrect_password"
        if err_code == 5 or "security" in message or "encryption" in message:
            return "unsupported_encryption"
        if err_code == 3 or "format" in message:
            return "malformed"
        return "failed"
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
        password = payload.get("password")
        if not isinstance(password, str) or not password:
            password = None
        if kind == "image":
            enhance(src, dest)
            json.dump({"ok": True, "status": "enhanced"}, sys.stdout)
            return
        if kind == "pdf":
            status = render_pdf(src, dest, password=password)
            json.dump({"ok": status == "rendered", "status": status}, sys.stdout)
            return
        if kind == "text":
            json.dump(extract_pdf_text(src, password=password), sys.stdout)
            return
        json.dump({"ok": False, "status": "unsupported"}, sys.stdout)
    except Exception as error:
        json.dump({"ok": False, "status": "failed", "error": str(error)[:180]}, sys.stdout)


if __name__ == "__main__":
    main()
