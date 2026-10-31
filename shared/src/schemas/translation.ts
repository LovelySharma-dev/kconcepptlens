import { z } from 'zod';

export const SupportedLanguageCodeSchema = z.enum([
  'en',
  'hi',
  'ta',
  'te',
  'bn',
  'mr',
  'gu',
  'kn',
  'ml',
  'ur'
]);
export type SupportedLanguageCode = z.infer<typeof SupportedLanguageCodeSchema>;

export interface LanguageInfo {
  code: SupportedLanguageCode;
  label: string;
  nativeLabel: string;
  rtl: boolean;
}

export const SUPPORTED_CURRICULUM_LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', nativeLabel: 'English (Original)', rtl: false },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', rtl: false },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', rtl: false },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', rtl: false },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', rtl: false },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', rtl: false },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', rtl: false },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', rtl: false },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', rtl: false },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', rtl: true }
];

export const TranslationStatusSchema = z.enum([
  'original',
  'machine_translated',
  'human_reviewed',
  'unavailable',
  'failed'
]);
export type TranslationStatus = z.infer<typeof TranslationStatusSchema>;

export const CurriculumTranslateRequestSchema = z.object({
  text: z.string().min(1, 'Text to translate must not be empty').max(20000, 'Text exceeds 20,000 characters limit'),
  targetLanguage: SupportedLanguageCodeSchema,
  sourceLanguage: z.string().default('en'),
  context: z.enum(['lesson', 'objective', 'instruction', 'pdf_text', 'term']).optional()
});
export type CurriculumTranslateRequest = z.infer<typeof CurriculumTranslateRequestSchema>;

export const CurriculumTranslateResponseSchema = z.object({
  originalText: z.string(),
  translatedText: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: SupportedLanguageCodeSchema,
  status: TranslationStatusSchema,
  provider: z.string(),
  disclaimer: z.string(),
  timestamp: z.string(),
  rtl: z.boolean().default(false)
});
export type CurriculumTranslateResponse = z.infer<typeof CurriculumTranslateResponseSchema>;
