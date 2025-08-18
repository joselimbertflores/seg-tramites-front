interface MessageProperties {
  id: string;
  chat: string;
  sender: Sender;
  content: string;
  sentAt: Date;
  updatedAt: Date;
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

  constructor({
    id,
    chat,
    sender,
    content,
    sentAt: createdAt,
    updatedAt,
  }: MessageProperties) {
    this.id = id;
    this.chat = chat;
    this.sender = sender;
    this.content = content;
    this.sentAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
