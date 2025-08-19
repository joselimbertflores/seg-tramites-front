interface ChatProperties {
  id: string;
  name: string;
  type: string;
  lastMessage: LastMessage;
  sentAt: Date;
  updatedAt: Date;
  unreadCount: number;
  lastActivity: Date;
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
  lastActivity: Date;

  constructor({
    id,
    name,
    type,
    lastMessage,
    sentAt,
    updatedAt,
    unreadCount,
    lastActivity,
  }: ChatProperties) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.lastMessage = lastMessage;
    this.sentAt = sentAt;
    this.updatedAt = updatedAt;
    this.unreadCount = unreadCount;
    this.lastActivity = lastActivity;
  }
}
