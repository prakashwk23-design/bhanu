export interface Env {
  DB: D1Database;
  APP_ENV?: string;
  AI_MODEL?: string;
  /** Z.ai (GLM) OpenAI-compatible credentials. */
  ZAI_API_KEY?: string;
  ZAI_API_BASE?: string;
  /** Any other OpenAI-compatible provider. */
  AI_API_KEY?: string;
  AI_API_BASE?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_UPLOAD_PRESET?: string;
  CLOUDINARY_FOLDER?: string;
  TRANSCRIPTION_WEBHOOK_SECRET?: string;
}
