export interface publication {
  _id: string;
  user: user;
  title: string;
  content: string;
  attachments: Attachment[];
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  originalName: string;
  fileName: string;
}

export interface user {
  funcionario: {
    nombre: string;
    paterno: string;
    materno: string;
  };
  jobtitle: string;
}
