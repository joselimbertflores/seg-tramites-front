import {
  GroupProcedure,
  StateProcedure,
  StatusMail,
} from '../../../domain/models';

export interface communication {
  _id: string;
  sender: officer;
  recipient: officer;
  procedure: procedure;
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

interface procedure {
  _id: string;
  code: string;
  reference: string;
  group: 'ExternalProcedure' | 'InternalProcedure';
  state: StateProcedure;
}

interface actionLog {
  manager: string;
  description: string;
  date: string;
}
