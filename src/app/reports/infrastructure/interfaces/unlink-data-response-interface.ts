import { communication } from '../../../communications/infrastructure';

export interface unlinkDataResponse {
  officer: officerProps;
  summary: summary;
  inboxItems: communication[];
}

interface officerProps {
  fullname: string;
  jobtitle: string;
  dependency: string;
  institution: string;
}

interface summary {
  inbox: inbox;
  outbox: outbox;
}

interface inbox {
  pending: number;
  received: number;
}

interface outbox {
  pending: number;
  rejected: number;
  autoRejected: number;
}
