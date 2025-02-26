import {
  ExternalProcedure,
  procedureGroup,
  procedureState,
} from '../../domain';
import { external } from '../interfaces/external.interface';

export class ExternalMapper {
  static fromResponse({
    group,
    state,
    type,
    createdAt,
    applicant,
    representative,
    ...props
  }: external): ExternalProcedure {
    return new ExternalProcedure({
      applicant: {
        fullname: [
          applicant.firstname,
          applicant.middlename,
          applicant.lastname,
        ]
          .filter((term) => term)
          .join(' '),
        type: applicant.type,
        phone: applicant.phone,
        dni: applicant.dni,
      },
      ...(representative && {
        representative: {
          fullname: [
            representative.firstname,
            representative.middlename,
            representative.lastname,
          ]
            .filter((term) => term)
            .join(' '),
          dni: representative.dni,
          phone: representative.phone,
        },
      }),
      ...props,
      type: type.nombre,
      createdAt: new Date(createdAt),
      group: group as procedureGroup,
      state: state as procedureState,
    });
  }
}
