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
    createdAt,
    ...props
  }: external): ExternalProcedure {
    return new ExternalProcedure({
      ...props,
      type: type.nombre,
      createdAt: new Date(createdAt),
      group: group as GroupProcedure,
      state: state as StateProcedure,
    });
  }
}
