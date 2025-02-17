export interface submissionDialogData {
  communicationId?: string;
  attachmentsCount: string;
  isOriginal: boolean;
  procedure: procedureProps;
  cite?: string;
  isResend?: boolean; // * for sent from outbox and disable original button
  allowAttachDocument?: boolean; // * for display select attach document
  mode: 'initial' | 'forward' | 'resend';
}

interface procedureProps {
  id: string;
  code: string;
}

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
