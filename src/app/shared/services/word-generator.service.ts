import { Injectable } from '@angular/core';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
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
                // new Paragraph({
                //   children: [
                //     new ImageRun({
                //       type: 'jpg',
                //       data: image,
                //       transformation: {
                //         width: 100,
                //         height: 100,
                //       },
                //     }),
                //     new ImageRun({
                //       type: 'jpg',
                //       data: image,
                //       transformation: {
                //         width: 100,
                //         height: 100,
                //       },
                //     }),
                //   ],
                // }),
                new Table({
                  margins: { left: 0, right: 0 },
                  columnWidths: [4505, 4505],
                  borders: TableBorders.NONE,
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          width: {
                            size: 4505,
                            type: WidthType.DXA,
                          },
                          children: [
                            new Paragraph({
                              children: [
                                new ImageRun({
                                  type: 'jpg',
                                  data: leftImage,
                                  transformation: {
                                    width: 250,
                                    height: 100,
                                  },
                                }),
                              ],
                              alignment: AlignmentType.LEFT,
                            }),
                          ],
                        }),
                        new TableCell({
                          width: {
                            size: 4505,
                            type: WidthType.DXA,
                          },
                          children: [
                            new Paragraph({
                              children: [
                                new ImageRun({
                                  type: 'jpg',
                                  data: rightImage,
                                  transformation: {
                                    width: 100,
                                    height: 100,
                                  },
                                }),
                              ],
                              alignment: AlignmentType.RIGHT,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [new Paragraph('Footer text')],
            }),
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
            }),

            new Table({
              columnWidths: [2000, 4000, 4000],
              borders: TableBorders.NONE,
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 2000, type: WidthType.DXA }, // 20%
                      children: [new Paragraph('Hello')],
                    }),
                    new TableCell({
                      width: { size: 4000, type: WidthType.DXA }, // 20%
                      children: [
                        new Paragraph(
                          'Amet cillum consequat duis cupidatat aute ea consectetur duis aliquip mollit nisi Lorem mollit.'
                        ),
                      ],
                    }),
                    new TableCell({
                      width: { size: 4000, type: WidthType.DXA }, // 20%
                      children: [
                        new Paragraph(
                          'Amet cillum consequat duis cupidatat aute ea consectetur duis aliquip mollit nisi Lorem mollit.'
                        ),
                      ],
                    }),
                  ],
                }),
              ],
            }),
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
