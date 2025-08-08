import {
  Content,
  ContentTable,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';

import { isModernWorkflow } from '../../communications/presentation/helpers';
import { Procedure, procedureGroup } from '../../procedures/domain';

import { workflow } from '../../communications/infrastructure';
import { toOrdinal } from '../number-to-ordinal.helper';
import { imageToBase64 } from '../image-base64.helper';

interface stageProps {
  index: number;
  officer: string;
  jobTitle: string;
  reference: string;
  internalNumber: string;
  sentDate: sendDetail;
  receivedDate: sendDetail;
  priority: number;
}

interface sendDetail {
  date: string;
  hour: string;
  quantity: string;
}

interface FirstSectionParams {
  procedure: Procedure;
  firstStep: workflow | undefined;
  isOriginal: boolean;
  isUrgent: boolean;
}

let imageCache: { left: string; right: string } | null = null;

export const getRouteSheetReport = async (
  procedure: Procedure,
  workflow: workflow[],
  isOriginal: boolean
) => {
  const { left: leftImage, right: rightImage } = await getImages();

  const isUrgent = workflow.some(({ priority }) => priority >= 1);

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [30, 30, 30, 30],
    info: {
      title: procedure.code,
    },
    content: [
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
      firstSection({ procedure, firstStep: workflow[0], isOriginal, isUrgent }),
      secondSection(workflow),
    ],
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
          text: '\nDirección: Pasaje Constitucional S-002 - Teléfonos: No. Piloto 4701677 - 4702301 - 4703059 - Fax interno: 143',
        },
        {
          text: '\nE-mail: info@sacaba.gob.bo - Pagina web: www.sacaba.gob.bo  Sacaba - Cochabamba - Bolivia',
        },
      ],
    },
    styles: {
      header: {
        fontSize: 10,
        bold: true,
      },
    },
  };
  return docDefinition;
};

