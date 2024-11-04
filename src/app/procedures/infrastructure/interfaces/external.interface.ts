export interface external {
  _id: string;
  applicant: applicant;
  requirements: string[];
  pin: number;
  code: string;
  cite: string;
  type: type;
  account: string;
  state: string;
  reference: string;
  numberOfDocuments: string;
  send: boolean;
  group: string;
  createdAt: string;
  updatedAt: string;
  isSend: boolean;
}

interface applicant {
  firstname: string;
  middlename: string;
  lastname: string;
  phone: string;
  dni: string;
  type: 'NATURAL' | 'JURIDICO';
}

interface type {
  nombre: string;
}
