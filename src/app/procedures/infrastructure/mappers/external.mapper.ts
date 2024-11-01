import {
  ExternalProcedure,
  GroupProcedure,
  StateProcedure,
} from '../../domain';
import { external } from '../interfaces/external.interface';

export class ExternalMapper {
  static fromResponse({
    group,
    state,
    type,
    ...props
  }: external): ExternalProcedure {
    return new ExternalProcedure({
      ...props,
      type: type.nombre,
      group: group as GroupProcedure,
      state: state as StateProcedure,
    });
  }
}
