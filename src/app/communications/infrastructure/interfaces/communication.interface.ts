export interface communication {
  _id: string;
  sender: officer;
  recipient: officer;
  procedure: procedureProps;
  reference: string;
  attachmentsCount: string;
  internalNumber: string;
  status: string;
  sentDate: string;
  receivedDate?: string;
  actionLog?: actionLog;
  isOriginal: boolean;
}

interface officer {
  account: string;
  fullname: string;
  jobtitle: string;
}

interface procedureProps {
  ref: string;
  code: string;
  reference: string;
  group: string;
}

interface actionLog {
  fullname: string;
  description: string;
  date: string;
}
