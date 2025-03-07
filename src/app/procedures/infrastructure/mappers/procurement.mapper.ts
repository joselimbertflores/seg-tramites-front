import { procedureGroup, procedureState } from '../../domain';
import { ProcurementProcedure } from '../../domain/models/procurement.model';
import { procurement } from '../interfaces/procurement.interface';

export class ProcurementMapper {
  static fromResponse({
    createdAt,
    state,
    group,
    documents,
    price,
    ...props
  }: procurement): ProcurementProcedure {
    return new ProcurementProcedure({
      createdAt: new Date(createdAt),
      state: state as procedureState,
      group: group as procedureGroup,
      price: +price,
      documents: documents
        ? documents.map(({ date, ...props }) => ({
            ...(date && { date: new Date(date) }),
            ...props,
          }))
        : [],
      ...props,
    });
  }
}
