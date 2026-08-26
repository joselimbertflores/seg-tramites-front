import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { imageToBase64 } from '../image-base64.helper';

interface ProcedureLocationOfficer {
  nombre: string;
  paterno: string;
  materno: string;
}

interface ProcedureLocationHolder {
  officer: ProcedureLocationOfficer | null;
  jobtitle: string | null;
  dependency: {
    nombre: string;
  } | null;
  institution: {
    nombre: string;
  } | null;
}

interface ProcedureLocation {
  id: string;
  group: string;
  code: string;
  reference: string;
  state: string;
  holders: ProcedureLocationHolder[];
}

interface ProcedureLocationReportProps {
  title: string;
  procedures: ProcedureLocation[];
  parameters?: Record<string, string>;
}

export const getProcedureLocationReport = async (
  data: ProcedureLocationReportProps,
  userName?: string,
): Promise<TDocumentDefinitions> => {
  const { title, procedures, parameters } = data;

  const rightImage = await imageToBase64(
    'images/institution/alcaldia.jpeg',
  );

  const parametersList = parameters
    ? Object.entries(parameters)
    : [];

  const getOfficerName = (
    officer: ProcedureLocationOfficer | null,
  ): string => {
    if (!officer) {
      return 'Sin funcionario asignado';
    }

    return [
      officer.nombre,
      officer.paterno,
      officer.materno,
    ]
      .filter(Boolean)
      .join(' ');
  };

  const getGroupName = (group: string): string => {
    switch (group) {
      case 'ExternalProcedure':
        return 'Externo';

      case 'InternalProcedure':
        return 'Interno';

      case 'ProcurementProcedure':
        return 'Contratación';

      default:
        return group;
    }
  };

  const buildHolder = (holder: ProcedureLocationHolder) => ({
    margin: [0, 3, 0, 3],
    stack: [
      {
        text: getOfficerName(holder.officer),
        bold: true,
        fontSize: 9,
      },
      {
        text: holder.jobtitle ?? 'Sin cargo registrado',
        fontSize: 8,
        color: '#444444',
        margin: [0, 2, 0, 0],
      },
      ...(holder.dependency
        ? [
            {
              text: holder.dependency.nombre,
              fontSize: 8,
              color: '#666666',
            },
          ]
        : []),
      ...(holder.institution
        ? [
            {
              text: holder.institution.nombre,
              fontSize: 8,
              color: '#666666',
            },
          ]
        : []),
    ],
  });

  /*
   * Organizamos los funcionarios de dos en dos.
   *
   * PDFMake no hace wrapping automático de `columns`, por eso
   * construimos explícitamente filas de dos columnas.
   */
  const buildHoldersTable = (
    holders: ProcedureLocationHolder[],
  ) => {
    if (holders.length === 0) {
      return {
        text: 'No se encontró una ubicación actual para este trámite.',
        fontSize: 8,
        italics: true,
        color: '#666666',
        margin: [0, 5, 0, 0],
      };
    }

    const rows = [];

    for (let index = 0; index < holders.length; index += 2) {
      const first = holders[index];
      const second = holders[index + 1];

      rows.push([
        buildHolder(first),
        second ? buildHolder(second) : { text: '' },
      ]);
    }

    return {
      margin: [0, 5, 0, 0],
      table: {
        widths: ['*', '*'],
        body: rows,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#dddddd',
        vLineColor: () => '#dddddd',
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 5,
        paddingBottom: () => 5,
      },
    };
  };

  const buildProcedure = (procedure: ProcedureLocation):any => ({
    margin: [0, 0, 0, 12],

    /*
     * Una tabla de una sola celda funciona como "card".
     */
    table: {
      widths: ['*'],
      body: [
        [
          {
            margin: [8, 6, 8, 6],
            stack: [
              /*
               * Encabezado: código + estado
               */
              {
                columns: [
                  {
                    width: '*',
                    stack: [
                      {
                        text: procedure.code,
                        bold: true,
                        fontSize: 11,
                      },
                      {
                        text: getGroupName(procedure.group),
                        fontSize: 8,
                        color: '#666666',
                        margin: [0, 2, 0, 0],
                      },
                    ],
                  },
                  {
                    width: 'auto',
                    text: procedure.state,
                    bold: true,
                    fontSize: 8,
                    alignment: 'right',
                    margin: [10, 2, 0, 0],
                  },
                ],
              },

              /*
               * Referencia
               */
              {
                text: procedure.reference,
                fontSize: 9,
                margin: [0, 7, 0, 0],
              },

              /*
               * Poseedores actuales
               */
              {
                text: 'ACTUALMENTE CON',
                bold: true,
                fontSize: 8,
                margin: [0, 10, 0, 0],
                color: '#555555',
              },

              buildHoldersTable(procedure.holders),
            ],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.7,
      vLineWidth: () => 0.7,
      hLineColor: () => '#cccccc',
      vLineColor: () => '#cccccc',
    },
  });

  return {
    header: {
      alignment: 'center',
      margin: [30, 10, 30, 0],
      columns: [
        {
          width: 120,
          image: rightImage,
          alignment: 'left',
        },
        {
          width: '*',
          text: [
            {
              text: 'Sistema de Seguimiento de Trámites',
            },
            {
              text: `\n${title}`,
              fontSize: 14,
              bold: true,
            },
          ],
        },
        {
          width: 120,
          text: '',
        },
      ],
    },

    footer: (currentPage, pageCount) => ({
      margin: [30, 0, 30, 20],
      fontSize: 8,
      columns: [
        {
          stack: [
            {
              text: `Generado por: ${userName ?? 'Desconocido'}`,
            },
            {
              text: `Fecha: ${new Date().toLocaleString('es-BO')}`,
            },
          ],
          alignment: 'left',
        },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: 'right',
        },
      ],
    }),

    /*
     * Para este formato ya no necesitamos landscape.
     * Vertical aprovecha mejor los bloques.
     */
    pageSize: 'LETTER',
    pageOrientation: 'portrait',
    pageMargins: [30, 60, 30, 45],

    content: [
      ...(parameters
        ? [
            {
              text: 'Parámetros de búsqueda:',
              style: 'subtitle',
            },
            {
              fontSize: 9,
              layout: 'noBorders',
              table: {
                widths: [110, '*'],
                body:
                  parametersList.length > 0
                    ? parametersList.map(([key, value]) => [
                        {
                          text: `${key}:`,
                          bold: true,
                        },
                        {
                          text: value,
                        },
                      ])
                    : [
                        [
                          {
                            text: 'Sin parámetros',
                            colSpan: 2,
                          },
                          '',
                        ],
                      ],
              },
            },
          ]
        : []),

      {
        text: `Resultados: ${procedures.length}`,
        style: 'subtitle',
      },

      ...(procedures.length > 0
        ? procedures.map(buildProcedure)
        : [
            {
              text: 'No se encontraron resultados.',
              fontSize: 9,
              color: '#666666',
            },
          ]),
    ],

    styles: {
      subtitle: {
        bold: true,
        fontSize: 10,
        margin: [0, 15, 0, 5],
      },
    },

    defaultStyle: {
      fontSize: 9,
    },
  };
};