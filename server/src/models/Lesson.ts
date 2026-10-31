import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
  lessonId: string;
  title: string;
  topic: string;
  conceptDescription: string;
  baseGraph: any;
  islResource?: {
    videoUrl: string;
    thumbnailUrl?: string;
    vttCaptionsUrl: string;
    transcriptText: string;
    verifiedByExpert: boolean;
  };
  connectedPYQIds: string[];
  createdAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  lessonId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  topic: { type: String, required: true },
  conceptDescription: { type: String, required: true },
  baseGraph: { type: Schema.Types.Mixed, required: true },
  islResource: {
    videoUrl: { type: String },
    thumbnailUrl: { type: String },
    vttCaptionsUrl: { type: String },
    transcriptText: { type: String },
    verifiedByExpert: { type: Boolean, default: true }
  },
  connectedPYQIds: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const LessonModel = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
