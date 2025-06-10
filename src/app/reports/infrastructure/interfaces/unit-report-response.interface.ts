export interface totalCommunicationsByUnitResponse {
  statusCounts: statusCount[];
  total: number;
  accountId: string;
  officer: string | null;
  jobTitle: string;
}

interface statusCount {
  status: string;
  count: number;
}
