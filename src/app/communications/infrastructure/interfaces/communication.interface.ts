import {
  GroupProcedure,
  StateProcedure,
  StatusMail,
} from '../../../domain/models';

export interface communication {
  _id: string;
  sender: officer;
  recipient: officer;
  procedure: procedureProps;
  reference: string;
  attachmentsCount: string;
  internalNumber: string;
  status: StatusMail;
  sentDate: string;
  receivedDate?: string;
  actionLog?: actionLog;
  isOriginal: boolean;
}

interface officer {
  cuenta: string;
  fullname: string;
  jobtitle: string;
}

interface procedureProps {
  ref: string;
  code: string;
  reference: string;
  group: 'ExternalProcedure' | 'InternalProcedure';
}

interface actionLog {
  manager: string;
  description: string;
  date: string;
}
