export interface ChatResponse {
  _id: string;
  name: string;
  type: string;
  lastMessage: LastMessage;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  readBy: any[];
  lastActivity: string;
}

interface LastMessage {
  content: string;
  sender: string;
  senderName: string;
  createdAt: string;
}
