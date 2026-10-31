import { Router, Request, Response } from 'express';
import {
  MATERIAL_SOURCE_KINDS,
  MaterialExplainRequestSchema,
  MaterialIngestRequestSchema,
  SAMPLE_MATERIALS,
  adjustStrategyWeights,
  applyOcrReading,
  buildMaterialExplanation,
  defaultStrategyWeights,
  gradePracticeSubmission,
  ingestPrepared,
  isReadablePdfText,
  parseExternalExplanation,
  verifiedLinearSolution,
  publicEngineStatus,
  redactSecrets,
  type MaterialExplanation,
  type MaterialSourceKind,
  type StrategyWeights
} from '@conceptlens/shared';
import { isCloudinaryConfigured } from '../config/cloudinary';
import { ocrEngineStatus, readPage, readPdfTextLayer } from '../services/pageOcr';
import { runPythonEngine } from '../services/pythonEngine';

const router = Router();

function secretValues(): string[] {
  return [process.env.CLOUDINARY_API_SECRET, process.env.CLOUDINARY_API_KEY, process.env.GEMINI_API_KEY]
    .map((value) => value?.trim() ?? '')
    .filter((value) => value.length >= 8 && !value.includes('your_'));
}

function decodeBase64File(payload: string): Uint8Array | null {
  const trimmed = payload.trim();
  const comma = trimmed.indexOf(',');
  const data = trimmed.startsWith('data:') && comma >= 0 ? trimmed.slice(comma + 1) : trimmed;
  const clean = data.replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(clean) || clean.length % 4 !== 0) return null;
  const buffer = Buffer.from(clean, 'base64');
  return buffer.length > 0 ? new Uint8Array(buffer) : null;
}

function isWeights(value: unknown): value is StrategyWeights {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return ['plain', 'steps', 'example', 'challenge'].every((key) => typeof row[key] === 'number' && Number.isFinite(row[key] as number));
}

function withPythonCheck(explanation: MaterialExplanation): MaterialExplanation {
  const solved = explanation.verified.find((item) => item.startsWith('x = '));
  if (!solved) return explanation;
  const solution = verifiedLinearSolution(solved);
  if (!solution) return explanation;
  const python = runPythonEngine({ command: 'solve', text: explanation.sourceContent });
  if (!python.ok || python.data.solution == null) return explanation;
  if (python.data.solution === solution && python.data.codeExecuted === false) {
    const next = {
      ...explanation,
      verified: [...explanation.verified, 'The local Python engine agreed with the substituted result.']
    };
    const parsed = parseExternalExplanation(next);
    return parsed.ok ? parsed.data : explanation;
  }
  const next = {
    ...explanation,
    verified: explanation.verified.filter((item) => !item.startsWith('x = ')),
    steps: explanation.steps.map((step) => ({ ...step, verified: false })),
    uncertaintyNotes: [
      ...explanation.uncertaintyNotes,
      'The Python check did not match the substituted result, so that result is not marked verified.'
    ]
  };
  const parsed = parseExternalExplanation(next);
  return parsed.ok ? parsed.data : explanation;
}

router.get('/samples', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: SAMPLE_MATERIALS.map((sample) => ({
      id: sample.id,
      label: sample.label,
      subject: sample.subject,
      demo: true,
      linkedLessonId: sample.linkedLessonId
    }))
  });
});

router.get('/engine', async (_req: Request, res: Response) => {
  const python = runPythonEngine({ command: 'status' });
  const ocr = await ocrEngineStatus();
  const status = publicEngineStatus({
    pythonAvailable: python.ok,
    cloudinaryConfigured: isCloudinaryConfigured(),
    accountReachable: null,
    ocrReady: ocr.ready
  });
  res.json({
    success: true,
    data: {
      ...status,
      ocrNote: ocr.note,
      python: python.ok ? 'available' : 'unavailable',
      pythonDetail: python.ok ? 'Local evidence engine responded.' : redactSecrets(python.error, secretValues())
    }
  });
});

