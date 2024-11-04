export interface internal {
  _id: string;
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
  emitter: worker;
  receiver: worker;
}

interface worker {
  fullname: string;
  jobtitle: string;
}

interface type {
  nombre: string;
}