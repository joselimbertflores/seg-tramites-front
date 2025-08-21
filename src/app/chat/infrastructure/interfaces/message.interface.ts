export interface MessageResponse {
  _id: string;
  chat: string;
  sender: Sender;
  content: string;
  sentAt: string;
  updatedAt: string;
  isRead: boolean;
}

interface Sender {
  _id: string;
  fullname: string;
}
