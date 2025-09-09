import { Message } from '../models/message.model';

// models/chat.models.ts
export type MediaType = 'text' | 'image' | 'audio' | 'video' | 'document';

export interface User {
  _id: string;
  fullname: string;
}

export interface UploadedFile {
  fileName: string;
  originalName: string;
  type: MediaType;
}

export interface ChatCache {
  messages: Message[];
  page: number;
  hasMore: boolean;
}

export type ScrollType = 'init' | 'scroll' | 'new';

export interface ActiveMessagesData {
  scroll?: ScrollType;
  messages: Message[];
}
