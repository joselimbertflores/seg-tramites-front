import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { Procedure } from '../../procedures/domain';
import { ProcedureReportTemplate, RouteSheetBuilder } from '../../helpers';

import {
  tableProcedureColums,
  tableProcedureData,
} from '../../reports/infrastructure';
import { workflow } from '../../communications/infrastructure';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
interface procedureListProps {
  title: string;
  datasource: tableProcedureData[];
  columns: tableProcedureColums[];
  filterParams: filterParams;
}

interface filterParams {
  params: Record<string, any>;
  labelsMap?: Record<string, string>;
  valuesMap?: Record<string, Record<string, string>>;
}

interface tableReportShetProps {
  title: string;
  datasource: object[];
  columns: {
    header: string;
    columnDef: string;
    width?: 'auto' | '*';
  }[];
  filterParams: filterParams;
}

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  routeSheet(procedure: Procedure, workflow: workflow[], isOriginal: boolean) {
    return new Observable<Blob>((observer) => {
      RouteSheetBuilder.build(procedure, workflow, isOriginal)
        .then((docDefinition) => {
          pdfMake.createPdf(docDefinition).getBlob((blob) => {
            observer.next(blob);
            observer.complete();
          });
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  async tableReportShet(config: tableReportShetProps) {
    const doc = await ProcedureReportTemplate.reportTable({
      rows: config.datasource,
      columns: config.columns,
      title: config.title,
      parameters: this.filtreAndTranslateParams(
        config.filterParams.params,
        config.filterParams.labelsMap,
        config.filterParams.valuesMap
      ),
    });
    pdfMake.createPdf(doc).print();
  }

  async procedureListSheet(config: procedureListProps) {
    const doc = await ProcedureReportTemplate.reportTable({
      rows: config.datasource,
      columns: config.columns,
      title: config.title,
      parameters: this.filtreAndTranslateParams(
        config.filterParams.params,
        config.filterParams.labelsMap
      ),
    });
    pdfMake.createPdf(doc).print();
  }

  private filtreAndTranslateParams(
    params: Object,
    labelMap?: Record<string, string>,
    valueMap?: Record<string, Record<string, string>>
  ) {
    return Object.entries(params)
      .filter((item) => item[1])
      .reduce((acc, [key, value]) => {
        const label = labelMap ? labelMap[key] ?? key : key;
        const valueTranslated =
          valueMap?.[key]?.[value] ?? this.toValueString(value);
        return {
          ...acc,
          [label]: valueTranslated,
        };
      }, {});
  }

  private toValueString(value: any): string {
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return 'objeto';
    if (!value) return '';
    return value;
  }
}
