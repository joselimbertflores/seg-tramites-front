export interface publication {
  _id: string;
  user: string | user;
  title: string;
  content: string;
  attachments: Attachment[];
  priority: number;
  createdAt: string;
  updatedAt: string;
  image: string | null;
  startDate: string;
  expirationDate: string;
}



export interface Attachment {
  originalName: string;
  fileName: string;
}

export interface user {
  fullname: string;
}
