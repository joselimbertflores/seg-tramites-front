export interface ChatResponse {
  _id: string;
  name: string;
  type: string;
  lastMessage: LastMessage;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  lastActivity: string;
}

interface LastMessage {
  ref: string;
  content: string;
  sender: string;
  senderName: string;
  createdAt: string;
  isRead: boolean;
}
