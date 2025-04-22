import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  tableProcedureColums,
  tableProcedureData,
} from '../../reports/infrastructure';

export interface reportProcedureSheetProps {
  title: string;
  datasource: tableProcedureData[];
  columns: tableProcedureColums[];
  parameters?: Record<string, any>;
}

export class ProcedureReportTemplates {
  static async reportProcedureSheet(
    data: reportProcedureSheetProps
  ): Promise<TDocumentDefinitions> {
    return {
      header: {
        columns: [
          //   {
          //     width: 120,
          //     image: await convertImageABase64(
          //       '../../../assets/img/gams/logo_alcaldia.jpeg'
          //     ),
          //   },
          {
            width: '*',
            text: [`\n${data.title}`.toUpperCase()],
            bold: true,
            fontSize: 14,
          },
          //   {
          //     width: 120,
          //     text: `${new Date().toLocaleString()}`,
          //     fontSize: 10,
          //     bold: true,
          //     alignment: 'left',
          //   },
        ],
        alignment: 'center',
        margin: [10, 10, 10, 10],
      },
      //   footer: {
      //     margin: [10, 0, 10, 0],
      //     fontSize: 8,
      //     text: `Generado por: ${manager}`,
      //   },
      pageSize: 'LETTER',
      pageOrientation: 'landscape',
      pageMargins: [30, 80, 40, 30],
      content: [
        // generateSectionParameters(props.parameters),
        this.sectionResults(data.datasource, data.columns),
      ],
    };
  }

  private static generateSectionParameters(
    params: Object | undefined
  ): Content {
    if (!params) return [];

    return {
      marginBottom: 20,
      fontSize: 9,
      layout: 'headerLineOnly',
      table: {
        headerRows: 1,
        widths: [100, '*'],
        body: [
          //   [{ text: 'PARAMETROS BUSQUEDA', bold: true, colSpan: 2 }, ''],
          //   ...(fields.length > 0
          //     ? fields.map(([key, value]) => [key.toUpperCase(), value])
          //     : [[{ text: 'Sin parametros', colSpan: 2 }, '']]),
        ],
      },
    };
  }

  private static sectionResults(
    results: tableProcedureData[],
    colums: tableProcedureColums[]
  ): Content {
    if (results.length === 0) {
      return { text: 'NO SE ENCONTRARON RESULTADOS', alignment: 'center' };
    }
    return {
      fontSize: 8,
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 2,
        widths: colums.map((column) => {
          switch (column.columnDef) {
            case 'code':
              return 100;
            case 'state':
              return 50;
            default:
              return '*';
          }
        }),
        body: [
          [
            ...colums.map((colum) => ({
              text: colum.header.toUpperCase(),
              bold: true,
            })),
          ],
          ...results.map((field) => {
            return colums.map((colum) => [field[colum.columnDef]]);
          }),
        ],
      },
    };
  }
}
