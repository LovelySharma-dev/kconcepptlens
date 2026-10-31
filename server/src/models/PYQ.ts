import mongoose, { Schema, Document } from 'mongoose';

export interface IPYQ extends Document {
  pyqId: string;
  title: string;
  exam: {
    boardOrUniversity: string;
    year: number;
    subjectCode: string;
    subjectName: string;
    questionNumber: string;
    marks: number;
    sourcePaperUrl: string;
    cropBoundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  conceptTag: string;
  difficulty: 'easy' | 'medium' | 'hard';
  problemStatement: string;
  markingSchemeKeyPoints: string[];
  initialGraph: any;
  solutionOperation: string;
  verifiedAccuracy: boolean;
  createdAt: Date;
}

const PYQSchema = new Schema<IPYQ>({
  pyqId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  exam: {
    boardOrUniversity: { type: String, required: true },
    year: { type: Number, required: true },
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    questionNumber: { type: String, required: true },
    marks: { type: Number, required: true },
    sourcePaperUrl: { type: String, required: true },
    cropBoundingBox: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    }
  },
  conceptTag: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  problemStatement: { type: String, required: true },
  markingSchemeKeyPoints: [{ type: String }],
  initialGraph: { type: Schema.Types.Mixed, required: true },
  solutionOperation: { type: String, required: true },
  verifiedAccuracy: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const PYQModel = mongoose.models.PYQ || mongoose.model<IPYQ>('PYQ', PYQSchema);
