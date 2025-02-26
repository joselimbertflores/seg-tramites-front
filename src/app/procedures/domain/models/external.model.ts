import { Procedure, ProcedureProps } from './procedure.model';

interface ExternalProps extends ProcedureProps {
  type: string;
  applicant: applicant;
  representative?: representative;
  requirements: string[];
  pin: number;
}

interface applicant {
  fullname: string;
  phone: string;
  dni?: string;
  type: 'NATURAL' | 'JURIDICO';
}

interface representative {
  fullname: string;
  phone: string;
  dni: string;
}

export class ExternalProcedure extends Procedure implements ExternalProps {
  type: string;
  applicant: applicant;
  representative?: representative;
  requirements: string[];
  pin: number;

  constructor({
    applicant,
    representative,
    requirements,
    pin,
    type,
    ...procedureProps
  }: ExternalProps) {
    super(procedureProps);
    this.applicant = applicant;
    this.representative = representative;
    this.requirements = requirements;
    this.type = type;
    this.pin = pin;
  }

  public copyWith(modifyObject: {
    [P in keyof this]?: this[P];
  }): ExternalProcedure {
    return Object.assign(Object.create(ExternalProcedure.prototype), {
      ...this,
      ...modifyObject,
    });
  }
}
