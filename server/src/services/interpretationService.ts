import { LinkedListGraph, LinkedListGraphSchema, ValidationResult } from '@conceptlens/shared';
import { validateLinkedListInvariants } from './validationService';

export interface InterpretationRequest {
  imageUrl: string;
  cropCoordinates?: { x: number; y: number; width: number; height: number };
  diagramType?: string;
  sourceContext?: string;
}
export interface InterpretationResponse {
  sessionId: string;
  status: 'completed' | 'needs_review' | 'failed';
  diagramType: string;
  graph: LinkedListGraph;
  validation: ValidationResult;
  message: string;
}

function normalizeNodeAddressesAndLayout(graph: LinkedListGraph): LinkedListGraph {
  return {
    ...graph,
    nodes: graph.nodes.map((node, index) => ({
      ...node,
      address: node.address || `0x${(0x1020 + index * 0x20).toString(16).toUpperCase()}`,
      x: Number.isFinite(node.x) && node.x !== 0 ? (node.x <= 1000 ? 60 + node.x * 0.72 : node.x) : 80 + index * 180,
      y: Number.isFinite(node.y) && node.y !== 0 ? (node.y <= 1000 ? 100 + node.y * 0.16 : node.y) : 180
    }))
  };
}

async function getImagePart(imageUrl: string): Promise<{ mimeType: string; data: string }> {
  if (imageUrl.startsWith('data:')) {
    const match = imageUrl.match(/^data:(image\/(?:png|jpeg|webp)|application\/pdf);base64,([\s\S]+)$/);
    if (!match) throw new Error('Only PNG, JPEG, WEBP, or PDF data URLs are supported.');
    return { mimeType: match[1], data: match[2] };
  }
  const parsed = new URL(imageUrl);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'res.cloudinary.com') {
    throw new Error('Interpretation accepts only HTTPS Cloudinary assets.');
  }
  const response = await fetch(parsed, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Could not fetch uploaded image (${response.status}).`);
  const mimeType = (response.headers.get('content-type') || '').split(';')[0];
  if (!['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(mimeType)) throw new Error('Unsupported image asset type.');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > 20 * 1024 * 1024) throw new Error('The transformed image exceeds the 20 MB vision limit.');
  return { mimeType, data: bytes.toString('base64') };
}

async function callGeminiVision(apiKey: string, imageUrl: string, context = ''): Promise<LinkedListGraph> {
  const image = await getImagePart(imageUrl);
  const prompt = `Parse the linked-list diagram in this media. Include every visible node and pointer, and provide normalized node positions in the range 0..1000 using x/y. Give each node an OCR confidence from 0 to 1 and a sourceLabelCoordinates box in normalized [0..1000] units when possible. Use a unique id per node. Infer singly, doubly, or circular structure only when supported by the diagram. If uncertain, lower confidence. Return only JSON matching: {"headId":string|null,"tailId"?:string|null,"structureType":"singly"|"doubly"|"circular","isCircular":boolean,"nodes":[{"id":string,"value":string|number,"next":string|null,"prev"?:string|null,"x":number,"y":number,"confidence":number,"sourceLabelCoordinates"?:{"x":number,"y":number,"width":number,"height":number}}]}. Context: ${context.slice(0, 1000)}`;
  const model = process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: image }] }], generationConfig: { responseMimeType: 'application/json', responseSchema: {
      type: 'OBJECT', required: ['headId', 'structureType', 'isCircular', 'nodes'], properties: {
        headId: { type: 'STRING', nullable: true }, tailId: { type: 'STRING', nullable: true }, structureType: { type: 'STRING', enum: ['singly', 'doubly', 'circular'] }, isCircular: { type: 'BOOLEAN' },
        nodes: { type: 'ARRAY', items: { type: 'OBJECT', required: ['id', 'value', 'next', 'confidence'], properties: {
          id: { type: 'STRING' }, value: { type: 'STRING' }, next: { type: 'STRING', nullable: true }, prev: { type: 'STRING', nullable: true },
          confidence: { type: 'NUMBER' }, x: { type: 'NUMBER' }, y: { type: 'NUMBER' },
          sourceLabelCoordinates: { type: 'OBJECT', properties: { x: { type: 'NUMBER' }, y: { type: 'NUMBER' }, width: { type: 'NUMBER' }, height: { type: 'NUMBER' } } }
        } } }
      }
    } } })
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || `Gemini Vision request failed (${response.status}).`);
  const text = body?.candidates?.[0]?.content?.parts?.find((part: any) => part.text)?.text;
  if (!text) throw new Error('Gemini returned no diagram interpretation.');
  let output: unknown;
  try { output = JSON.parse(text); } catch { throw new Error('Gemini returned malformed JSON.'); }
  const parsed = LinkedListGraphSchema.safeParse(output);
  if (!parsed.success) throw new Error(`Gemini graph did not match the graph contract: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`);
  return normalizeNodeAddressesAndLayout(parsed.data);
}

export async function interpretDiagram(req: InterpretationRequest): Promise<InterpretationResponse> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const emptyGraph: LinkedListGraph = { headId: null, structureType: 'singly', isCircular: false, nodes: [] };
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { sessionId, status: 'failed', diagramType: req.diagramType || 'singly', graph: emptyGraph, validation: validateLinkedListInvariants(emptyGraph), message: 'Vision interpretation is unavailable. Set GEMINI_API_KEY on the server.' };
  try {
    if (!req.imageUrl) throw new Error('No uploaded image was provided.');
    const graph = await callGeminiVision(apiKey, req.imageUrl, req.sourceContext);
    const validation = validateLinkedListInvariants(graph);
    const status = validation.isValid && !validation.needsHumanReview ? 'completed' : 'needs_review';
    return { sessionId, status, diagramType: graph.structureType || 'singly', graph, validation, message: status === 'completed' ? 'Diagram interpreted by Gemini Vision and passed structural validation.' : 'Diagram interpreted, but structural validation or low-confidence labels need your review.' };
  } catch (error) {
    return { sessionId, status: 'failed', diagramType: req.diagramType || 'singly', graph: emptyGraph, validation: validateLinkedListInvariants(emptyGraph), message: error instanceof Error ? error.message : 'Diagram interpretation failed.' };
  }
}
