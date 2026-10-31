import { Router, Request, Response } from 'express';
import { NaturalLanguageTransformRequestSchema } from '@conceptlens/shared';
import {
  generateUploadSignature,
  isCloudinaryConfigured,
  getOptimizedDiagramUrl,
  uploadDirectToCloudinary,
  isSafePublicId,
  inspectDirectUpload,
  cloudinary,
  signedUploadAllowed,
  cloudinaryFailureReason
} from '../config/cloudinary';
import { executeTransformationInstruction } from '../services/cloudinaryTransformationService';
import { Asset } from '../models/Asset';
import { inMemoryStore, isDbConnected } from '../config/db';

const router = Router();

/**
 * GET /api/uploads/status
 * Returns real Cloudinary integration status for the client UI
 */
async function readAccount(): Promise<{ configured: boolean; accountReachable: boolean; accountError: string | null }> {
  const configured = isCloudinaryConfigured();
  if (!configured) return { configured, accountReachable: false, accountError: null };
  try {
    await cloudinary.api.ping();
    return { configured, accountReachable: true, accountError: null };
  } catch (error: unknown) {
    const nested = error && typeof error === 'object' && 'error' in error
      ? (error as { error?: { message?: unknown } }).error?.message
      : undefined;
    const raw = typeof nested === 'string' ? nested : 'Cloudinary account check failed';
    return { configured, accountReachable: false, accountError: cloudinaryFailureReason(raw) };
  }
}

router.get('/status', async (req: Request, res: Response) => {
  const account = await readAccount();
  const configured = account.configured;
  const accountReachable = account.accountReachable;
  const accountError = account.accountError;
  const uploadGate = signedUploadAllowed({ configured, accountReachable });

  res.json({
    success: true,
    data: {
      configured,
      accountReachable,
      accountError,
      cloudName: configured ? process.env.CLOUDINARY_CLOUD_NAME?.trim() : null,
      folder: 'conceptlens/uploads',
      supportedFormats: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm'],
      maxSizeBytes: 15 * 1024 * 1024, // 15 MB for images
      videoMaxSizeBytes: 30 * 1024 * 1024, // 30 MB for educational videos
      lowDataSupported: true,
      naturalLanguageTransformSupported: true,
      videoSupported: true,
      aiOperationsSupported: true,
      signedUpload: uploadGate.allowed ? 'enabled' : 'disabled',
      signedUploadReason: uploadGate.reason,
      assetAccess: 'authenticated',
      retention: 'Authenticated uploads stay in the Cloudinary account until deleted. This server does not keep the file.'
    }
  });
});


/**
 * POST /api/uploads/signature
 * Generates restricted signed authorization for client-side direct Cloudinary uploads
 */
router.post('/signature', async (req: Request, res: Response) => {
  try {
    const account = await readAccount();
    const uploadGate = signedUploadAllowed(account);
    if (!uploadGate.allowed) {
      return res.status(503).json({
        success: false,
        error: uploadGate.reason
      });
    }
    const folder = 'conceptlens/uploads';
    if (req.body.folder && req.body.folder !== folder) {
      return res.status(400).json({ success: false, error: 'Uploads are restricted to the ConceptLens uploads folder.' });
    }
    const signatureData = generateUploadSignature(folder);
    res.json({
      success: true,
      data: signatureData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate upload signature'
    });
  }
});

/**
 * POST /api/uploads/direct
 * Direct server-side upload proxy to Cloudinary for seamless demo and student uploads
 */
