import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { imageToBase64 } from '../image-base64.helper';
import { unlinkDataResponse } from '../../reports/infrastructure';

export async function getUnlinkSheetReport(data: unlinkDataResponse) {
  const iconImage = await imageToBase64('images/institution/escudo.png');
  const currentDate = new Date();

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [30, 30, 30, 30],
    content: [
      {
        alignment: 'center',
        fontSize: 10,
        table: {
          heights: 10,
          widths: [70, 300, '*'],
          body: [
            [
              { rowSpan: 4, image: iconImage, fit: [100, 70] },
              {
                rowSpan: 2,
                text: 'GOBIERNO ELECTRÓNICO',
              },
              'SF-000-74-RG31',
            ],
            ['', '', 'version 1'],
            [
              '',
              {
                rowSpan: 2,
                text: 'SOLICITUD DE BAJA DE USUARIO DE SISTEMA DE SEGUIMIENTO DE TRAMITES',
              },
              `Aprobacion 20/06/2023`,
            ],
            ['', '', 'pagina 1 de 1'],
          ],
        },
      },
      {
        text: `Fecha: ${currentDate.toLocaleString()}`,
        marginTop: 20,
        style: 'header',
        alignment: 'right',
      },

      {
        text: 'DATOS DEL SOLICITANTE',
        alignment: 'center',
        bold: true,
        marginBottom: 10,
      },
      {
        margin: [20, 0, 20, 0],
        fontSize: 11,
        table: {
          widths: [120, '*'],
          body: [
            [
              {
                border: [false, false, false, false],
                text: 'Nombre completo:',
                bold: true,
                alignment: 'right',
              },
              {
                text: data.officer.fullname.toUpperCase(),
              },
            ],
            [
              {
                border: [false, false, false, false],
                text: 'Cargo:',
                bold: true,
                alignment: 'right',
              },
              {
                text: data.officer.jobtitle.toUpperCase(),
              },
            ],
            [
              {
                border: [false, false, false, false],
                text: 'Institucion:',
                bold: true,
                alignment: 'right',
              },
              {
                text: data.officer.institution.toUpperCase(),
              },
            ],
            [
              {
                border: [false, false, false, false],
                text: 'Unidad:',
                bold: true,
                alignment: 'right',
              },
              {
                text: data.officer.dependency.toUpperCase(),
              },
            ],
          ],
        },
      },
      {
        text: '\n\nNumero Total de Tramites\n\n',
        alignment: 'center',
        bold: true,
      },
      {
        margin: [30, 0, 20, 0],
        table: {
          widths: [120, 100, 100, 100],
          body: [
            [
              {
                border: [false, false, false, false],
                text: '',
              },
              {
                border: [false, false, false, false],
                text: 'Aceptados',
                fontSize: 9,
              },
              {
                border: [false, false, false, false],
                text: 'Sin aceptar',
                fontSize: 9,
              },
              {
                border: [false, false, false, false],
                text: 'Total (Pendientes)',
                fontSize: 9,
              },
            ],
            [
              {
                border: [false, false, false, false],
                text: 'Bandeja de entrada:',
                bold: true,
                alignment: 'right',
              },
              {
                text: data.summary.inbox.received,
              },
              {
                text: data.summary.inbox.pending,
              },

              {
                text: data.summary.inbox.pending + data.summary.inbox.received,
              },
            ],
          ],
        },
      },
      {
        margin: [20, 10, 0, 0],
        table: {
          widths: [130, 100, 100, 100],
          body: [
            [
              {
                border: [false, false, false, false],
                text: '',
              },
              {
                border: [false, false, false, false],
                text: 'Pendientes',
                fontSize: 9,
              },
              {
                border: [false, false, false, false],
                text: 'Auto rechazados',
                fontSize: 9,
              },
              {
                border: [false, false, false, false],
                text: 'Total (Pendientes)',
                fontSize: 9,
              },
            ],
            [
              {
                border: [false, false, false, false],
                text: 'Bandeja de salida:',
                bold: true,
                alignment: 'right',
              },
              {
                text: data.summary.outbox.pending,
              },
              {
                text: data.summary.outbox.autoRejected,
              },
              {
                text:
                  data.summary.outbox.pending +
                  data.summary.outbox.rejected +
                  data.summary.outbox.autoRejected,
              },
            ],
          ],
        },
      },
      {
        text: '\n IMPORTANTE: El total pendientes debe ser igual a cero (0), de ambas bandejas.',
        color: 'red',
        alignment: 'center',
        bold: true,
      },
      {
        margin: [20, 20, 20, 0],
        table: {
          widths: [120, 25, 75, 25, 100, 25, 80],
          body: [
            [
              {
                border: [false, false, false, false],
                text: 'Motivo:',
                bold: true,
                alignment: 'right',
              },
              {
                text: ` `,
              },
              {
                border: [false, false, false, false],
                text: 'Rotacion',
              },
              {
                text: ``,
                alignment: 'center',
              },
              {
                border: [false, false, false, false],
                text: 'Desvinculacion',
              },
              {
                text: ``,
              },
              {
                border: [false, false, false, false],
                text: 'Otros',
              },
            ],
          ],
        },
      },
      {
        text: '\nObservaciones:',
        bold: true,
        alignment: 'center',
      },
      {
        table: {
          widths: [50, '*', 50],
          heights: 50,
          body: [
            [
              {
                border: [false, false, false, false],
                text: '',
              },
              {
                text: ` `,
              },
              {
                border: [false, false, false, false],
                text: '',
              },
            ],
          ],
        },
      },
      {
        marginTop: 10,
        text: 'Recomendaciones',
        bold: true,
        alignment: 'center',
      },
      {
        // alignment: 'center',
        fontSize: 10,
        marginTop: 5,
        ul: [
          'El formulario de baja no debe tener trámites pendientes por ningún concepto a la fecha.',
          'Al momento de rotación, desvinculación, el usuario del Sistema de Seguimiento de Trámites presentará formulario de baja obligatoriamente como máximo dentro 24 horas.',
        ],
      },
      {
        margin: [0, 120, 0, 0],
        columns: [
          {
            width: 20,
            text: '',
          },
          {
            width: '*',
            text: 'Firma y sello solicitante',
            alignment: 'center',
          },
          {
            width: '*',
            text: [
              { text: 'Firma y sello inmediato superior\n' },
              {
                text: '(He verificado doc. física y no tiene trámites pendientes)',
                fontSize: 8,
              },
            ],
            alignment: 'center',
          },
          {
            width: 20,
            text: '',
          },
        ],
      },
      { text: '', pageBreak: 'before', pageOrientation: 'landscape' },
      {
        text: `LISTADO DE TRAMITES EN BANDEJA DE ENTRADA: ${currentDate.toLocaleString()}\n\n`,
        bold: true,
        alignment: 'center',
      },
      {
        fontSize: 8,
        table: {
          headerRows: 1,
          dontBreakRows: true,
          widths: [20, 120, '*', 70, 40],
          body: [
            [
              { text: 'Nro.', bold: true, alignment: 'center' },
              { text: 'Alterno', bold: true, alignment: 'center' },
              { text: 'Descripcion', bold: true, alignment: 'center' },
              { text: 'Fecha ingreso', bold: true, alignment: 'center' },
              { text: 'Recibido', bold: true, alignment: 'center' },
            ],
            ...(data.inboxItems.length > 0
              ? data.inboxItems.map((item, index) => [
                  { text: `${index + 1}`, alignment: 'center' },
                  item.procedure.code,
                  item.procedure.reference,
                  new Date(item.sentDate).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  }),
                  ...(item.status === 'received'
                    ? [
                        {
                          text: `SI`,
                          alignment: 'center',
                        },
                      ]
                    : [
                        {
                          text: `NO`,
                          fillColor: '#FE5F55',
                          alignment: 'center',
                          color: 'white',
                        },
                      ]),
                ])
              : [
                  [
                    {
                      text: 'Sin tramites en bandeja',
                      colSpan: 5,
                      fontSize: 14,
                    },
                    '',
                    '',
                    '',
                    '',
                  ],
                ]),
          ],
        },
      },
    ],

    footer: function (currentPage, pageCount) {
      if (currentPage === 1) {
        return [
          {
            margin: [10, 0, 10, 0],
            fontSize: 8,
            text: 'Este formulario no exime que a futuro se solicite al servidor(a) público información respecto a trámites o procesos que hubieran estado a su cargo hasta el último día laboral en la Entidad, también NO impide ni se constituye en prueba para ninguna Auditoria u otros.',
          },
        ];
      }
      currentPage--;
      pageCount--;
      return [
        {
          margin: [0, 10, 20, 0],
          fontSize: 9,
          text: {
            text: 'Pagina ' + currentPage.toString() + ' de ' + pageCount,
            alignment: 'right',
          },
        },
      ];
    },
  };
  return docDefinition;
}
