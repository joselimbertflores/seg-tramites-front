import { Injectable } from '@angular/core';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
  WidthType,
} from 'docx';

import { doc } from '../../communications/infrastructure';
import { convertImageABase64 } from '../../helpers';

@Injectable({
  providedIn: 'root',
})
export class WordGeneratorService {
  constructor() {}

  async generateDocument(item: doc) {
    const leftImage = await convertImageABase64(
      'images/institution/alcaldia.jpeg'
    );
    const rightImage = await convertImageABase64(
      'images/institution/sacaba.jpeg'
    );
    const docx = new Document({
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      type: 'jpg',
                      data: leftImage,
                      transformation: {
                        width: 200,
                        height: 80,
                      },
                      floating: {
                        horizontalPosition: {
                          relative: HorizontalPositionRelativeFrom.MARGIN,
                          align: HorizontalPositionAlign.LEFT,
                        },
                        verticalPosition: {
                          relative: VerticalPositionRelativeFrom.PARAGRAPH,
                          align: VerticalPositionAlign.TOP,
                        },
                      },
                    }),
                    new ImageRun({
                      type: 'jpg',
                      data: rightImage,
                      transformation: {
                        width: 80,
                        height: 80,
                      },
                      floating: {
                        horizontalPosition: {
                          relative:
                            HorizontalPositionRelativeFrom.OUTSIDE_MARGIN,
                          align: HorizontalPositionAlign.RIGHT,
                        },
                        verticalPosition: {
                          relative: VerticalPositionRelativeFrom.PARAGRAPH,
                          align: VerticalPositionAlign.TOP,
                        },
                      },
                    }),
                  ],
                }),
              ],
            }),
          },
          properties: {
            page: {
              size: {
                width: 12240, // 8.5 pulgadas en 1/72 de pulgada
                height: 15840, // 11 pulgadas en 1/72 de pulgada
              },
            },
          },
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: this._getTitleDocument(item.type),
                  bold: true,
                  color: '000000',
                }),
              ],
            }),
            new Paragraph({
              text: `Nº CITE: ${item.cite}`,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400,
              },
            }),
            new Table({
              columnWidths: [1000, 3500, 4500],
              borders: TableBorders.NONE,
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 1000, type: WidthType.DXA }, // 20%
                      children: [new Paragraph('A  :')],
                    }),
                    new TableCell({
                      width: { size: 3500, type: WidthType.DXA }, // 20%
                      children: [new Paragraph(item.sender.fullname)],
                    }),
                    new TableCell({
                      width: { size: 4500, type: WidthType.DXA }, // 20%
                      children: [new Paragraph(item.sender.jobtitle)],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 1000, type: WidthType.DXA }, // 20%
                      children: [new Paragraph('DE  :')],
                    }),
                    new TableCell({
                      width: { size: 3500, type: WidthType.DXA }, // 20%
                      children: [new Paragraph(item.sender.fullname)],
                    }),
                    new TableCell({
                      width: { size: 4500, type: WidthType.DXA }, // 20%
                      children: [new Paragraph(item.sender.jobtitle)],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 1000, type: WidthType.DXA }, // 20%
                      children: [new Paragraph('MOTIVO:')],
                    }),
                    new TableCell({
                      width: { size: 8000, type: WidthType.DXA }, // 20%
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: item.reference, bold: true }),
                          ],
                        }),
                      ],
                      rowSpan: 2,
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 1000, type: WidthType.DXA }, // 20%
                      children: [new Paragraph('FECHA :')],
                    }),
                    new TableCell({
                      rowSpan: 2,
                      width: { size: 8000, type: WidthType.DXA }, // 20%
                      children: [new Paragraph(item.sender.fullname)],
                    }),
                  ],
                }),
              ],
            }),
            // Línea de división
            new Paragraph({
              border: {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 4, // Grosor de la línea
                  space: 1, // Espacio entre la línea y el texto
                },
              },
            }),

            new Paragraph('Contenidno'),
          ],
        },
      ],
    });

    // Generar el archivo y descargarlo
    Packer.toBlob(docx).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Instructivo.docx';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    });
  }

  // Función para crear filas de tabla
  createTableRow(label: string, content: string): TableRow {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: `${label} :` })],
          borders: { top: { style: BorderStyle.NONE, size: 0 } },
        }),
        new TableCell({
          children: [new Paragraph({ text: content })],
          borders: { top: { style: BorderStyle.NONE, size: 0 } },
        }),
      ],
    });
  }

  private _getTitleDocument(docType: string): string {
    switch (docType) {
      case 'CI':
        return 'COMUNICACION INTERNA';
      case 'CE':
        return 'COMUNICACION EXTERNA';
      case 'CIR':
        return 'CIRCULAR';
      case 'MEM':
        return 'MEMORANDUM';

      default:
        return 'DESCONOCIDO';
    }
  }
}
