import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { imageToBase64 } from '../image-base64.helper';

interface reportTableProps {
  title: string;
  rows: any[];
  columns: column[];
  parameters: Object;
}
interface column {
  header: string;
  columnDef: string;
  width?: 'auto' | '*';
}
export class ProcedureReportTemplate {
  static async reportTable( data: reportTableProps): Promise<TDocumentDefinitions> {
    const rightImage = await imageToBase64( 'images/institution/alcaldia.jpeg');
    const leftImage = await imageToBase64('images/institution/slogan.png');
    return {
      header: {
        alignment: 'center',
        margin: [10, 10, 10, 0],
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
      pageMargins: [30, 60, 40, 40],
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
                { text: `${key}:`, bold: true },
                value,
              ])
            : [[{ text: 'Sin parametros', colSpan: 2 }, '']]),
        ],
      },
    };
  }

  private static sectionResults({ columns, rows }: reportTableProps): Content {
    if (rows.length === 0) return { text: 'No se encontraron resultados.' };
    return {
      fontSize: 7,
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        dontBreakRows:true,
        widths: columns.map((column) => column.width ?? 'auto'),
        body: [
          [
            ...columns.map((colum) => ({
              text: colum.header.toUpperCase(),
              bold: true,
            })),
          ],
          ...rows.map((row) => columns.map((col) => [row[col.columnDef]])),
        ],
      },
    };
  }
}
