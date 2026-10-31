import mongoose, { Schema, Document } from 'mongoose';

export interface IDiagramSession extends Document {
  sessionId: string;
  assetId?: string;
  sourceType: 'upload' | 'pyq' | 'template';
  diagramType: 'singly_linked_list' | 'doubly_linked_list' | 'binary_tree';
  status: 'queued' | 'processing' | 'needs_review' | 'completed' | 'failed';
  graph: any;
  executionSteps: any[];
  userCorrectionsApplied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiagramSessionSchema = new Schema<IDiagramSession>({
  sessionId: { type: String, required: true, unique: true },
  assetId: { type: String },
  sourceType: { type: String, enum: ['upload', 'pyq', 'template'], default: 'upload' },
  diagramType: { type: String, default: 'singly_linked_list' },
  status: {
    type: String,
    enum: ['queued', 'processing', 'needs_review', 'completed', 'failed'],
    default: 'completed'
  },
  graph: { type: Schema.Types.Mixed, required: true },
  executionSteps: { type: Schema.Types.Mixed as any, default: [] },
  userCorrectionsApplied: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const DiagramSession =
  mongoose.models.DiagramSession ||
  mongoose.model<IDiagramSession>('DiagramSession', DiagramSessionSchema);
