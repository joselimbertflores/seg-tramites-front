import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import {
  tableProcedureColums,
  tableProcedureData,
} from '../../reports/infrastructure';
import { convertImageBase64 } from '../image_base64';

interface reportTableProps {
  title: string;
  datasource: Record<string, string | number>[];
  columns: column[];
  parameters: Record<string, any>;
}
interface column {
  header: string;
  columnDef: string;
  width?: string;
}
export class ProcedureReportTemplate {
  static async reportTable(
    data: reportTableProps
  ): Promise<TDocumentDefinitions> {
    // text: `${new Date().toLocaleString()}`,
    const rightImage = await convertImageBase64(
      'images/institution/alcaldia.jpeg'
    );
    const leftImage = await convertImageBase64('images/institution/slogan.png');
    return {
      header: {
        alignment: 'center',
        margin: [20, 20, 20, 20],
        columns: [
          {
            width: 120,
            image: rightImage,
            alignment: 'left',
          },
          {
            width: '*',
            text: [{ text: `\n${data.title}` }],
            bold: true,
            fontSize: 14,
          },
          {
            width: 120,
            image: leftImage,
            alignment: 'right',
          },
        ],
      },
      footer: function (currentPage, pageCount) {
        return {
          margin: [20, 0, 20, 20],
          fontSize: 8,
          columns: [
            {
              stack: [
                { text: 'Generado por Juan Perez' },
                { text: `Fecha: ${new Date().toLocaleString()}` },
              ],
              alignment: 'left',
            },
            {
              text: `Pagina ${currentPage} de ${pageCount}`,
              alignment: 'right',
            },
          ],
        };
      },
      pageSize: 'LETTER',
      pageOrientation: 'landscape',
      pageMargins: [30, 90, 40, 30],
      content: [
        {
          text: 'Parametros busqueda:',
          style: 'subtitle',
        },
        this.sectionParameters(data.parameters),
        {
          text: 'Resultados:',
          style: 'subtitle',
        },
        // {
        //   table: {
        //     widths: 'auto',
        //     body: [[{text:'', wid}]],
        //   },
        // },
        this.sectionResults(data),
      ],
      styles: {
        subtitle: {
          bold: true,
          fontSize: 10,
          margin: [0, 20, 0, 5],
        },
      },
    };
  }

  private static sectionParameters(params: Object): Content {
    const fields = Object.entries(params);
    return {
      fontSize: 9,
      layout: 'noBorders',
      table: {
        widths: [100, '*'],
        body: [
          ...(fields.length > 0
            ? fields.map(([key, value]) => [
                { text: `${key.toUpperCase()}:`, bold: true },
                value,
              ])
            : [[{ text: 'Sin parametros', colSpan: 2 }, '']]),
        ],
      },
    };
  }

  private static sectionResults({columns, datasource}: reportTableProps): Content {
    if (datasource.length === 0) return { text: 'No se encontraron resultados.' };
    return {
      fontSize: 8,
      layout: 'lightHorizontalLines',
      table: {
        // widths: 'auto',
        // widths: columns.map((column) => {
        //   switch (column.columnDef) {
        //     case 'code':
        //       return 100;
        //     case 'state':
        //       return 50;
        //     default:
        //       return '*';
        //   }
        // }),
        body: [
          [
            ...columns.map((colum) => ({
              text: colum.header.toUpperCase(),
              bold: true,
            })),
          ],
          ...datasource.map((field) =>
            columns.map((col) => [field[col.columnDef]])
          ),
        ],
      },
    };
  }
}