function firstSection({
  procedure,
  firstStep,
  isOriginal,
  isUrgent,
}: FirstSectionParams): Content {
  const { emitter, receiver, phone } = procedure.originDetails();
  const sentDetail = firstStep
    ? {
        quantity: firstStep.attachmentsCount,
        officer: {
          fullname: firstStep.recipient.fullname,
          jobtitle: firstStep.recipient.jobtitle ?? 'Sin cargo',
        },
        ...formatDateTime(firstStep.sentDate),
      }
    : {
        officer: {
          fullname: '',
          jobtitle: '',
        },
        date: '',
        hour: '',
        quantity: '',
      };

  const creationDetail = {
    quantity: procedure.numberOfDocuments,
    officer: {
      ...(receiver
        ? {
            fullname: receiver.fullname,
            jobtitle: receiver.jobtitle ?? 'Sin cargo',
          }
        : {
            fullname: firstStep?.recipient.fullname ?? '',
            jobtitle: firstStep?.recipient.jobtitle ?? '',
          }),
    },
    ...formatDateTime(procedure.createdAt),
  };

  const selectionOptions = isOriginal
    ? [
        {
          label: 'CORRESPONDENCIA INTERNA',
          active:
            procedure.group === procedureGroup.Internal ||
            procedure.group === procedureGroup.Procurement,
        },
        {
          label: 'CORRESPONDENCIA EXTERNA',
          active: procedure.group === procedureGroup.External,
        },
        {
          label: 'COPIA\n\n',
          active: false,
        },
      ]
    : [
        {
          label: 'CORRESPONDENCIA INTERNA',
          active: false,
        },
        {
          label: 'CORRESPONDENCIA EXTERNA',
          active: false,
        },
        {
          label: 'COPIA\n\n',
          active: true,
        },
      ];

  return {
    fontSize: 7,
    table: {
      widths: ['*'],
      body: [
        [{ text: 'PRIMERA PARTE', bold: true }],
        [
          {
            border: [true, false, true, false],
            fontSize: 6,
            alignment: 'center',
            margin: [0, 10, 0, 0],
            columns: [
              ...selectionOptions.map((option) => ({
                width: option.label.includes('COPIA') ? 50 : 100,
                table: {
                  widths: [option.label.includes('COPIA') ? 30 : 75, 5],
                  body: [
                    [
                      {
                        text: option.label,
                        border: [false, false, false, false],
                      },
                      { text: option.active ? 'X' : '', style: 'header' },
                    ],
                  ],
                },
              })),
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
                        text: `${procedure.code}`,
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
                        text: `${creationDetail.date}`,
                        fontSize: 8,
                        border: [true, true, true, true],
                      },
                      {
                        text: `${creationDetail.hour}`,
                        fontSize: 8,
                        border: [true, true, true, true],
                      },
                      {
                        text: `${procedure.numberOfDocuments}`,
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
                alignment: 'center',
                ...(isUrgent
                  ? {
                      stack: [
                        {
                          canvas: [
                            {
                              type: 'rect',
                              x: 0,
                              y: 0,
                              w: 75,
                              h: 25,
                              lineColor: 'red',
                              lineWidth: 2,
                            },
                            // {
                            //   type: 'rect',
                            //   x: 0,
                            //   y: 0,
                            //   w: 80,
                            //   h: 30,
                            //   color: '#FF0000', // Fondo rojo
                            // },
                          ],
                          absolutePosition: { x: 460, y: 140 },
                        },
                        {
                          text: 'URGENTE',
                          absolutePosition: { x: 460, y: 145 },
                          color: 'red',
                          bold: true,
                          fontSize: 14,
                        },
                      ],
                    }
                  : { text: '' }),
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
                  `CITE: ${procedure.cite}\n${
                    phone ? 'TELEFONO: ' + phone : ''
                  }`,
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
                            text: `${firstStep?.internalNumber ?? ''}`,
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
                  `DESTINATARIO: ${sentDetail.officer.fullname}`,
                  `CARGO: ${sentDetail.officer.jobtitle}`,
                ],
                [{ text: `REFERENCIA: ${procedure.reference}`, colSpan: 2 }],
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
                        text: `${sentDetail.date}`,
                        border: [true, true, true, true],
                        fontSize: 8,
                      },
                      {
                        text: `${sentDetail.hour}`,
                        border: [true, true, true, true],
                        fontSize: 8,
                      },
                      {
                        text: `${sentDetail.quantity}`,
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

function secondSection(workflow: workflow[]) {
  const sendeMap = buildSenderIndex(workflow);
  let containers: ContentTable[] = [];
  for (const [index, item] of workflow.entries()) {
    const nextStage = getNextStage(item, index, workflow, sendeMap);
    const container = stageContainer({
      index: index,
      reference: item.reference,
      officer: item.recipient.fullname,
      jobTitle: item.recipient.jobtitle,
      internalNumber: nextStage?.internalNumber ?? '',
      sentDate: {
        ...formatDateTime(item.receivedDate),
        quantity: item.receivedDate ? item.attachmentsCount : '',
      },
      receivedDate: {
        ...formatDateTime(nextStage?.sentDate),
        quantity: nextStage?.sentDate ? nextStage.attachmentsCount : '',
      },
      priority: item.priority,
    });
    containers.push(container);
  }
  const length = containers.length;

  for (let index = length; index < getLastPageNumber(length); index++) {
    const container = stageContainer({
      index: index,
      officer: '',
      jobTitle: '',
      sentDate: { hour: '', date: '', quantity: '' },
      receivedDate: { hour: '', date: '', quantity: '' },
      reference: '',
      internalNumber: '',
      priority: 0,
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

async function getImages(): Promise<{ left: string; right: string }> {
  if (!imageCache) {
    const [left, right] = await Promise.all([
      imageToBase64('images/institution/alcaldia.jpeg'),
      imageToBase64('images/institution/sacaba.jpeg'),
    ]);
    imageCache = { left, right };
  }
  return imageCache;
}

function stageContainer({
  index,
  officer,
  jobTitle,
  priority,
  sentDate,
  reference,
  receivedDate,
  internalNumber,
}: stageProps): ContentTable {
  return {
    fontSize: 7,
    unbreakable: true,
    table: {
      dontBreakRows: true,
      widths: [360, '*'],
      body: [
        [
          {
            colSpan: 2,
            border: [true, false, true, false],
            stack: [
              {
                columns: [
                  {
                    width: '*',
                    margin: [0, 5, 0, 0],
                    text: `DESTINATARIO ${toOrdinal(
                      index + 1
                    )} (NOMBRE Y CARGO): ${officer} ${
                      jobTitle ? `(${jobTitle})` : ''
                    }`,
                    alignment: 'left',
                  },
                  {
                    alignment: 'right',
                    width: 50,
                    ...(priority >= 1
                      ? {
                          text: 'URGENTE',
                          color: 'red',
                          fontSize: 10,
                          italics: true,
                          bold: true,
                        }
                      : { text: '' }),
                  },
                ],
              },
            ],
          },
          {},
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

function formatDateTime(date: string | Date | undefined) {
  if (!date) return { date: '', hour: '' };
  const dateFormat = date instanceof Date ? date : new Date(date);
  return {
    date: dateFormat.toLocaleDateString('es-ES'),
    hour: dateFormat.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };
}

function getLastPageNumber(lengthData: number): number {
  if (lengthData <= 8) return 8;
  const firstTerm = 3;
  const increment = 5;
  const termsBefore = Math.ceil((lengthData - firstTerm) / increment);
  const nextTerm = firstTerm + termsBefore * increment;
  return nextTerm;
}

function buildSenderIndex(all: workflow[]): Map<string, workflow[]> {
  const map = new Map<string, workflow[]>();
  for (const item of all) {
    if (!map.has(item.sender.account)) {
      map.set(item.sender.account, []);
    }
    map.get(item.sender.account)!.push(item);
  }
  return map;
}

function getNextStage(
  current: workflow,
  index: number,
  all: workflow[],
  senderIndex: Map<string, workflow[]>
): workflow | undefined {
  if (isModernWorkflow(all)) {
    return all.find((w) => w.parentId === current._id);
  }
  // --- Old Method ---
  // return all
  // .slice(index + 1)
  // .find((w) => w.sender.account === current.recipient.account);

  const possible = senderIndex.get(current.recipient.account) || [];
  return possible.find((w) => all.indexOf(w) > index);
}
