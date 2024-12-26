export interface submissionDialogData {
  communicationId?: string;
  attachmentsCount: string;
  isOriginal: boolean;
  procedure: procedureProps;
  cite?: string;
  isResend?: boolean; // * for sent from outbox
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

// ademas esa interfaz tendra una nueva propiedad. esta servira para diferenciar si se realizara el envio desde bandeja de entrada o salida. Cuando es de salida puede que se este creando un nuevo envio o puede que se este reenviando un rechazado. Como llamaraia a esta propiedad?