router.delete('/progress', (_req: Request, res: Response) => {
  const python = runPythonEngine({ command: 'reset' });
  res.json({
    success: true,
    data: {
      cleared: true,
      pythonCleared: python.ok,
      note: 'Saved answer weights can be cleared. This does not delete a Cloudinary asset.'
    }
  });
});

router.post('/ingest', async (req: Request, res: Response) => {
  const parsed = MaterialIngestRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      processed: false,
      error: 'The upload could not be read. Check the file type and try again.',
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    });
  }
  const body = parsed.data;
  let bytes: Uint8Array | undefined;
  if (body.kind === 'file') {
    if (!body.fileBase64) {
      return res.status(400).json({ success: false, processed: false, error: 'Choose a file before uploading.' });
    }
    const decoded = decodeBase64File(body.fileBase64);
    if (!decoded) {
      return res.status(400).json({ success: false, processed: false, error: 'The file data was malformed. Nothing was processed.' });
    }
    bytes = decoded;
  }
  let result = ingestPrepared({
    kind: body.kind,
    text: body.text,
    bytes,
    declaredMime: body.declaredMime,
    sampleId: body.sampleId,
    password: body.password
  });
  if (bytes && result.format === 'pdf') {
    const recovered = readPdfTextLayer(bytes, body.password);
    if (!recovered.ok && (recovered.status === 'password' || recovered.status === 'password_required')) {
      result = {
        ...result,
        accepted: true,
        httpStatus: 200,
        error: null,
        processed: false,
        extractionStatus: 'password_required',
        text: '',
        note: 'This PDF is password-protected. Enter the document password to unlock and extract its text.'
      };
    } else if (!recovered.ok && recovered.status === 'incorrect_password') {
      result = {
        ...result,
        accepted: true,
        httpStatus: 200,
        error: null,
        processed: false,
        extractionStatus: 'incorrect_password',
        text: '',
        note: 'The password entered was incorrect for this document. Please try again.'
      };
    } else if (!recovered.ok && recovered.status === 'unsupported_encryption') {
      result = {
        ...result,
        accepted: false,
        httpStatus: 400,
        error: 'This PDF uses an unsupported encryption algorithm or security handler.',
        processed: false,
        extractionStatus: 'unsupported_encryption',
        text: '',
        note: 'This PDF uses an unsupported encryption algorithm or security handler.'
      };
    } else if (!recovered.ok && recovered.status === 'empty') {
      result = {
        ...result,
        accepted: true,
        httpStatus: 200,
        error: null,
        processed: false,
        extractionStatus: 'empty',
        text: '',
        note: 'This PDF has no extractable text layer. An OCR scan is required.'
      };
    } else if (!recovered.ok && (recovered.status === 'failed' || recovered.status === 'malformed') && !(result.processed && isReadablePdfText(result.text))) {
      result = {
        ...result,
        accepted: false,
        httpStatus: 400,
        error: 'The PDF could not be read. No text was invented for it.',
        processed: false,
        extractionStatus: 'failed',
        text: '',
        note: 'The PDF could not be read. No text was invented for it.'
      };
    } else if (recovered.ok && isReadablePdfText(recovered.text) && (!result.processed || !isReadablePdfText(result.text) || recovered.text.length > result.text.length + 200)) {
      result = {
        ...result,
        accepted: true,
        httpStatus: 200,
        error: null,
        processed: true,
        extractionStatus: 'extracted',
        text: recovered.text,
        note: recovered.truncated
          ? 'Text was read from the PDF. Only the first 20,000 characters are kept, so the rest of a long paper is not included.'
          : 'Text was read from the PDF text layer. Embedded images were not interpreted.'
      };
    }
  }
  const format = result.format;
  const needsReading =
    Boolean(bytes) &&
    (format === 'jpeg' || format === 'png' || format === 'webp' || (format === 'pdf' && result.extractionStatus === 'provider_required'));
  if (needsReading && bytes && (format === 'jpeg' || format === 'png' || format === 'webp' || format === 'pdf')) {
    const reading = await readPage(bytes, format, body.password);
    result = applyOcrReading(result, reading);
  }
  return res.status(result.httpStatus).json({
    success: result.accepted,
    processed: result.processed,
    error: result.error ? redactSecrets(result.error, secretValues()) : null,
    data: result.accepted
      ? {
          extractionStatus: result.extractionStatus,
          format: result.format,
          byteLength: result.byteLength,
          text: result.text,
          note: result.note,
          sampleId: result.sampleId,
          demo: result.demo,
          instructionLike: result.instructionLike,
          processed: result.processed,
          readingOrigin: result.readingOrigin ?? null,
          ocrConfidence: result.ocrConfidence ?? null
        }
      : null
  });
});

