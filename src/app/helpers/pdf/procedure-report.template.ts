import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { imageToBase64 } from '../image-base64.helper';

interface tableProps {
  title: string;
  dataSource: any[];
  parameters?: Object;
  displayColumns: column[];
}
interface column {
  header: string;
  columnDef: string;
  width?: 'auto' | '*' | number;
}
export class ProcedureReportTemplate {
  static async reportTable(data: tableProps, userName?:string): Promise<TDocumentDefinitions> {
    const { title, dataSource, displayColumns, parameters } = data;

    const rightImage = await imageToBase64('images/institution/alcaldia.jpeg');
    const leftImage = await imageToBase64('images/institution/slogan.png');

    const parametersList = parameters ? Object.entries(parameters) : null;

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
            text: [
              { text: 'Sistema de Seguimiento de Tramites' },
              { text: `\n${title}`, fontSize: 14, bold: true },
            ],
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
                { text: `Generado por: ${userName ?? "Desconocido"}` },
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
        ...(parametersList
          ? [
              {
                text: 'Parametros busqueda:',
                style: 'subtitle',
              },
              {
                fontSize: 9,
                layout: 'noBorders',
                table: {
                  widths: [100, '*'],
                  body: [
                    ...(parametersList.length > 0
                      ? parametersList.map(([key, value]) => [
                          { text: `${key}:`, bold: true },
                          value,
                        ])
                      : [[{ text: 'Sin parametros', colSpan: 2 }, '']]),
                  ],
                },
              },
            ]
          : []),
        {
          text: 'Resultados:',
          style: 'subtitle',
        },
        ...(dataSource.length > 0
          ? [
              {
                fontSize: 7,
                layout: 'lightHorizontalLines',
                table: {
                  headerRows: 1,
                  dontBreakRows: true,
                  widths: displayColumns.map(
                    (column) => column.width ?? 'auto'
                  ),
                  body: [
                    [
                      ...displayColumns.map((colum) => ({
                        text: colum.header.toUpperCase(),
                        bold: true,
                      })),
                    ],
                    ...dataSource.map((row) =>
                      displayColumns.map((col) => [row[col.columnDef]])
                    ),
                  ],
                },
              },
            ]
          : [{ text: 'No se encontraron resultados.' }]),
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
}
