export interface MessageResponse {
  _id: string;
  chat: string;
  sender: Sender;
  content: string;
  sentAt: string;
  updatedAt: string;
  isRead: boolean;
  media: Media;
  type: 'text' | 'media';
}

interface Media {
  fileName: string;
  originalName: string;
  type: string;
}
interface Sender {
  _id: string;
  fullname: string;
}
