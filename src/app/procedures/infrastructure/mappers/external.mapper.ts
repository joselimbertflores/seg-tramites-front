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
    ...props
  }: external): ExternalProcedure {
    return new ExternalProcedure({
      ...props,
      type: type.nombre,
      createdAt: new Date(createdAt),
      group: group as procedureGroup,
      state: state as procedureState,
    });
  }
}
