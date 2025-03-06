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
    representative,
    ...props
  }: external): ExternalProcedure {
    return new ExternalProcedure({
      ...(representative && {
        representative: representative,
      }),
      ...props,
      type: type.nombre,
      createdAt: new Date(createdAt),
      group: group as procedureGroup,
      state: state as procedureState,
    });
  }
}