router.post('/direct', async (req: Request, res: Response) => {
  try {
    const { fileData, originalFileName } = req.body;
    const inspected = inspectDirectUpload(fileData);
    if (!inspected.ok) {
      return res.status(inspected.status).json({ success: false, error: inspected.error });
    }

    const account = await readAccount();
    const uploadGate = signedUploadAllowed(account);
    if (!uploadGate.allowed) {
      return res.status(503).json({
        success: false,
        error: uploadGate.reason
      });
    }

    const uploadResult = await uploadDirectToCloudinary(fileData);

    const transformedPreviewUrl = getOptimizedDiagramUrl(uploadResult.public_id, undefined, {
      sharpen: true,
      contrast: true,
      maxDimension: 900
    });

    // Record asset in DB or in-memory
    const assetRecord = {
      publicId: uploadResult.public_id,
      originalFileName: originalFileName || 'textbook_diagram.png',
      fileType: uploadResult.format ? `image/${uploadResult.format}` : 'image/png',
      bytes: uploadResult.bytes || 0,
      secureUrl: uploadResult.secure_url,
      transformedUrl: transformedPreviewUrl,
      width: uploadResult.width,
      height: uploadResult.height,
      createdAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      const asset = new Asset(assetRecord);
      await asset.save();
    } else {
      inMemoryStore.assets.set(uploadResult.public_id, assetRecord);
    }

    res.json({
      success: true,
      data: {
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
        transformedPreviewUrl,
        bytes: uploadResult.bytes,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height
      }
    });
  } catch (error: any) {
    const raw = typeof error?.message === 'string' ? error.message : 'Failed to upload image to Cloudinary';
    res.status(500).json({
      success: false,
      error: raw.length > 180 || /key|secret|auth/i.test(raw)
        ? 'Failed to upload image to Cloudinary'
        : raw
    });
  }
});

/**
 * POST /api/uploads/transform
 * Dynamically computes transformed Cloudinary preview URLs (crop, sharpen, format)
 */
router.post('/transform', (req: Request, res: Response) => {
  try {
    const { publicId, crop, sharpen, contrast, maxDimension } = req.body;
    if (!publicId || typeof publicId !== 'string' || !isSafePublicId(publicId)) {
      return res.status(400).json({ success: false, error: 'publicId is required and must be a Cloudinary public ID.' });
    }

    const transformedUrl = getOptimizedDiagramUrl(publicId, crop, {
      sharpen: sharpen ?? true,
      contrast: contrast ?? true,
      maxDimension: maxDimension ?? 900
    });

    res.json({
      success: true,
      data: {
        publicId,
        transformedUrl,
        transformationsApplied: [
          'f_auto',
          'q_auto',
          crop ? `c_crop,x_${crop.x},y_${crop.y},w_${crop.width},h_${crop.height}` : 'c_limit,w_900',
          sharpen !== false ? 'e_sharpen:80' : null,
          contrast !== false ? 'e_contrast' : null
        ].filter(Boolean)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/uploads/transform-spec
 * Natural-language Cloudinary transformation endpoint.
 * Parses instructions ("crop to square", "low-data mobile", "lesson card", "sharpen diagram")
 * into validated transformation specs and generated delivery URLs.
 */
router.post('/transform-spec', async (req: Request, res: Response) => {
  try {
    const parseResult = NaturalLanguageTransformRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors.map((e) => e.message).join(', ')
      });
    }

    const { prompt, assetId, cloudName, lowDataMode, resourceType, isScientificDiagram, allowGenerativeModification } = parseResult.data;

    // Use environment cloud name if not explicitly provided
    const effectiveCloud = cloudName || (isCloudinaryConfigured() ? process.env.CLOUDINARY_CLOUD_NAME?.trim() : 'demo');

    const result = await executeTransformationInstruction(prompt, assetId, {
      cloudName: effectiveCloud,
      lowDataMode,
      resourceType,
      isScientificDiagram,
      allowGenerativeModification
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process transformation instruction'
    });
  }
});

/**
 * POST /api/uploads/record
 * Persists uploaded asset metadata and crop bounding boxes
 */
router.post('/record', async (req: Request, res: Response) => {
  try {
    const { publicId, originalFileName, fileType, bytes, secureUrl, cropCoordinates } = req.body;

    if (!publicId || !secureUrl || typeof secureUrl !== 'string' || !secureUrl.startsWith('https://res.cloudinary.com/')) {
      return res.status(400).json({ success: false, error: 'Missing required asset fields' });
    }
    if (typeof bytes !== 'number' || bytes < 0 || bytes > 30 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'Asset size is outside the permitted limit.' });
    }

    if (isDbConnected()) {
      const asset = new Asset({
        publicId,
        originalFileName: originalFileName || 'document.png',
        fileType: fileType || 'image/png',
        bytes: bytes || 0,
        secureUrl,
        cropCoordinates
      });
      await asset.save();
    } else {
      inMemoryStore.assets.set(publicId, {
        publicId,
        originalFileName: originalFileName || 'document.png',
        fileType: fileType || 'image/png',
        bytes,
        secureUrl,
        cropCoordinates,
        createdAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: {
        publicId,
        secureUrl,
        cropCoordinates
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
