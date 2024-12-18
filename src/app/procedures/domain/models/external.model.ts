import { Procedure, ProcedureProps } from './procedure.model';

interface ExternalProps extends ProcedureProps {
  type: any;
  applicant: applicant;
  representative?: representative;
  requirements: string[];
  pin: number;
}

interface applicant {
  firstname: string;
  phone: string;
  type: 'NATURAL' | 'JURIDICO';
  middlename?: string;
  lastname?: string;
  dni?: string;
}

interface representative {
  firstname: string;
  middlename: string;
  lastname: string;
  phone: string;
  dni: string;
}

export class ExternalProcedure extends Procedure implements ExternalProps {
  type: any;
  applicant: applicant;
  representative?: representative;
  requirements: string[];
  pin: number;

  constructor({
    applicant,
    representative,
    requirements,
    pin,
    ...procedureProps
  }: ExternalProps) {
    super(procedureProps);
    this.applicant = applicant;
    this.representative = representative;
    this.requirements = requirements;
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

  get fullnameApplicant() {
    return [
      this.applicant.firstname,
      this.applicant.middlename,
      this.applicant.lastname,
    ]
      .filter((term) => term)
      .join(' ');
  }

  get fullnameRepresentative() {
    return this.representative
      ? `${this.representative.firstname} ${this.representative.middlename} ${this.representative.lastname}`
      : 'Sin representante';
  }
}
