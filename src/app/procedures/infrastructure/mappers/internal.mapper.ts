import { procedureGroup, procedureState } from '../../domain';
import { InternalProcedure } from '../../domain/models/internal.model';
import { internal } from '../interfaces/internal.interface';

export class InternalMapper {
  static fromResponse({
    group,
    state,
    createdAt,
    ...props
  }: internal): InternalProcedure {
    return new InternalProcedure({
      ...props,
      createdAt: new Date(createdAt),
      group: group as procedureGroup,
      state: state as procedureState,
    });
  }
}
