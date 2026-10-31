import { Router, Request, Response } from 'express';
import {
  generateUploadSignature,
  isCloudinaryConfigured,
  getOptimizedDiagramUrl,
  uploadDirectToCloudinary,
  isSafePublicId,
  inspectDirectUpload,
  cloudinary
} from '../config/cloudinary';
import { Asset } from '../models/Asset';
import { inMemoryStore, isDbConnected } from '../config/db';

const router = Router();

/**
 * GET /api/uploads/status
 * Returns real Cloudinary integration status for the client UI
 */
router.get('/status', async (req: Request, res: Response) => {
  const configured = isCloudinaryConfigured();
  let accountReachable = false;
  let accountError: string | null = null;

  if (configured) {
    try {
      await cloudinary.api.ping();
      accountReachable = true;
    } catch (error: unknown) {
      const nested = error && typeof error === 'object' && 'error' in error
        ? (error as { error?: { message?: unknown } }).error?.message
        : undefined;
      const raw = typeof nested === 'string' ? nested : 'Cloudinary account check failed';
      accountError = raw.length > 120 || /key|secret|auth/i.test(raw)
        ? 'Cloudinary rejected the server credentials.'
        : raw;
    }
  }

  res.json({
    success: true,
    data: {
      configured,
      accountReachable,
      accountError,
      cloudName: configured ? process.env.CLOUDINARY_CLOUD_NAME?.trim() : null,
      folder: 'conceptlens/uploads',
      supportedFormats: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
      maxSizeBytes: 15 * 1024 * 1024 // 15 MB
    }
  });
});

/**
 * POST /api/uploads/signature
 * Generates restricted signed authorization for client-side direct Cloudinary uploads
 */
router.post('/signature', (req: Request, res: Response) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Cloudinary API credentials are not configured in .env. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET for live signed uploads.'
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

    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Cloudinary API credentials are not configured in .env. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET or use curated sample diagrams.'
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
