export interface CorrespondenceStatusByUnitResponse {
  id: string;
  fullName: string;
  jobTitle: string;
  total: number;
  statusCounts: StatusCount[];
}

interface StatusCount {
  status: string;
  count: number;
}
