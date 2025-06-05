export interface resourceFile {
  _id: string;
  fileName: string;
  originalName: string;
  createdAt: string;
  category: string;
}

export interface groupedResource {
  category: string;
  files: resourceFile[];
}
