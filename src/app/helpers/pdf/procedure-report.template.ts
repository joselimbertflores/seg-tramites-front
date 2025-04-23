import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  tableProcedureColums,
  tableProcedureData,
} from '../../reports/infrastructure';
import { convertImageABase64 } from '../image_base64';
import { text } from 'd3';

interface reportTableProps {
  title: string;
  datasource: any;
  columns: any[];
  parameters: Record<string, any>;
}

export class ProcedureReportTemplate {
  static async reportTable(
    data: reportTableProps
  ): Promise<TDocumentDefinitions> {
    // text: `${new Date().toLocaleString()}`,
    const rightImage = await convertImageABase64(
      'images/institution/alcaldia.jpeg'
    );
    const leftImage = await convertImageABase64(
      'images/institution/slogan.png'
    );
    return {
      header: {
        columns: [
          {
            width: 120,
            image: rightImage,
            alignment: 'right',
          },
          {
            width: '*',
            text: [
              { text: 'Hoja de reporte' },
              { text: `\n${data.title}`.toUpperCase() },
            ],
            bold: true,
            fontSize: 14,
          },
          {
            width: 120,
            image: leftImage,
          },
        ],
        alignment: 'center',
        margin: [20, 20, 20, 20],
      },
      footer: {
        margin: [10, 0, 10, 0],
        fontSize: 8,
        columns: [{ text: 'text' }, { text: new Date().toLocaleString() }],
      },
      pageSize: 'LETTER',
      pageOrientation: 'landscape',
      pageMargins: [30, 80, 40, 30],
      content: [
        this.sectionParameters(data.parameters),
        this.sectionResults(data.datasource, data.columns),
      ],
    };
  }

  private static sectionParameters(params: Object): Content {
    const fields = Object.entries(params);
    return {
      marginBottom: 20,
      fontSize: 9,
      layout: 'headerLineOnly',
      table: {
        headerRows: 1,
        widths: [100, '*'],
        body: [
          [{ text: 'PARAMETROS BUSQUEDA', bold: true, colSpan: 2 }, ''],
          ...(fields.length > 0
            ? fields.map(([key, value]) => [key.toUpperCase(), value])
            : [[{ text: 'Sin parametros', colSpan: 2 }, '']]),
        ],
      },
    };
  }

  private static sectionResults(
    results: tableProcedureData[],
    columns: tableProcedureColums[]
  ): Content {
    if (results.length === 0) {
      return { text: 'NO SE ENCONTRARON RESULTADOS', alignment: 'center' };
    }
    return {
      fontSize: 8,
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 2,
        widths: columns.map((column) => {
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
            ...columns.map((colum) => ({
              text: colum.header.toUpperCase(),
              bold: true,
            })),
          ],
          ...results.map((field) => {
            return columns.map((colum) => [field[colum.columnDef]]);
          }),
        ],
      },
    };
  }
}
