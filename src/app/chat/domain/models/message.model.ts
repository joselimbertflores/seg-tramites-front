interface MessageProperties {
  id: string;
  chat: string;
  sender: Sender;
  content: string;
  sentAt: Date;
  updatedAt: Date;
  isRead: boolean;
}

interface Sender {
  id: string;
  fullname: string;
}

export class Message {
  id: string;
  chat: string;
  sender: Sender;
  content: string;
  sentAt: Date;
  updatedAt: Date;
  isRead: boolean;

  constructor({
    id,
    chat,
    sender,
    content,
    sentAt: createdAt,
    updatedAt,
    isRead,
  }: MessageProperties) {
    this.id = id;
    this.chat = chat;
    this.sender = sender;
    this.content = content;
    this.sentAt = createdAt;
    this.updatedAt = updatedAt;
    this.isRead = isRead;
  }
}
