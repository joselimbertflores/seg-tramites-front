export interface publication {
  _id: string;
  user: user;
  title: string;
  content: string;
  attachments: PublicationAttachment[];
  priority: number;
  createdAt: string;
  updatedAt: string;
  image: string | null;
  startDate: string;
  expirationDate: string;
}

export interface PublicationAttachment {
  originalName: string;
  fileName: string;
}

interface user {
  _id: string;
  fullname: string;
}
