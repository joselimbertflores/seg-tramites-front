interface MessageProperties {
  id: string;
  chat: string;
  sender: Sender;
  content?: string;
  media?: Media;
  sentAt: Date;
  updatedAt: Date;
  isRead: boolean;
  type: 'text' | 'media';
}

interface Sender {
  id: string;
  fullname: string;
}

interface Media {
  fileName: string;
  originalName: string;
  type: string;
}
export class Message {
  id: string;
  chat: string;
  sender: Sender;
  content?: string;
  sentAt: Date;
  updatedAt: Date;
  isRead: boolean;
  media?: Media;
  type: 'text' | 'media';

  constructor({
    id,
    chat,
    sender,
    content,
    sentAt,
    updatedAt,
    isRead,
    media,
    type,
  }: MessageProperties) {
    this.id = id;
    this.chat = chat;
    this.sender = sender;
    this.content = content;
    this.sentAt = sentAt;
    this.updatedAt = updatedAt;
    this.isRead = isRead;
    this.media = media;
    this.type = type;
  }
}
