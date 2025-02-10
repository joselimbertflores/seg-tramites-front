import {
  AlignmentType,
  BorderStyle,
  Document,
  FileChild,
  Footer,
  Header,
  HeadingLevel,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
  WidthType,
} from 'docx';
import { convertImageABase64 } from './image_base64';
import { ProcurementProcedure } from '../procedures/domain';
import { numberToText } from './numer_to_text.helper';

interface communicationProps {
  from: officer;
  via: officer[];
  to: officer[];
  referenec: string;
  date?: Date;
}
interface officer {
  fullname: string;
  jobtitle: string;
}

export class DocxTemplates {
  static async document_solicitudInicioContratacion(
    procedure: ProcurementProcedure,
    index: number
  ) {
    const {
      cite = '',
      sender = { fullname: '', jobtitle: '' },
      recipient = { fullname: '', jobtitle: '' },
      via,
      date,
      reference,
    } = procedure.documents[index];

    const docx = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'defaultStyle',
            name: 'Default Style',
            basedOn: 'Normal',
            run: {
              size: 18,
            },
          },
        ],
      },
      sections: [
        {
          headers: {
            default: await this.heeader(),
          },
          footers: {
            default: this.footer(),
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
            ...this._section_title('COMUNICACIÓN INTERNA', cite),
            ...this._section_properties({
              from: sender,
              via: [...(via ? [via] : [])],
              to: [recipient],
              referenec: reference,
              date: date,
            }),
            ...this._section_content_solicitudInicioProceso(procedure),
          ],
        },
      ],
    });
    return docx;
  }

  static async document_solicitudCertificacionPoa(
    procedure: ProcurementProcedure,
    documentIndex: number
  ) {
    const {
      cite = '',
      sender = { fullname: '', jobtitle: '' },
      recipient = { fullname: '', jobtitle: '' },
      via,
      date,
      reference,
    } = procedure.documents[documentIndex];

    const docx = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'defaultStyle',
            name: 'Default Style',
            basedOn: 'Normal',
            run: {
              size: 18,
            },
          },
        ],
      },
      sections: [
        {
          headers: {
            default: await this.heeader(),
          },
          footers: {
            default: this.footer(),
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
            ...this._section_title('COMUNICACIÓN INTERNA', cite),
            ...this._section_properties({
              from: sender,
              via: [...(via ? [via] : [])],
              to: [recipient],
              referenec: reference,
              date: date,
            }),
            ...this._section_content_solicitudCertificacionPoa(procedure),
          ],
        },
      ],
    });
    return docx;
  }

  static async document_solicitudCertificacionPresupuestaria(
    procedure: ProcurementProcedure,
    documentIndex: number
  ) {
    const {
      cite = '',
      sender = { fullname: '', jobtitle: '' },
      recipient = { fullname: '', jobtitle: '' },
      via,
      date,
      reference,
    } = procedure.documents[documentIndex];
    const docx = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'defaultStyle',
            name: 'Default Style',
            basedOn: 'Normal',
            run: {
              size: 18,
            },
          },
        ],
      },
      sections: [
        {
          headers: {
            default: await this.heeader(),
          },
          footers: {
            default: this.footer(),
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
            ...this._section_title('COMUNICACIÓN INTERNA', cite),
            ...this._section_properties({
              from: sender,
              via: [...(via ? [via] : [])],
              to: [recipient],
              referenec: `SOLICITUD DE CERTIFICACION PRESUPUESTARIA PARA ${procedure.reference.toUpperCase()}`,
              date: date,
            }),
            ...this._section_content_solicitudCertificacionPresupuestaria(procedure),
          ],
        },
      ],
    });
    return docx;
  }

  private static async heeader(): Promise<Header> {
    const leftImage = await convertImageABase64(
      'images/institution/alcaldia.jpeg'
    );
    const rightImage = await convertImageABase64(
      'images/institution/sacaba.jpeg'
    );
    return new Header({
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
                  relative: HorizontalPositionRelativeFrom.OUTSIDE_MARGIN,
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
    });
  }

  private static footer(): Footer {
    return new Footer({
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'aaa', size: 14 })],
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Cc. Arch.', size: 14 })],
        }),
      ],
    });
  }

  private static _section_title(title: string, cite: string): FileChild[] {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: title,
            bold: true,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        text: `Nº CITE: ${cite}`,
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 200,
          after: 400,
        },
      }),
      new Table({
        borders: TableBorders.NONE,
        columnWidths: [15, 40, 45],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [],
      }),
    ];
  }

  private static _section_properties({
    from,
    to,
    via,
    referenec,
    date,
  }: communicationProps) {
    const created = date
      ? date.toLocaleString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';
    return [
      new Table({
        borders: TableBorders.NONE,
        columnWidths: [15, 40, 45],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          ...to.map((recipient) =>
            this._communicatioPropsRow(
              'A:',
              recipient.fullname,
              recipient.jobtitle
            )
          ),
          ...via.map((recipient) =>
            this._communicatioPropsRow(
              'VIA:',
              recipient.fullname,
              recipient.jobtitle
            )
          ),
          this._communicatioPropsRow('DE:', from.fullname, from.jobtitle),
          this._communicatioPropsRow('MOTIVO:', referenec),
          this._communicatioPropsRow('FECHA', `Sacaba, ${created}`),
        ],
      }),
      new Paragraph({
        spacing: {
          after: 200,
        },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 4,
            space: 1,
          },
        },
      }),
    ];
  }

  private static _section_content_solicitudInicioProceso(
    procedure: ProcurementProcedure
  ): FileChild[] {
    return [
      new Paragraph({
        text: 'De mi mayor consideración:',
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Por medio de la presente tengo a bien solicitar a su autoridad se viabilice el inicio de proceso ${procedure.mode} ${procedure.descripcionAperturaProg} (${procedure.reference}). `,
        alignment: AlignmentType.JUSTIFIED,
        spacing: {
          after: 200,
        },
      }),
      new Paragraph({
        text: procedure.reason,
        alignment: AlignmentType.JUSTIFIED,
        spacing: {
          after: 400,
        },
      }),
      new Paragraph({
        text: 'Sin otro particular, me despido con las consideraciones más distinguidas.',
        spacing: {
          after: 400,
        },
      }),
      new Paragraph({
        text: 'Atentamente',
      }),
    ];
  }

  private static _section_content_solicitudCertificacionPoa(
    procedure: ProcurementProcedure
  ): FileChild[] {
    const formattedPrice = this._formatNumberToPrice(procedure.price);
    const textAmount = numberToText(procedure.price);
    return [
      new Paragraph({
        text: 'De mi mayor consideración:',
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun(
            'Por medio de la presente tengo a bien solicitar mediante la unidad que corresponda la '
          ),
          new TextRun({ text: 'CERTIFICACION P.O.A., ', bold: true }),
          new TextRun(
            `del proceso de contratación ${procedure.descripcionAperturaProg} (${procedure.reference}) con cargo a la apertura programática ${procedure.aperturaProg} ${procedure.descripcionAperturaProg}, por el monto de Bs. ${formattedPrice} (${textAmount} bolivianos), como se detalla a continuación:`
          ),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: {
          after: 200,
        },
      }),
      new Table({
        borders: TableBorders.NONE,
        columnWidths: [5, 20, 30, 15, 5, 7, 18],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                width: { size: 5, type: WidthType.DXA },
                children: [new Paragraph({ text: 'N°', alignment: 'center' })],
              }),
              new TableCell({
                width: { size: 20, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'APERTURA PROGRAMATICA',
                        bold: true,
                        size: 18,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 30, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'DESCRIPCION APERTURA PROGRAMATIC',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 15, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'OBJETO DE GASTO',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 5, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'FF',
                        bold: true,
                        size: 16,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 7, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'OF',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 18, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'PRECIO REFERENCIAL (BS)',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          ...procedure.items.map((item, index) => {
            const formattedItemPrice = this._formatNumberToPrice(item.amount);
            return new TableRow({
              children: [
                ...(index === 0
                  ? [
                      new TableCell({
                        rowSpan: procedure.items.length,
                        children: [new Paragraph({ text: '1' })],
                      }),
                      new TableCell({
                        rowSpan: procedure.items.length,
                        children: [
                          new Paragraph({
                            text: procedure.aperturaProg,
                            alignment: 'center',
                          }),
                        ],
                      }),
                      new TableCell({
                        rowSpan: procedure.items.length,
                        children: [
                          new Paragraph({
                            text: procedure.descripcionAperturaProg,
                          }),
                        ],
                      }),
                    ]
                  : []),
                new TableCell({
                  children: [new Paragraph({ text: item.code })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: item.ff })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: item.of })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: formattedItemPrice })],
                }),
              ],
            });
          }),
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 6,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: 'TOTAL IMPORTE EN BOLIVIANOS',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: formattedPrice,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({ spacing: { after: 200 } }),
      new Paragraph({
        text: 'Sin otro particular, me despido con las consideraciones más distinguidas.',
        spacing: {
          after: 400,
        },
      }),
      new Paragraph({
        text: 'Atentamente',
      }),
    ];
  }

  private static _section_content_solicitudCertificacionPresupuestaria(
    procedure: ProcurementProcedure
  ): FileChild[] {
    const formattedPrice = this._formatNumberToPrice(procedure.price);
    const textAmount = numberToText(procedure.price);
    return [
      new Paragraph({
        text: 'De mi mayor consideración:',
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun(
            `Por medio de la presente tengo a bien solicitar a su autoridad la certificación presupuestaria del proceso de contratación, ${procedure.descripcionAperturaProg} (${procedure.reference}) con cargo a la apertura programática ${procedure.aperturaProg} ${procedure.descripcionAperturaProg}, por el monto de Bs. `
          ),
          new TextRun({
            text: `${formattedPrice} (${textAmount} bolivianos) como se detalla a continuación:`,
            bold: true,
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: {
          after: 200,
        },
      }),
      new Table({
        borders: TableBorders.NONE,
        columnWidths: [5, 20, 30, 15, 5, 7, 18],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                width: { size: 5, type: WidthType.DXA },
                children: [new Paragraph({ text: 'N°', alignment: 'center' })],
              }),
              new TableCell({
                width: { size: 20, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'APERTURA PROGRAMATICA',
                        bold: true,
                        size: 18,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 30, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'DESCRIPCION APERTURA PROGRAMATIC',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 15, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'OBJETO DE GASTO',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 5, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'FF',
                        bold: true,
                        size: 16,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 7, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'OF',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 18, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: 'center',
                    children: [
                      new TextRun({
                        text: 'PRECIO REFERENCIAL (BS)',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          ...procedure.items.map((item, index) => {
            const formattedItemPrice = this._formatNumberToPrice(item.amount);
            return new TableRow({
              children: [
                ...(index === 0
                  ? [
                      new TableCell({
                        rowSpan: procedure.items.length,
                        children: [new Paragraph({ text: '1' })],
                      }),
                      new TableCell({
                        rowSpan: procedure.items.length,
                        children: [
                          new Paragraph({
                            text: procedure.aperturaProg,
                            alignment: 'center',
                          }),
                        ],
                      }),
                      new TableCell({
                        rowSpan: procedure.items.length,
                        children: [
                          new Paragraph({
                            text: procedure.descripcionAperturaProg,
                          }),
                        ],
                      }),
                    ]
                  : []),
                new TableCell({
                  children: [new Paragraph({ text: item.code })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: item.ff })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: item.of })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: formattedItemPrice })],
                }),
              ],
            });
          }),
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 6,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: 'TOTAL IMPORTE EN BOLIVIANOS',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: formattedPrice,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({ spacing: { after: 200 } }),
      new Paragraph({
        text: 'Sin otro particular, me despido con las consideraciones más distinguidas.',
        spacing: {
          after: 400,
        },
      }),
      new Paragraph({
        text: 'Atentamente',
      }),
    ];
  }

  private static _communicatioPropsRow(
    prop: string,
    value: string,
    detail?: string
  ) {
    return new TableRow({
      height: { value: 500, rule: 'auto' },
      children: [
        new TableCell({
          width: { size: 15, type: WidthType.DXA },
          children: [
            new Paragraph({
              style: 'defaultStyle',
              alignment: 'right',
              children: [new TextRun({ text: prop, bold: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 40, type: WidthType.DXA },
          children: [new Paragraph({ text: value, style: 'defaultStyle' })],
          ...(detail && { columnSpan: 2 }),
        }),
        ...(detail
          ? [
              new TableCell({
                width: { size: 45, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    style: 'defaultStyle',
                    children: [new TextRun({ text: detail, bold: true })],
                  }),
                ],
              }),
            ]
          : []),
      ],
    });
  }

  private static _formatNumberToPrice(value: number) {
    return new Intl.NumberFormat('es-BO', {
      // style: 'currency',
      // currency: 'BOB',
      minimumFractionDigits: 2,
    }).format(value);
  }
}
