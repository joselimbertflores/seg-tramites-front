import { Injectable } from '@angular/core';
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

@Injectable({
  providedIn: 'root',
})
export class WordGeneratorService {
  constructor() {}

  generateDocument() {
    const doc = new Document({
      sections: [
        {
          children: [
            // Título principal centrado
            new Paragraph({
              text: 'INSTRUCTIVO',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: 'Sacaba, 10 de diciembre de 2024',
              alignment: AlignmentType.RIGHT,
            }),
            new Paragraph({
              text: 'Nº CITE: INST/SF-DRH-25/248/2024',
              alignment: AlignmentType.RIGHT,
            }),

            // // Tabla para los encabezados
            new Table({
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              },
              rows: [
                this.createTableRow(
                  'A',
                  'DIRECTORES, SUB ALCALDES, JEFES, RESPONSABLES DE UNIDADES'
                ),
                this.createTableRow(
                  'VIA',
                  'Lic. Griselda R. Rojas V.\nSECRETARIA MUNICIPAL DE FINANZAS Y ADMINISTRACION'
                ),
                this.createTableRow(
                  'DE',
                  'Abg. V. Nelson Sánchez L.\nDIRECTOR DE ORGANIZACIÓN ADMINISTRATIVA Y RECURSOS HUMANOS'
                ),
                this.createTableRow(
                  'ASUNTO',
                  'PRESENTACION DE INFORMES GESTION 2024'
                ),
              ],
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
            }),

            // Párrafo de contenido principal
            new Paragraph({
              text:
                'De mi mayor consideración:\n\n' +
                'Por intermedio de la presente se INSTRUYE a ustedes, remitir ante esta Dirección, los informes de trabajo de la gestión 2024, del personal bajo su dependencia, debiendo presentar el indicado informe hasta el 20 de diciembre de la presente gestión impostergablemente.\n\n' +
                'Para su registro correspondiente deberá efectuar el informe de la gestión 2024 en el Formulario – SMFA/DRH/F-002 (descargar de intranet).\n\n' +
                'Debiendo ser presentada ante la Dirección de Organización Administrativa y Recursos Humanos en medio digital (CD) e impreso (consolidado por cada Secretaría, Sub-Alcaldes y Despacho), posterior a ello se entregará sistematizada al Despacho de nuestra MAE.\n\n' +
                'El incumplimiento al presente instructivo se sancionará de acuerdo al Reglamento Interno de Personal.',
              alignment: AlignmentType.JUSTIFIED,
            }),

            // Firma
            new Paragraph({
              text: 'Atentamente,',
              alignment: AlignmentType.LEFT,
            }),
          ],
        },
      ],
    });

    // Generar el archivo y descargarlo
    Packer.toBlob(doc).then((blob) => {
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
}
