import mongoose, { Schema, Document } from 'mongoose';

export interface IAttempt extends Document {
  attemptId: string;
  pyqId: string;
  studentId?: string;
  operationExecuted: string;
  studentGraphSubmission: any;
  isCorrect: boolean;
  mistakeCategory?: string;
  timestamp: Date;
}

const AttemptSchema = new Schema<IAttempt>({
  attemptId: { type: String, required: true, unique: true },
  pyqId: { type: String, required: true },
  studentId: { type: String, default: 'anonymous_student' },
  operationExecuted: { type: String, required: true },
  studentGraphSubmission: { type: Schema.Types.Mixed, required: true },
  isCorrect: { type: Boolean, required: true },
  mistakeCategory: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const AttemptModel =
  mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);
