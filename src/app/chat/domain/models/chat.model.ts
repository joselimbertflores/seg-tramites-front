interface ChatProperties {
  id: string;
  name: string;
  type: string;
  lastMessage: LastMessage;
  createdAt: Date;
  updatedAt: Date;
  unreadCount: number;
}

interface LastMessage {
  text: string;
  sender: string;
  senderName: string;
  createdAt: Date;
}

export class Chat {
  id: string;
  name: string;
  type: string;
  lastMessage: LastMessage;
  createdAt: Date;
  updatedAt: Date;
  unreadCount: number;
  constructor({
    id,
    name,
    type,
    lastMessage,
    createdAt,
    updatedAt,
    unreadCount,
  }: ChatProperties) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.lastMessage = lastMessage;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.unreadCount = unreadCount;
  }
}
