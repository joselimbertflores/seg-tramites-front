export interface groupedResource {
  category: string;
  files: resourceFile[];
}

export interface resourceFile {
  _id: string;
  fileName: string;
  originalName: string;
  createdAt: string;
}
