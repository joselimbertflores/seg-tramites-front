import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { convertImageABase64 } from './image_base64';
import { ProcurementProcedure } from '../procedures/domain';
import pdfMake from 'pdfmake/build/pdfmake';

interface internalDocProps {
  cite?: string;
  date?: Date;
  reference?: string;
}
export class PdfTemplates {
  static async headerInternalDocument(): Promise<Content> {
    const leftImage = await convertImageABase64(
      'images/institution/alcaldia.jpeg'
    );
    const rightImage = await convertImageABase64(
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

  static titleInternalDocument(props: internalDocProps): Content {
    return [
      {
        text: 'COMUNICACION INTERNA',
        bold: true,
        fontSize: 16,
        alignment: 'center',
      },
      {
        text: `${props.cite}\n\n`,
        bold: true,
        fontSize: 14,
        alignment: 'center',
      },
      {
        table: {
          widths: [80, '*', '*'],
          heights: 20,
          body: [
            [{ text: 'A', bold: true }, 'Sample value 2', 'Sample value 3'],
            [{ text: 'VIA', bold: true }, 'Sample value 2', 'Sample value 3'],
            [{ text: 'DE', bold: true }, 'Sample value 2', 'Sample value 3'],
            [
              { text: 'MOTIVO', bold: true },
              { colSpan: 2, text: props.reference },
              '',
            ],
            [
              { text: 'FECHA', bold: true },
              {
                colSpan: 2,
                text: `Sacaba, ${props.date?.toLocaleString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}`,
              },
              '',
            ],
          ],
        },
        layout: 'noBorders',
      },
    ];
  }

  static content_solicitudInicioContratacion(): Content {
    return [
      { text: '\nDe mi mayor consideración:', marginBottom: 10 },
      {
        text: 'Por medio de la presente tengo a bien solicitar a su autoridad se viabilice el inicio de proceso de contratación menor UNIDAD DE GOBIERNO ELECTRONICO Y SISTEMAS TECNOLOGICOS (ADQUISICION DE SERVIDOR DE DATOS, BATERIAS Y DISCOS PARA SERVIDOR DE ALMACENAMIENTO). ',
        marginBottom: 10,
      },
      {
        text: 'En el marco del Plan de Software Libre se tiene previsto la migración del firewall perimetral a software libre, para lo cual se requiere la adquisición de un servidor de datos donde se realizará la instalación y configuración del firewall en software libre, así mismo en el centro de datos del GAM Sacaba se cuenta con 3 servidores de almacenamiento, estos servidores tienen una antigüedad superior a los 8 años, por lo que se requiere el remplazo de las baterías de sus controladoras, así como el remplazo de discos duros, que ya cumplieron su ciclo de vida útil.',
        marginBottom: 10,
      },
      {
        text: 'Sin otro particular, me despido con las consideraciones más distinguidas',
      },
      { text: 'Atentamente' },
    ];
  }

  static async document_solicitudInicioContratacion(
    procedure: ProcurementProcedure,
    index: number
  ) {
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [50, 50, 50, 50],
      content: [
        await PdfTemplates.headerInternalDocument(),
        PdfTemplates.titleInternalDocument(procedure.documents[index]),
        this.content_solicitudInicioContratacion(),
      ],
    };
    return docDefinition;
  }
}
