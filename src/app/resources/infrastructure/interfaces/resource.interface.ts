export interface groupedResource {
  [key: string]: resourceFile[];
}

export interface resourceFile {
  _id: string;
  fileName: string;
  originalName: string;
  createdAt: string;
  category: string;
}
