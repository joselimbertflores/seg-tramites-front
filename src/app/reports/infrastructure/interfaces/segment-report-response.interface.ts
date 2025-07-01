import { procedureState } from "../../../procedures/domain";

export interface totalProcedureBySegmentResponse {
  institutionId: string;
  segments: Segment[];
  globalTotals: Totals;
}

export interface Totals {
  pending: number;
  completed: number;
}

export interface Segment {
  breakdown: Breakdown[];
  total: number;
  totals: Totals;
  prefix: string;
}

export interface Breakdown {
  state: procedureState;
  status: Status;
  count: number;
}



export enum Status {
  Completed = 'completed',
  Pending = 'pending',
}
