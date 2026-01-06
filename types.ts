
export enum CategoryType {
  TRANSCRIPTION = 'Транскрипция',
  RESTORATION = 'Реставрация фото',
  AUDIO = 'Расшифровка аудио',
  TRANSLATION = 'Перевод',
  IDENTIFICATION = 'Идентификация лиц',
  INFOGRAPHIC = 'Инфографика/схемы'
}

export interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface Review {
  id: string;
  author: string;
  authorAvatar?: string; // New: Support for user avatar
  text: string;
  rating: number; // 1 to 5
  createdAt: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'document';
  url: string; // Base64 or URL
  name: string;
  size?: number;
}

export interface Annotation {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  text: string;
  author: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  author: string;
  category: CategoryType;
  modelName: string; // e.g., "Gemini 1.5 Pro", "Midjourney v6"
  prompt: string;
  inputContent: string; // Text content
  inputAttachments?: Attachment[]; // Multimedia files
  outputContent: string; // Text result
  outputAttachments?: Attachment[]; // Multimedia files (future proofing)
  reviews: Review[];
  annotations?: Annotation[]; // New: Image pin-points
  createdAt: string;
}

export interface ModelRank {
  name: string;
  score: number;
  entryCount: number;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: CategoryType;
  text: string;
  difficulty: 'Новичок' | 'Продвинутый' | 'Эксперт';
  helpful: number;
  notHelpful: number;
}

export interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  author: string;
  tags: string[]; // e.g., "Web App", "Telegram Bot", "Parser"
  createdAt: string;
}