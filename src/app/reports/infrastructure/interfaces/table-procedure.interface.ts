export interface tableProcedureColums {
  header: string;
  columnDef: string;
  width?: 'auto' | '*' | number;
}
export interface tableProcedureData {
  id: string;
  group: string;
  code: string;
  reference: string;
  [key: string]: string | number;
}
