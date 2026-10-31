"""
ConceptLens 2.0 — Python Fast Microservice for CV & Graph Analytics
Provides high-performance Pillow/NumPy blur analysis and NetworkX invariant validation.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from PIL import Image

from schemas import LinkedListGraph, ValidationResult
from graph_engine import validate_graph_invariants
from ocr_preprocessor import calculate_laplacian_variance

app = FastAPI(
    title="ConceptLens 2.0 CV & Graph Microservice",
    description="Python backend service for Gate 02 (Blur/Quality) and Gate 05 (NetworkX Invariants)",
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
        "features": ["Pillow Laplacian Blur Detection", "NetworkX Graph Invariants", "Pydantic v2 Contracts"]
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
