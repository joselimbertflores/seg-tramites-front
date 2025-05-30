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
  labelsMap: Record<string, string>;
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
    map: Record<string, string>
  ) {
    return Object.entries(params)
      .filter((item) => item[1])
      .reduce(
        (acc, [key, value]) => ({
          [map[key] ? map[key] : key]: this.toValueString(value),
          ...acc,
        }),
        {}
      );
  }

  private toValueString(value: any): string {
    if (value instanceof Date) return value.toLocaleDateString();
    return value;
  }
}
