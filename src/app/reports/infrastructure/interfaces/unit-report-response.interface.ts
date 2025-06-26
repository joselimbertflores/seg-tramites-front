export interface totalCommunicationsByUnitResponse {
  id: string;
  fullName?: string;
  jobTitle: string;
  statusCounts: statusCount[];
  total: number;
}

interface statusCount {
  status: string;
  count: number;
}
