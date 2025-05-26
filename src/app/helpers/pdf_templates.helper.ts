import {
  Content,
  ContentTable,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { convertImageBase64 } from './image_base64';
import { Procedure, procedureGroup } from '../procedures/domain';
import pdfMake from 'pdfmake/build/pdfmake';
import { Communication } from '../communications/domain';
import { toOrdinal } from './ordinal';
import { communication, workflow } from '../communications/infrastructure';
import { text } from 'd3';

interface firstSectionDetails {
  code: string;
  group: procedureGroup;
  reference: string;
  cite: string;
  emitter: participant;
  sendDate: sendDetail;
  receivedDate: sendDetail;
  receiver: participant;
  internalNumber: string;
  phone: string | undefined;
}

interface RouteMapProps {
  index: number;
  officer: string;
  reference: string;
  internalNumber: string;
  sentDate: sendDetail;
  receivedDate: sendDetail;
}

interface sendDetail {
  date: string;
  hour: string;
  quantity: string;
}

interface participant {
  fullname: string;
  jobtitle: string;
}

export class PdfTemplates {
  static async headerInternalDocument(): Promise<Content> {
    const leftImage = await convertImageBase64(
      'images/institution/alcaldia.jpeg'
    );
    const rightImage = await convertImageBase64(
      'images/institution/sacaba.jpeg'
    );
    return [
      {
        style: 'cabecera',
        columns: [
          {
            image: leftImage,
            width: 140,
            height: 60,
          },
          {
            text: '',
            width: '*',
          },
          {
            image: rightImage,
            width: 60,
            height: 60,
          },
        ],
      },
    ];
  }

  static async routeMap(
    procedure: Procedure,
    workflow: workflow[][]
  ): Promise<Content[]> {
    const leftImage = await convertImageBase64(
      'images/institution/alcaldia.jpeg'
    );
    const rightImage = await convertImageBase64(
      'images/institution/sacaba.jpeg'
    );
    return [
      workflow.map((el) => [
        this.sectionHeaderRouteMap(leftImage, rightImage),
        this.firstSection(procedure, el),
        this.secondSection(el),
        [{ text: '', pageBreak: 'before' }],
      ]),
      // ,
    ];
  }
  static async routeMap2(
    procedure: Procedure,
    workflow: workflow[]
  ): Promise<Content[]> {
    const leftImage = await convertImageBase64(
      'images/institution/alcaldia.jpeg'
    );
    const rightImage = await convertImageBase64(
      'images/institution/sacaba.jpeg'
    );
    return [
      this.sectionHeaderRouteMap(leftImage, rightImage),
      this.firstSection(procedure, workflow),
      this.secondSection(workflow),
      // ,
    ];
  }

  private static firstSection(procedure: Procedure, workflow: workflow[]) {
    const { emitter, receiver, phone } = procedure.originDetails();
    const sectionReceiver = receiver
      ? {
          fullname: receiver.fullname,
          jobtitle: receiver.jobtitle ?? 'Sin cargo',
        }
      : workflow.length > 0
      ? {
          fullname: workflow[0].recipient.fullname,
          jobtitle: workflow[0].recipient.jobtitle,
        }
      : { fullname: '', jobtitle: '' };
    return this.firstRouteMapContainer({
      code: procedure.code,
      cite: procedure.cite,
      reference: procedure.reference,
      group: procedure.group,
      emitter: {
        fullname: emitter.fullname,
        jobtitle: emitter.jobtitle ?? 'Sin cargo',
      },
      phone: phone,
      sendDate: {
        date: procedure.createdAt.toLocaleDateString('es-ES'),
        hour: procedure.createdAt.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        quantity: procedure.numberOfDocuments,
      },
      internalNumber: workflow[0]?.internalNumber ?? '',
      receiver: sectionReceiver,
      receivedDate: { date: '', hour: '', quantity: '' },
      // f
    });
  }

  private static sectionHeaderRouteMap(
    leftImage: string,
    rightImage: string
  ): Content {
    return [
      {
        margin: [0, 0, 0, 5],
        columns: [
          {
            image: leftImage,
            width: 120,
            height: 50,
          },
          {
            text: '\nHOJA DE RUTA DE CORRESPONDENCIA',
            bold: true,
            alignment: 'center',
          },
          {
            image: rightImage,
            width: 50,
            height: 50,
          },
        ],
      },
    ];
  }

  static secondSection(workflow: workflow[]) {
    const containers: ContentTable[] = [];
    for (const [index, item] of workflow.entries()) {
      const nextStage = workflow
        .slice(index, workflow.length)
        .find(({ sender }) => sender.account === item.recipient.account);

      const container = this.stageRouteMapContainer({
        index: index,
        reference: item.reference,
        officer: item.recipient.fullname,
        internalNumber: nextStage?.internalNumber ?? '',
        sentDate: item.receivedDate
          ? {
              date: new Date(item.receivedDate).toLocaleDateString('es-ES'),
              hour: new Date(item.receivedDate).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }),
              quantity: item.attachmentsCount,
            }
          : { date: '', hour: '', quantity: '' },

        // receivedDate: nextStage
        //   ? {
        //       date: nextStage.sentDate.toLocaleDateString('es-ES'),
        //       hour: nextStage.sentDate.toLocaleTimeString('es-ES', {
        //         hour: '2-digit',
        //         minute: '2-digit',
        //         hour12: false,
        //       }),
        //       quantity: nextStage.attachmentsCount,
        //     }
        //   : { date: '', hour: '', quantity: '' },
        receivedDate: nextStage
          ? {
              date: new Date(nextStage.sentDate).toLocaleDateString('es-ES'),
              hour: new Date(nextStage.sentDate).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }),
              quantity: nextStage.attachmentsCount,
            }
          : { date: '', hour: '', quantity: '' },
      });
      containers.push(container);
    }
    const length = containers.length;

    for (
      let index = length;
      index < this.getRouteMapLastPageNumber(length);
      index++
    ) {
      const container = this.stageRouteMapContainer({
        index: index,
        officer: '',
        sentDate: { hour: '', date: '', quantity: '' },
        receivedDate: { hour: '', date: '', quantity: '' },
        reference: '',
        internalNumber: '',
      });
      containers.push(container);
    }
    containers[0].table.body.push([
      {
        text: `SEGUNDA PARTE`,
        fontSize: 7,
        bold: true,
        alignment: 'left',
        border: [true, false, true, true],
        colSpan: 2,
      },
      '',
    ]);
    return containers;
  }

  private static firstRouteMapContainer({
    group,
    code,
    reference,
    sendDate,
    cite,
    emitter,
    receiver,
    receivedDate,
    internalNumber = '',
    phone,
  }: firstSectionDetails) {
    return {
      fontSize: 7,
      table: {
        widths: ['*'],
        body: [
          [{ text: 'PRIMERA PARTE', bold: true }],
          [
            {
              border: [true, false, true, false],
              style: 'selection_container',
              fontSize: 6,
              columns: [
                {
                  width: 100,
                  table: {
                    widths: [75, 5],
                    body: [
                      [
                        {
                          text: 'CORRESPONDENCIA INTERNA',
                          border: [false, false, false, false],
                        },
                        {
                          text:
                            group === procedureGroup.Internal ||
                            procedureGroup.Procurement
                              ? 'X'
                              : '',
                          style: 'header',
                        },
                      ],
                    ],
                  },
                },
                {
                  width: 100,
                  table: {
                    widths: [75, 5],
                    body: [
                      [
                        {
                          text: 'CORRESPONDENCIA EXTERNA',
                          border: [false, false, false, false],
                        },
                        {
                          text: group === procedureGroup.External ? 'X' : '',
                          style: 'header',
                        },
                      ],
                    ],
                  },
                },
                {
                  width: 50,
                  table: {
                    widths: [30, 5],
                    body: [
                      [
                        {
                          text: 'COPIA\n\n',
                          border: [false, false, false, false],
                        },
                        { text: '', style: 'header' },
                      ],
                    ],
                  },
                },
                {
                  width: '*',
                  table: {
                    widths: [90, '*'],
                    body: [
                      [
                        {
                          text: 'NRO. UNICO DE CORRESPONDENCIA',
                          border: [false, false, false, false],
                        },
                        {
                          text: `${code}`,
                          bold: true,
                          fontSize: 11,
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
          [
            {
              border: [true, false, true, false],
              columns: [
                {
                  width: 60,
                  text: '',
                },
                {
                  fontSize: 5,
                  alignment: 'center',
                  table: {
                    widths: [100, 70, 60, 80],
                    body: [
                      ['', 'FECHA', 'HORA', 'CANTIDAD DE HOJAS / ANEXOS'],
                      [
                        {
                          text: 'EMISION / RECEPCION',
                          border: [false, false, false, false],
                          fontSize: 7,
                        },
                        {
                          text: `${sendDate.date}`,
                          fontSize: 8,
                          border: [true, true, true, true],
                        },
                        {
                          text: `${sendDate.hour}`,
                          fontSize: 8,
                          border: [true, true, true, true],
                        },
                        {
                          text: `${sendDate.quantity}`,
                          fontSize: 6,
                          border: [true, true, true, true],
                        },
                      ],
                    ],
                  },
                  layout: {
                    defaultBorder: false,
                  },
                },
                {
                  width: 120,
                  text: '',
                },
              ],
            },
          ],
          [
            {
              border: [true, false, true, false],
              table: {
                widths: ['*', '*'],
                body: [
                  [{ text: 'DATOS DE ORIGEN', bold: true }, ''],
                  [
                    `CITE: ${cite}\n${phone ? 'TELEFONO: ' + phone : ''}`,
                    {
                      table: {
                        widths: [85, 100, 40],
                        body: [
                          [
                            { text: '', border: [false, false, false, false] },
                            {
                              text: 'NRO. REGISTRO INTERNO (Correlativo)',
                              border: [false, false, false, false],
                            },
                            {
                              text: `${internalNumber}`,
                              fontSize: 7,
                              alignment: 'center',
                            },
                          ],
                        ],
                      },
                    },
                  ],
                  [
                    `REMITENTE: ${emitter.fullname}`,
                    `CARGO: ${emitter.jobtitle}`,
                  ],
                  [
                    `DESTINATARIO: ${receiver.fullname}`,
                    `CARGO: ${receiver.jobtitle}`,
                  ],
                  [{ text: `REFERENCIA: ${reference}`, colSpan: 2 }],
                ],
              },
              layout: 'noBorders',
            },
          ],
          [
            {
              border: [true, false, true, false],
              columns: [
                {
                  width: 65,
                  text: '',
                },
                {
                  fontSize: 5,
                  alignment: 'center',
                  table: {
                    widths: [95, 70, 60, 80],
                    body: [
                      ['', 'FECHA', 'HORA', 'CANTIDAD DE HOJAS / ANEXOS'],
                      [
                        {
                          text: 'SALIDA',
                          border: [false, false, false, false],
                          fontSize: 7,
                        },
                        {
                          text: `${receivedDate.date}`,
                          border: [true, true, true, true],
                          fontSize: 8,
                        },
                        {
                          text: `${receivedDate.hour}`,
                          border: [true, true, true, true],
                          fontSize: 8,
                        },
                        {
                          text: `${receivedDate.quantity}`,
                          border: [true, true, true, true],
                          fontSize: 6,
                        },
                      ],
                    ],
                  },
                  layout: {
                    defaultBorder: false,
                  },
                },
                {
                  width: 100,
                  text: '',
                },
              ],
            },
          ],
        ],
      },
    };
  }

  private static stageRouteMapContainer({
    index,
    officer,
    reference,
    internalNumber,
    sentDate,
    receivedDate,
  }: RouteMapProps): ContentTable {
    return {
      fontSize: 7,
      unbreakable: true,
      table: {
        dontBreakRows: true,
        widths: [360, '*'],
        body: [
          [
            {
              margin: [0, 10, 0, 0],
              text: `DESTINATARIO ${toOrdinal(
                index + 1
              )} (NOMBRE Y CARGO): ${officer}`,
              colSpan: 2,
              alignment: 'left',
              border: [true, false, true, false],
            },
            '',
          ],
          [
            {
              border: [true, false, false, false],
              table: {
                widths: [80, 300],
                body: [
                  [
                    {
                      table: {
                        heights: 70,
                        widths: [70],
                        body: [
                          [
                            {
                              text: 'SELLO DE RECEPCION',
                              fontSize: 4,
                              alignment: 'center',
                            },
                          ],
                        ],
                      },
                    },
                    [
                      { text: 'INSTRUCCION / PROVEIDO' },
                      {
                        text: `\n\n${reference}`,
                        bold: true,
                        alignment: 'center',
                      },
                    ],
                  ],
                ],
              },
              layout: {
                defaultBorder: false,
              },
            },
            {
              rowSpan: 1,
              border: [false, false, true, false],
              table: {
                widths: [100, 40],
                body: [
                  [
                    {
                      text: 'NRO. REGISTRO INTERNO (Correlativo)',
                      border: [false, false, false, false],
                    },
                    { text: internalNumber, alignment: 'center', fontSize: 7 },
                  ],
                  [
                    {
                      text: '\n\n\n\n-----------------------------------------',
                      colSpan: 2,
                      border: [false, false, false, false],
                      alignment: 'right',
                    },
                  ],
                  [
                    {
                      text: 'FIRMA Y SELLO',
                      colSpan: 2,
                      border: [false, false, false, false],
                      alignment: 'right',
                    },
                  ],
                ],
              },
            },
          ],
          [
            {
              colSpan: 2,
              border: [true, false, true, true],
              alignment: 'center',
              fontSize: 5,
              table: {
                widths: [30, 45, 35, '*', 30, 45, 35, '*'],
                body: [
                  [
                    '',
                    'FECHA',
                    'HORA',
                    'CANTIDAD DE HOJAS / ANEXOS',
                    '',
                    'FECHA',
                    'HORA',
                    'CANTIDAD DE HOJAS / ANEXOS',
                  ],
                  [
                    {
                      text: 'INGRESO',
                      border: [false, false, false, false],
                      fontSize: 7,
                    },
                    {
                      text: `${sentDate.date}`,
                      fontSize: 8,
                      border: [true, true, true, true],
                    },
                    {
                      text: `${sentDate.hour}`,
                      fontSize: 8,
                      border: [true, true, true, true],
                    },
                    {
                      text: `${sentDate.quantity}`,
                      fontSize: 6,
                      border: [true, true, true, true],
                    },
                    {
                      text: 'SALIDA',
                      border: [false, false, false, false],
                      fontSize: 7,
                    },
                    {
                      text: `${receivedDate.date}`,
                      border: [true, true, true, true],
                      fontSize: 8,
                    },
                    {
                      text: `${receivedDate.hour}`,
                      border: [true, true, true, true],
                      fontSize: 8,
                    },
                    {
                      text: `${receivedDate.quantity}`,
                      border: [true, true, true, true],
                      fontSize: 6,
                    },
                  ],
                ],
              },
              layout: {
                defaultBorder: false,
              },
            },
          ],
        ],
      },
    };
  }

  private static getRouteMapLastPageNumber(lengthData: number): number {
    if (lengthData <= 8) return 8;
    const firstTerm = 3;
    const increment = 5;
    const termsBefore = Math.ceil((lengthData - firstTerm) / increment);
    const nextTerm = firstTerm + termsBefore * increment;
    return nextTerm;
  }
}
