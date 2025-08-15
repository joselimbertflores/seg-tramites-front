interface MessageProperties {
  id: string;
  chat: string;
  sender: Sender;
  content: string;
  createdAt: Date;
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
  createdAt: Date;
  updatedAt: Date;

  constructor({
    id,
    chat,
    sender,
    content,
    createdAt,
    updatedAt,
  }: MessageProperties) {
    this.id = id;
    this.chat = chat;
    this.sender = sender;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
