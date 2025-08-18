interface ChatProperties {
  id: string;
  name: string;
  type: string;
  lastMessage: LastMessage;
  sentAt: Date;
  updatedAt: Date;
  unreadCount: number;
}

interface LastMessage {
  content: string;
  sender: string;
  senderName: string;
  sentAt: Date;
}

export class Chat {
  id: string;
  name: string;
  type: string;
  lastMessage?: LastMessage;
  sentAt: Date;
  updatedAt: Date;
  unreadCount: number;
  constructor({
    id,
    name,
    type,
    lastMessage,
    sentAt: createdAt,
    updatedAt,
    unreadCount,
  }: ChatProperties) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.lastMessage = lastMessage;
    this.sentAt = createdAt;
    this.updatedAt = updatedAt;
    this.unreadCount = unreadCount;
  }

  withNewMessage(message: Partial<LastMessage>): Chat {
    return new Chat({
      ...this,
      lastMessage: message,
    });
  }
}
