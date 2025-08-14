export interface ChatResponse {
  _id: string;
  name: string;
  type: string;
  lastMessage: LastMessage;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  readBy: any[];
}

interface LastMessage {
  text: string;
  sender: string;
  senderName: string;
  createdAt: string;
}
