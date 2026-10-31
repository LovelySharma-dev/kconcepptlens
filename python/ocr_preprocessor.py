"""
ConceptLens 2.0 — Image Quality & OCR Preprocessor
Gate 02: Blur detection, contrast enhancement, and bounding box cropping using Pillow and NumPy.
"""

import sys
import json
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
from PIL import Image, ImageEnhance, ImageOps
import numpy as np

def calculate_laplacian_variance(image: Image.Image) -> float:
    """
    Computes the focus measure / blur score using the variance of the 2D Laplacian.
    Higher values (>100.0) indicate sharp, readable diagrams;
    Lower values (<80.0) flag blurry, out-of-focus camera scans.
    """
    # Convert to grayscale
    gray = image.convert('L')
    arr = np.array(gray, dtype=np.float64)

    if arr.shape[0] < 3 or arr.shape[1] < 3:
        return 0.0

    # 3x3 Discrete Laplacian Kernel
    #  0  1  0
    #  1 -4  1
    #  0  1  0
    kernel = np.array([
        [0,  1, 0],
        [1, -4, 1],
        [0,  1, 0]
    ], dtype=np.float64)

    # 2D Convolution via NumPy sliding window / slices
    pad = 1
    padded = np.pad(arr, pad, mode='edge')
    
    # Vectorized 3x3 convolution
    laplacian = (
        kernel[0, 0] * padded[:-2, :-2] + kernel[0, 1] * padded[:-2, 1:-1] + kernel[0, 2] * padded[:-2, 2:] +
        kernel[1, 0] * padded[1:-1, :-2] + kernel[1, 1] * padded[1:-1, 1:-1] + kernel[1, 2] * padded[1:-1, 2:] +
        kernel[2, 0] * padded[2:, :-2] + kernel[2, 1] * padded[2:, 1:-1] + kernel[2, 2] * padded[2:, 2:]
    )

    variance = float(np.var(laplacian))
    return variance

def check_image_readability(
    image_path: str,
    blur_threshold: float = 80.0
) -> Dict[str, Any]:
    """
    Evaluates whether an uploaded study diagram is clear enough for OCR interpretation.
    """
    path = Path(image_path)
    if not path.exists():
        return {
            "readable": False,
            "error": f"File not found: {image_path}",
            "blur_score": 0.0
        }

    try:
        with Image.open(path) as img:
            width, height = img.size
            blur_score = calculate_laplacian_variance(img)
            is_sharp = blur_score >= blur_threshold

            return {
                "readable": is_sharp,
                "blur_score": round(blur_score, 2),
                "threshold": blur_threshold,
                "dimensions": {"width": width, "height": height},
                "status": "PASS" if is_sharp else "BLURRY_SCAN_DETECTED",
                "recommendation": (
                    "Image is sharp and readable."
                    if is_sharp
                    else "Image appears blurry or low-contrast. Please upload a clearer scan or crop tighter."
                )
            }
    except Exception as e:
        return {
            "readable": False,
            "error": str(e),
            "blur_score": 0.0
        }

def enhance_diagram_scan(
    image_path: str,
    output_path: Optional[str] = None,
    contrast_factor: float = 1.4,
    sharpness_factor: float = 1.6
) -> str:
    """
    Enhances contrast and ink sharpness for smartphone photos of handwritten notebooks.
    """
    input_path = Path(image_path)
    out_path = Path(output_path) if output_path else input_path.with_name(f"{input_path.stem}_enhanced.png")

    with Image.open(input_path) as img:
        # 1. Auto-contrast
        enhanced = ImageOps.autocontrast(img.convert('RGB'), cutoff=1)
        # 2. Boost contrast
        enhanced = ImageEnhance.Contrast(enhanced).enhance(contrast_factor)
        # 3. Boost sharpness
        enhanced = ImageEnhance.Sharpness(enhanced).enhance(sharpness_factor)
        
        enhanced.save(out_path, format="PNG")
        return str(out_path)

def crop_diagram_region(
    image_path: str,
    crop_box: Tuple[int, int, int, int],  # (x, y, width, height)
    output_path: Optional[str] = None
) -> str:
    """
    Extracts the diagram bounding box from a full exam paper page.
    """
    x, y, w, h = crop_box
    input_path = Path(image_path)
    out_path = Path(output_path) if output_path else input_path.with_name(f"{input_path.stem}_crop.png")

    with Image.open(input_path) as img:
        cropped = img.crop((x, y, x + w, y + h))
        cropped.save(out_path, format="PNG")
        return str(out_path)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        img_arg = sys.argv[1]
        res = check_image_readability(img_arg)
        print(json.dumps(res, indent=2))
    else:
        print("Usage: python ocr_preprocessor.py <image_path>")
