---
name: cloudinary-media-pipeline
description: >-
  Upload, transform, optimize, and crop study diagrams and exam papers using Cloudinary's signed upload pipeline, automatic quality checks, and responsive delivery.
---

# Cloudinary Media Pipeline Skill for ConceptLens

This skill defines the standardized media ingestion and transformation workflow for study materials, scanned notes, and Previous Year Questions (PYQs).

## Core Principles

1. **Original Preservation**: Never overwrite or discard the original high-resolution upload. Store the raw asset with immutable metadata.
2. **Pre-upload Validation**: Verify file type (`image/png`, `image/jpeg`, `image/webp`, `application/pdf`), enforce size limits (max 15MB for images, 30MB for PDFs), and reject unsupported extensions before calling the API.
3. **Restricted Signed Uploads**: Generate server-side signatures via `POST /api/uploads/signature` with restricted presets, timestamps, and upload tags. Never expose Cloudinary API secrets to the client.
4. **Transformations on Demand**: Use Cloudinary URL-based transformations for:
   - Cropping diagram bounding boxes (`c_crop,x_<x>,y_<y>,w_<w>,h_<h>`)
   - Auto-contrast and sharpening for scanned ink notes (`e_sharpen,e_contrast`)
   - Thumbnail generation for quick preview cards (`c_thumb,w_300,h_200,g_auto`)
   - Responsive format delivery (`f_auto,q_auto`)

## Implementation Guide

### 1. Generating Upload Signatures (Server)
```typescript
import { v2 as cloudinary } from 'cloudinary';

export function generateUploadSignature(folder: string = 'conceptlens/uploads') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    timestamp,
    folder,
    transformation: 'f_auto,q_auto',
  };
  
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
  };
}
```

### 2. Client Direct Upload
```typescript
export async function uploadToCloudinary(file: File, signatureData: any) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signatureData.apiKey);
  formData.append('timestamp', signatureData.timestamp.toString());
  formData.append('signature', signatureData.signature);
  formData.append('folder', signatureData.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) throw new Error('Cloudinary upload failed');
  return res.json();
}
```

### 3. Diagram Crop & Transform Helpers
```typescript
export function getDiagramCropUrl(publicId: string, cloudName: string, crop: { x: number; y: number; w: number; h: number }) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_crop,x_${crop.x},y_${crop.y},w_${crop.w},h_${crop.h}/e_sharpen:80/f_auto,q_auto/${publicId}`;
}
```

## Failure Recovery
- If upload fails due to network drop: retry up to 2 times with exponential backoff.
- If image is flagged as blurry or unreadable: prompt user to crop tighter or re-upload higher contrast scan.
