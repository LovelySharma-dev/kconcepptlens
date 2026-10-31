import { Router, Request, Response } from 'express';
import { generateUploadSignature } from '../config/cloudinary';
import { Asset } from '../models/Asset';
import { isDbConnected } from '../config/db';

const router = Router();

/**
 * POST /api/uploads/signature
 * Generates restricted signed authorization for client-side direct Cloudinary uploads
 */
router.post('/signature', (req: Request, res: Response) => {
  try {
    const folder = req.body.folder || 'conceptlens/uploads';
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
 * POST /api/uploads/record
 * Persists uploaded asset metadata and crop bounding boxes
 */
router.post('/record', async (req: Request, res: Response) => {
  try {
    const { publicId, originalFileName, fileType, bytes, secureUrl, cropCoordinates } = req.body;

    if (!publicId || !secureUrl) {
      return res.status(400).json({ success: false, error: 'Missing required asset fields' });
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
