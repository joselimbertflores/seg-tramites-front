
export interface tableProcedureColums {
  columnDef: keyof tableProcedureData;
  header: string;
}
export interface tableProcedureData {
  _id: string;
  group: string;
  reference: string;
  startDate: string;
  code: string;
  applicant?: string;
}
