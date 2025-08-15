export interface MessageResponse {
  _id: string;
  chat: string;
  sender: Sender;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Sender {
  _id: string;
  fullname: string;
}
