import { Injectable } from '@angular/core';

import { TDocumentDefinitions } from 'pdfmake/interfaces';

import { Procedure } from '../../procedures/domain';
import { Communication } from '../../communications/domain';
import { PdfTemplates, ProcedureReportTemplate } from '../../helpers';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  reportTableSheetProps,
  tableProcedureColums,
  tableProcedureData,
} from '../../reports/infrastructure';
import { communication, workflow } from '../../communications/infrastructure';
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
  constructor() {}

  async testRouteMaop(procedure: Procedure, workflow: workflow[]) {
    const re = this.buildPaths(workflow);
    const ress = [];
    for (const element of re) {
      const docDefinition: TDocumentDefinitions = {
        pageSize: 'LETTER',
        pageMargins: [30, 30, 30, 30],
        content: await PdfTemplates.routeMap2(procedure, element),
        footer: {
          margin: [10, 0, 10, 0],
          fontSize: 7,
          pageBreak: 'after',
          text: [
            {
              text: 'NOTA: Esta hoja de ruta de correspondencia, no debera ser separada ni extraviada del documento del cual se encuentra adherida, por constituirse parte indivisible del mismo',
              bold: true,
            },
            {
              text: '\nDireccion: Plaza 6 de agosto E-0415 - Telefono: No. Piloto 4701677 - 4702301 - 4703059 - Fax interno: 143',
              color: '#BC6C25',
            },
            {
              text: '\nE-mail: info@sacaba.gob.bo - Pagina web: www.sacaba.gob.bo',
              color: '#BC6C25',
            },
          ],
        },
        styles: {
          cabecera: {
            margin: [0, 0, 0, 2],
          },
          header: {
            fontSize: 10,
            bold: true,
          },
          tableExample: {
            fontSize: 8,
            alignment: 'center',
            margin: [0, 0, 0, 5],
          },
          selection_container: {
            fontSize: 7,
            alignment: 'center',
            margin: [0, 10, 0, 0],
          },
        },
      };
      const pdfBlob = await this.generatePdfBlob(docDefinition);
      ress.push(pdfBlob);
      // const pdfUrl = URL.createObjectURL(pdfBlob);
      // ress.push(pdfUrl);
    }

    return ress;
  }

  async generateRouteSheet(procedure: Procedure, workflow: workflow[]) {
    const re = this.buildPaths(workflow);
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [30, 30, 30, 30],
      content: await PdfTemplates.routeMap(procedure, re),
      footer: {
        margin: [10, 0, 10, 0],
        fontSize: 7,
        pageBreak: 'after',
        text: [
          {
            text: 'NOTA: Esta hoja de ruta de correspondencia, no debera ser separada ni extraviada del documento del cual se encuentra adherida, por constituirse parte indivisible del mismo',
            bold: true,
          },
          {
            text: '\nDireccion: Plaza 6 de agosto E-0415 - Telefono: No. Piloto 4701677 - 4702301 - 4703059 - Fax interno: 143',
            color: '#BC6C25',
          },
          {
            text: '\nE-mail: info@sacaba.gob.bo - Pagina web: www.sacaba.gob.bo',
            color: '#BC6C25',
          },
        ],
      },
      styles: {
        cabecera: {
          margin: [0, 0, 0, 2],
        },
        header: {
          fontSize: 10,
          bold: true,
        },
        tableExample: {
          fontSize: 8,
          alignment: 'center',
          margin: [0, 0, 0, 5],
        },
        selection_container: {
          fontSize: 7,
          alignment: 'center',
          margin: [0, 10, 0, 0],
        },
      },
    };
    pdfMake.createPdf(docDefinition).print();
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

  buildPaths(communications: workflow[]): workflow[][] {
    const byId = new Map<string, workflow>();
    const childrenMap = new Map<string, string[]>();

    // Paso 1: indexar por ID y construir mapa de hijos
    for (const comm of communications) {
      const id = comm._id;
      byId.set(id, comm);

      const parentId = comm?.parentId;
      if (parentId) {
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId)!.push(id);
      }
    }

    // Paso 2: encontrar raíces (sin parentId)
    const roots = communications.filter((c) => !c.parentId).map((c) => c._id);

    const paths: workflow[][] = [];

    // Paso 3: DFS con detección de ciclos
    function dfs(currentId: string, path: workflow[], visited: Set<string>) {
      if (visited.has(currentId)) {
        console.warn(`🚨 Ciclo detectado en ID: ${currentId}`);
        return;
      }

      const current = byId.get(currentId);
      if (!current) return;

      path.push(current);
      visited.add(currentId);

      const children = childrenMap.get(currentId);
      if (!children || children.length === 0) {
        paths.push([...path]); // Es hoja
      } else {
        for (const childId of children) {
          dfs(childId, path, visited);
        }
      }

      path.pop();
      visited.delete(currentId); // necesario para permitir otras ramas
    }

    // Paso 4: iniciar recorrido desde cada raíz
    for (const rootId of roots) {
      dfs(rootId, [], new Set());
    }

    return paths;
  }

  generatePdfBlob(docDefinition: any): Promise<Blob> {
    return new Promise((resolve) => {
      pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
        resolve(blob);
      });
    });
  }
}
