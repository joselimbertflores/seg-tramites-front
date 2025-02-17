export interface submissionData {
  communicationId?: string;
  attachmentsCount: string;
  isOriginal: boolean;
  procedure: procedureProps;
  cite?: string;
  replace?: boolean;
  mode: communicationMode;
}
interface procedureProps {
  id: string;
  code: string;
}

export type communicationMode = 'initiate' | 'forward' | 'resend';

export interface onlineAccount {
  id: string;
  userId: string;
  fullname: string;
  jobtitle: string;
  online: boolean;
}
export interface recipient extends onlineAccount {
  isOriginal: boolean;
}
