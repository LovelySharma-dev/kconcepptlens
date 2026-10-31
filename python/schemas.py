from typing import List, Optional, Union, Dict, Any, Literal
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class LinkedListNode(BaseModel):
    id: str = Field(..., min_length=1, description="Unique node identifier")
    value: Union[str, int, float] = Field(..., description="Data stored in node")
    next: Optional[str] = Field(None, description="ID of successor node or None/null")
    x: float = 0.0
    y: float = 0.0
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    sourceLabelCoordinates: Optional[BoundingBox] = None

class LinkedListGraph(BaseModel):
    headId: Optional[str] = None
    nodes: List[LinkedListNode] = Field(default_factory=list)
    isCircular: bool = False

class ValidationIssue(BaseModel):
    gate: Literal[
        'GATE_01_FORMAT',
        'GATE_02_QUALITY',
        'GATE_03_OCR',
        'GATE_04_AST',
        'GATE_05_INVARIANTS',
        'GATE_06_HUMAN_REVIEW'
    ]
    severity: Literal['error', 'warning']
    nodeId: Optional[str] = None
    field: Optional[str] = None
    message: str
    suggestedFix: Optional[str] = None

class ValidationResult(BaseModel):
    isValid: bool
    needsHumanReview: bool = False
    issues: List[ValidationIssue] = Field(default_factory=list)
    floydCycleDetected: bool = False
    orphanNodeIds: List[str] = Field(default_factory=list)
    cycleNodes: List[str] = Field(default_factory=list)

class ExecutionStep(BaseModel):
    stepIndex: int
    totalSteps: int
    operation: str
    description: str
    codeSnippet: str
    activePointers: Dict[str, Optional[str]]
    highlightedNodeIds: List[str]
    mutatedNodeId: Optional[str] = None
    currentGraph: LinkedListGraph
    screenReaderAnnouncement: str
