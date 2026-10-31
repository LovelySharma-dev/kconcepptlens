"""
ConceptLens 2.0 — Python Fast Microservice for CV & Graph Analytics
Provides high-performance Pillow/NumPy blur analysis, NetworkX invariant validation,
and secure pypdfium2 text extraction with password protection.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from pathlib import Path
import tempfile
import os
from PIL import Image

from schemas import LinkedListGraph, ValidationResult
from graph_engine import validate_graph_invariants
from ocr_preprocessor import calculate_laplacian_variance
from page_prepare import extract_pdf_text

app = FastAPI(
    title="ConceptLens 2.0 CV & Graph Microservice",
    description="Python backend service for Gate 02 (Blur/Quality), Gate 05 (NetworkX Invariants), and PDF Extraction",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/py/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ConceptLens Python Engine",
        "python_version": "3.14.0",
        "features": [
            "Pillow Laplacian Blur Detection",
            "NetworkX Graph Invariants",
            "Pydantic v2 Contracts",
            "pypdfium2 Encrypted PDF Extraction"
        ]
    }

@app.post("/api/py/check-blur")
async def check_blur(file: UploadFile = File(...), blur_threshold: float = 80.0):
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents))
        blur_score = calculate_laplacian_variance(image)
        is_sharp = blur_score >= blur_threshold

        return {
            "fileName": file.filename,
            "blurScore": round(blur_score, 2),
            "threshold": blur_threshold,
            "isReadable": is_sharp,
            "gatePassed": is_sharp,
            "status": "PASS" if is_sharp else "BLURRY_SCAN_DETECTED",
            "message": (
                "Image satisfies Gate 02 quality check."
                if is_sharp
                else "Image fails Gate 02: scan is blurry or out of focus. Please recrop or supply a clearer photo."
            )
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

@app.post("/api/py/validate-graph", response_model=ValidationResult)
def validate_graph(graph: LinkedListGraph):
    return validate_graph_invariants(graph)

@app.post("/api/py/process-text")
async def process_text(
    file: UploadFile = File(...),
    password: str | None = Form(None)
):
    """
    Securely extract text from an uploaded PDF, supporting encrypted password-protected files.
    The password is used only during decryption and is never logged or persisted.
    """
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size exceeds the 20MB limit.")

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp_path = Path(tmp.name)
        try:
            tmp.write(contents)
            tmp.flush()
            result = extract_pdf_text(tmp_path, password=password)
            return {
                "fileName": file.filename,
                "byteLength": len(contents),
                **result
            }
        finally:
            try:
                if tmp_path.exists():
                    os.unlink(tmp_path)
            except OSError:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