router.post('/explain', (req: Request, res: Response) => {
  const parsed = MaterialExplainRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      processed: false,
      error: 'There is no accepted text to explain.',
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    });
  }
  try {
    const built = buildMaterialExplanation({
      text: parsed.data.text,
      sourceKind: parsed.data.sourceKind,
      sampleId: parsed.data.sampleId,
      subjectOverride: parsed.data.subjectOverride,
      contentTypeOverride: parsed.data.contentTypeOverride
    });
    const checked = withPythonCheck(built);
    const valid = parseExternalExplanation(checked);
    if (!valid.ok) {
      return res.status(502).json({ success: false, processed: false, error: valid.error });
    }
    return res.json({ success: true, processed: true, data: valid.data });
  } catch {
    return res.status(500).json({
      success: false,
      processed: false,
      error: 'An explanation could not be built. Nothing was shown as finished work.'
    });
  }
});

router.post('/answer', (req: Request, res: Response) => {
  const body = req.body ?? {};
  const text = typeof body.text === 'string' ? body.text : '';
  const questionId = typeof body.questionId === 'string' ? body.questionId : '';
  const selectedIndex = body.selectedIndex;
  const sourceKind = body.sourceKind;
  if (
    !text ||
    !questionId ||
    typeof selectedIndex !== 'number' ||
    typeof sourceKind !== 'string' ||
    !(MATERIAL_SOURCE_KINDS as readonly string[]).includes(sourceKind)
  ) {
    return res.status(400).json({ success: false, error: 'The answer could not be checked because the question was incomplete.' });
  }
  const graded = gradePracticeSubmission({
    text,
    sourceKind: sourceKind as MaterialSourceKind,
    sampleId: typeof body.sampleId === 'string' ? body.sampleId : null,
    subjectOverride: body.subjectOverride ?? null,
    contentTypeOverride: body.contentTypeOverride ?? null,
    questionId,
    selectedIndex
  });
  if (!graded.ok) {
    return res.status(graded.status).json({ success: false, error: graded.error });
  }
  const currentWeights = isWeights(body.weights) ? body.weights : defaultStrategyWeights();
  const localWeights = adjustStrategyWeights(currentWeights, graded.correct);
  const python = runPythonEngine({
    command: 'record',
    subject: graded.subject,
    conceptId: graded.conceptId,
    correct: graded.correct
  });
  const pythonWeights = python.ok && isWeights(python.data.weights) ? python.data.weights : null;
  return res.json({
    success: true,
    data: {
      correct: graded.correct,
      explanation: graded.feedback,
      conceptId: graded.conceptId,
      subject: graded.subject,
      stage: graded.stage,
      relatedStepIndex: graded.relatedStepIndex,
      weights: pythonWeights ?? localWeights,
      weightSource: pythonWeights ? 'python-evidence' : 'local-rules',
      trainedModel: false,
      pythonStored: python.ok,
      why: graded.correct
        ? 'The selected option matches the stored answer for this question.'
        : 'The selected option does not match the stored answer. One incorrect answer is not treated as a fixed misconception.'
    }
  });
});

export default router;
