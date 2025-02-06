import { Procedure, ProcedureProps } from './procedure.model';

export interface procurementDoc {
  reference: string;
  sender?: officer;
  recipient?: officer;
  via?:officer
  cite?: string;
  date?: Date;
}

interface officer {
  fullname: string;
  jobtitle: string;
}

interface item {
  code: string;
  name: string;
  ff: string;
  of: string;
  amount: number;
}

interface procurementProps extends ProcedureProps {
  _id: string;
  mode: string;
  aperturaProg: string;
  items: item[];
  type: string;
  descripcionAperturaProg: string;
  metodoAdjudicacion: string;
  formaAdjudicacion: string;
  price: string;
  deliveryTimeframe: string;
  deliveryLocation: string;
  warranty: string;
  reason: string;
  documents: procurementDoc[];
}

export class ProcurementProcedure extends Procedure {
  mode: string;
  aperturaProg: string;
  items: item[];
  type: string;
  descripcionAperturaProg: string;
  metodoAdjudicacion: string;
  formaAdjudicacion: string;
  price: string;
  deliveryTimeframe: string;
  deliveryLocation: string;
  warranty: string;
  reason: string;
  documents: procurementDoc[];

  constructor({
    mode,
    aperturaProg,
    items,
    type,
    descripcionAperturaProg,
    metodoAdjudicacion,
    formaAdjudicacion,
    price,
    deliveryTimeframe,
    deliveryLocation,
    warranty,
    reason,
    documents,
    ...procedureProps
  }: procurementProps) {
    super(procedureProps);
    this.mode = mode;
    this.aperturaProg = aperturaProg;
    this.items = items;
    this.type = type;
    this.descripcionAperturaProg = descripcionAperturaProg;
    this.metodoAdjudicacion = metodoAdjudicacion;
    this.formaAdjudicacion = formaAdjudicacion;
    this.price = price;
    this.deliveryTimeframe = deliveryTimeframe;
    this.deliveryLocation = deliveryLocation;
    this.warranty = warranty;
    this.reason = reason;
    this.documents = documents;
  }

  isPrintEnabled(index: number) {
    const document = this.documents[index];
    if (!document) return false;
    return Object.values(document).every((value) => value);
  }
}
