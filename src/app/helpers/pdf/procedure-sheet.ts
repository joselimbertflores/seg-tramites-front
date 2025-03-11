import { Content, TableCell } from 'pdfmake/interfaces';
// import {
//   ExternalProcedure,
//   InternalProcedure,
//   Procedure,
//   StateProcedure,
//   StatusMail,
//   Workflow,
// } from '../../domain/models';

function CreateSectionWorkflow(workflow: any[]): Content {
  const body: TableCell[][] = workflow.map((el, index) => {
    // const subTable: TableCell[][] = el.dispatches.map((send) => {
    //   return [
    //     {
    //       text: `${send.receiver.fullname} (${send.receiver.jobtitle})`,
    //       fontSize: 7,
    //     },
    //     [
    //       { text: `Referencia: ${send.reference}`, fontSize: 7 },
    //       ...(send.eventLog
    //         ? [
    //             {
    //               text: `\n ${send.eventLog.manager}: ${send.eventLog.description}`,
    //             },
    //           ]
    //         : []),
    //     ],
    //     [
    //       { text: `Fecha: ${send.date?.toLocaleString() ?? 'Pendiente'}` },
    //       { text: `Cantidad: ${send.attachmentQuantity}` },
    //       { text: `Nro. Interno: ${send.internalNumber}` },
    //     ],
    //     CreateStatusSection(send.status),
    //   ];
    // });
    return [
      { text: `${index + 1}`, alignment: 'center' },
      { text: `${el.emitter.fullname} (${el.emitter.jobtitle})` },
      { text: el.date.toLocaleString(), alignment: 'center' },
      {
        table: {
          headerRows: 1,
          widths: [120, '*', 90, 50],
          body: [
            [
              { text: 'Servidor publico', style: 'tableHeader' },
              { text: 'Proveido', style: 'tableHeader' },
              { text: 'Detalles', style: 'tableHeader' },
              { text: 'Status', style: 'tableHeader' },
            ],
            // ...subTable,
          ],
        },
        layout: 'lightHorizontalLines',
      },
    ];
  });
  if (workflow.length === 0)
    body.push([{ text: 'SIN FLUJO DE TRABAJO', colSpan: 4 }]);
  return {
    pageBreak: 'before',
    pageOrientation: 'landscape',
    fontSize: 8,
    table: {
      headerRows: 1,
      widths: [30, 120, 45, '*'],
      body: [
        [
          { text: 'ETAPA', style: 'tableHeader' },
          { text: 'REMITENTE', style: 'tableHeader' },
          { text: 'FECHA', style: 'tableHeader' },
          { text: 'DESTINATARIOS', style: 'tableHeader' },
        ],
        ...body,
      ],
    },
  };
}
function CreateStatusSection(status: any): Content {
  const properties: { label: string; color: string } = {
    label: 'Desconocido',
    color: 'purple',
  };
  // switch (status) {
  //   case StatusMail.Rejected:
  //     properties.color = 'red';
  //     properties.label = 'RECHAZADO';
  //     break;
  //   case StatusMail.Pending:
  //     properties.color = 'orange';
  //     properties.label = 'PENDIENTE';
  //     break;
  //   case StatusMail.Archived:
  //     properties.color = 'blue';
  //     properties.label = 'ARCHIVADO';
  //     break;
  //   default:
  //     properties.color = 'green';
  //     properties.label = 'RECIBIDO';
  //     break;
  // }
  return { text: properties.label, color: properties.color, bold: true };
}
function CreateDetailSection(procedure: any): Content {
  return [
    {
      fontSize: 10,
      table: {
        widths: [140, '*'],
        headerRows: 1,
        body: [
          [{ text: 'DETALLES DEL TRAMITE', bold: true, colSpan: 2 }, ''],
          [{ text: 'ALTERNO:' }, procedure.code],
          [{ text: 'REFERENCIA:' }, procedure.reference],
          [{ text: 'CANTIDAD:' }, procedure.amount],
          [{ text: 'ESTADO:' }, procedure.state],
          [{ text: 'ENCARGADO:' }, procedure.titleManager],
          [{ text: 'FECHA REGISTRO:' }, procedure.startDate.toLocaleString()],
          ...(procedure.state === "Concluido"
            ? [
                [
                  { text: 'FECHA FINALIZACION:' },
                  procedure.endDate?.toLocaleString() ?? 'Pendiente',
                ],
              ]
            : []),
        ],
      },
      layout: 'headerLineOnly',
    },
  ];
}
function CreateLocationSection(workflow: any[]): Content {
  if (workflow.length === 0) return [];
  const location: TableCell[][] = [];
  workflow.forEach((stage) => {
    // stage.dispatches.forEach((el) => {
    //   if (el.status === StatusMail.Archived) {
    //     location.push([
    //       { text: `ARCHIVADO` },
    //       { text: `${el.receiver.fullname} (${el.receiver.jobtitle})` },
    //       { text: `Ingreso: ${el.date?.toLocaleString() ?? 'Pendiente'}` },
    //     ]);
    //     return;
    //   }
    //   if (el.status === StatusMail.Received) {
    //     location.push([
    //       { text: `EN BANDEJA` },
    //       { text: `${el.receiver.fullname} (${el.receiver.jobtitle})` },
    //       { text: `Ingreso: ${el.date?.toLocaleString() ?? 'Pendiente'}` },
    //     ]);
    //     return;
    //   }
    //   if (el.status === StatusMail.Pending) {
    //     location.push([
    //       { text: `EN PROCESO DE ENTREGA` },
    //       {
    //         text: `${stage.emitter.fullname} (${stage.emitter.jobtitle}) => ${el.receiver.fullname} (${el.receiver.jobtitle})`,
    //       },
    //       { text: `Fecha envio: ${stage.date.toLocaleString()}` },
    //     ]);
    //     return;
    //   }
    // });
  });
  if (location.length === 0)
    location.push([{ text: 'SIN REGISTRO', colSpan: 3 }]);
  return [
    {
      text: 'UBICACION TRAMITE',
      alignment: 'left',
      bold: true,
      pageBreak: 'before',
    },
    {
      fontSize: 10,
      margin: [0, 5, 0, 20],
      table: {
        widths: [120, '*', 120],
        headerRows: 1,
        body: [
          [
            { text: 'DETALLE', bold: true },
            { text: 'PARTICIPANTE', bold: true },
            { text: 'FECHA', bold: true },
          ],
          ...location,
        ],
      },
    },
  ];
}
function CreateExternalSection(procedure: any): Content {
  return [
    {
      columns: [
        {
          margin: [0, 20, 0, 20],
          width: 300,
          fontSize: 10,
          table: {
            widths: [65, 160],
            headerRows: 1,
            body: [
              [
                { text: 'DETALLES DEL SOLICITANTE', bold: true, colSpan: 2 },
                '',
              ],
              [{ text: 'NOMBRE:' }, procedure.details.solicitante.nombre],
              ...(procedure.details.solicitante.tipo === 'NATURAL'
                ? [
                    [
                      { text: 'PATERNO:' },
                      procedure.details.solicitante.paterno ?? '',
                    ],
                    [
                      { text: 'MATERNO:' },
                      procedure.details.solicitante.materno ?? '',
                    ],
                    [{ text: 'DNI:' }, procedure.details.solicitante.dni ?? ''],
                    [
                      { text: 'DOCUMENTO:' },
                      procedure.details.solicitante.documento ?? '',
                    ],
                  ]
                : []),
              [{ text: 'TELEFONO:' }, procedure.details.solicitante.telefono],
            ],
          },
          layout: 'headerLineOnly',
        },
        {
          margin: [0, 20, 0, 20],
          width: 320,
          fontSize: 10,
          table: {
            widths: [65, 160],
            headerRows: 1,
            body: [
              [
                { text: 'DETALLES DEL REPRESENTANTE', bold: true, colSpan: 2 },
                '',
              ],
            ],
          },
          layout: 'headerLineOnly',
        },
      ],
    },
    { text: 'REQUERIMIENTOS PRESENTADOS\n\n', bold: true },
    {
      ol:
        procedure.details.requirements.length > 0
          ? [...procedure.details.requirements]
          : ['SIN REQUERIMIENTOS'],
    },
  ];
}
function CreateInternalSection(procedure: any): Content {
  return [
    {
      columns: [
        {
          margin: [0, 20, 0, 20],
          width: 300,
          fontSize: 10,
          table: {
            widths: [60, 160],
            headerRows: 1,
            body: [
              [{ text: 'DETALLES DEL REMITENTE', bold: true, colSpan: 2 }, ''],
              [{ text: 'NOMBRE:' }, procedure.details.remitente.nombre],
              [{ text: 'CARGO:' }, procedure.details.remitente.cargo],
            ],
          },
          layout: 'headerLineOnly',
        },
        {
          margin: [0, 20, 0, 20],
          width: 300,
          fontSize: 10,
          table: {
            widths: [60, 160],
            headerRows: 1,
            body: [
              [
                { text: 'DETALLES DEL DESTINATARIO', bold: true, colSpan: 2 },
                '',
              ],
              [{ text: 'NOMBRE:' }, procedure.details.destinatario.nombre],
              [{ text: 'CARGO:' }, procedure.details.destinatario.cargo],
            ],
          },
          layout: 'headerLineOnly',
        },
      ],
    },
  ];
}

export const IndexCard = {
  CreateDetailSection,
  CreateSectionWorkflow,
  CreateLocationSection,
  CreateExternalSection,
  CreateInternalSection,
};
