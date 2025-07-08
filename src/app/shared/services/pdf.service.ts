import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import {
  buildUnlinkSheet,
  ProcedureReportTemplate,
  RouteSheetBuilder,
} from '../../helpers';
import { workflow } from '../../communications/infrastructure';
import { Procedure } from '../../procedures/domain';
import { unlinkDataResponse } from '../../reports/infrastructure';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface filterParams {
  params: Record<string, any>;
  labelsMap?: Record<string, string>;
  valuesMap?: Record<string, Record<string, string>>;
}

interface tableReportShetProps {
  title: string;
  dataSource: object[];
  displayColumns: displayColumns[];
  filterParams?: filterParams;
}

interface displayColumns {
  header: string;
  columnDef: string;
  width?: 'auto' | '*' | number;
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

  tableSheet({ filterParams, ...props }: tableReportShetProps) {
    return new Observable<pdfMake.TCreatedPdf>((observer) => {
      ProcedureReportTemplate.reportTable({
        ...props,
        ...(filterParams && {
          parameters: this.filtreAndTranslateParams(filterParams),
        }),
      })
        .then((docDefinition) => {
          const pdf = pdfMake.createPdf(docDefinition);
          observer.next(pdf);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  unlinkSheet(data: unlinkDataResponse) {
    return new Observable<pdfMake.TCreatedPdf>((observer) => {
      buildUnlinkSheet(data)
        .then((docDefinition) => {
          const pdf = pdfMake.createPdf(docDefinition);
          observer.next(pdf);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  private filtreAndTranslateParams(params: filterParams) {
    const { labelsMap, valuesMap } = params;
    return Object.entries(params)
      .filter((item) => item[1])
      .reduce((acc, [key, value]) => {
        const label = labelsMap ? labelsMap[key] ?? key : key;
        const translated =
          valuesMap?.[key]?.[value] ?? this.toValueString(value);
        return {
          ...acc,
          [label]: translated,
        };
      }, {});
  }

  private toValueString(value: any): string {
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return '{}';
    if (!value) return '';
    return value;
  }
}
