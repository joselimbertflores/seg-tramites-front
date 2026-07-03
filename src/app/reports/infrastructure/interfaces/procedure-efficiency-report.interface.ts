export interface ProcedureResume {
  id: string;
  code?: string;
  group?: string;
  createdAt: string | Date;
  completedAt: string | Date;
  workingDays: number;
}

export interface ProcedureEfficiencyResponse {
  typeId: string;
  typeName: string;
  count: number;
  averageWorkingDays: number;
  minWorkingDays: number;
  maxWorkingDays: number;
  fastestProcedure: ProcedureResume;
  slowestProcedure: ProcedureResume;
}
