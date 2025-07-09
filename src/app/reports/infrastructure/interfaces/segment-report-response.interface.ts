import { procedureState } from '../../../procedures/domain';

export interface totalProcedureBySegmentResponse {
  segments: Segment[];
  globalTotals: GlobalTotals;
}

interface Totals {
  pending: number;
  completed: number;
}

interface GlobalTotals {
  totalPending: number;
  totalCompleted: number;
  total: number;
}

interface Segment {
  breakdown: Breakdown[];
  total: number;
  totals: Totals;
  prefix: string;
}

interface Breakdown {
  state: procedureState;
  status: 'completed' | 'pending';
  count: number;
}
