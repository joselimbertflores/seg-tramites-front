import { GroupProcedure, StateProcedure } from '../../domain';
import { InternalProcedure } from '../../domain/models/internal.model';
import { internal } from '../interfaces/internal.interface';

export class InternalMapper {
  static fromResponse({
    group,
    state,
    createdAt,
    type,
    ...props
  }: internal): InternalProcedure {
    return new InternalProcedure({
      ...props,
      type: type.nombre,
      createdAt: new Date(createdAt),
      group: group as GroupProcedure,
      state: state as StateProcedure,
    });
  }
}
