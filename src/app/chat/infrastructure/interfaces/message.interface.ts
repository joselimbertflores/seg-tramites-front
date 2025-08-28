export interface MessageResponse {
  _id: string;
  chat: string;
  sender: Sender;
  content: string;
  sentAt: string;
  updatedAt: string;
  isRead: boolean;
  media: Media;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
}

interface Media {
  fileName: string;
  originalName: string;
}
interface Sender {
  _id: string;
  fullname: string;
}
