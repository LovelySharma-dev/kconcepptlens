import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  publicId: string;
  originalFileName: string;
  fileType: string;
  bytes: number;
  secureUrl: string;
  cropCoordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  detectedBlurScore?: number;
  createdAt: Date;
}

const AssetSchema = new Schema<IAsset>({
  publicId: { type: String, required: true, unique: true },
  originalFileName: { type: String, required: true },
  fileType: { type: String, required: true },
  bytes: { type: Number, required: true },
  secureUrl: { type: String, required: true },
  cropCoordinates: {
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  detectedBlurScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Asset = mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);
