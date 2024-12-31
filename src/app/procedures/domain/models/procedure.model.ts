export interface ProcedureProps {
  _id: string;
  code: string;
  cite: string;
  numberOfDocuments: string;
  isSend: boolean;
  reference: string;
  account: string;
  group: procedureGroup;
  state: StateProcedure;
  createdAt: Date;
}

export interface OriginDetails {
  emitter: officer;
  receiver?: officer;
  phone?: string;
}

export enum procedureGroup {
  External = 'ExternalProcedure',
  Internal = 'InternalProcedure',
}

export enum StateProcedure {
  Inscrito = 'INSCRITO',
  Observado = 'OBSERVADO',
  Revision = 'EN REVISION',
  Concluido = 'CONCLUIDO',
  Anulado = 'ANULADO',
  Suspendido = 'SUSPENDIDO',
}

interface manager {
  id: string;
  officer?: officer;
}
interface officer {
  fullname: string;
  jobtitle?: string;
}

export abstract class Procedure {
  public readonly _id: string;
  public readonly code: string;
  public readonly group: procedureGroup;
  public readonly createdAt: Date;
  public readonly account: string;
  public readonly endDate?: Date;
  public state: StateProcedure;
  public cite: string;
  public reference: string;
  public numberOfDocuments: string;
  public isSend: boolean;

  constructor({
    _id,
    code,
    cite,
    account,
    state,
    reference,
    numberOfDocuments,
    isSend,
    createdAt,
    group,
  }: ProcedureProps) {
    this._id = _id;
    this.code = code;
    this.cite = cite;
    this.account = account;
    this.state = state;
    this.reference = reference;
    this.numberOfDocuments = numberOfDocuments;
    this.isSend = isSend;
    this.group = group;
    this.createdAt = createdAt;
    // if (endDate) this.endDate = new Date(endDate);
  }

  get citeCode() {
    if (this.cite === '') return 'S/C';
    return this.cite;
  }

  get isActionable(): boolean {
    return this.state === 'INSCRITO';
  }
}
