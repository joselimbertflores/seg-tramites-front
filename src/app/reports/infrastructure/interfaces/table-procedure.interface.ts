export interface tableProcedureColums {
  header: string;
  columnDef: keyof tableProcedureData;
  width?: 'auto' | '*';
}
export interface tableProcedureData {
  id: string;
  group: string;
  code: string;
  reference: string;
  state: string;
  createdAt: string;
  person?: string;
}
