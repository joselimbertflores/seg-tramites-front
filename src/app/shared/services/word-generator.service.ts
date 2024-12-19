import { Injectable } from '@angular/core';
import {
  Document,
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

  // Método para generar Word
  generateWord(): void {
    const doc = new Document({
      sections: [
        {
          children: [
            // Título principal
            new Paragraph({
              alignment: 'center',
              spacing: { after: 300 },
              children: [
                new TextRun({
                  text: 'INSTRUCTIVO',
                  bold: true,
                  size: 36,
                }),
              ],
            }),
            // Fecha y número de CITE
            new Paragraph({
              alignment: 'right',
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: 'Sacaba, 06 de diciembre de 2020',
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              alignment: 'right',
              spacing: { after: 300 },
              children: [
                new TextRun({
                  text: 'Nº CITE: INST/SF-DRH-25/206/2020',
                  bold: true,
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              alignment: 'left',
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: 'A      : ',
                  bold: true,
                  size: 22,
                }),
                new TextRun({
                  text: 'TODO EL PERSONAL DE GAMS',
                  bold: true,
                  size: 22,
                }),
              ],
            }),
            // Sección con tabla invisible
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'VIA  : ',
                              bold: true,
                              size: 22,
                            }),
                            new TextRun({
                              text: 'Lic. Griselda R. Rojas V.',
                              size: 22,
                            }),
                          ],
                        }),
                        // espacio entre celdas
                        // new Paragraph({
                        //   spacing: { after: 1 },
                        // }),
                      ],
                      borders: {
                        top: { style: 'none' },
                        bottom: { style: 'none' },
                        left: { style: 'none' },
                        right: { style: 'none' },
                      },
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'SECRETARIA MUNICIPAL DE FINANZAS Y ADMINISTRACIÓN',
                              bold: true,
                              size: 22,
                            }),
                          ],
                        }),
                        new Paragraph({
                          spacing: { after: 1 },
                        }),
                      ],
                      borders: {
                        top: { style: 'none' },
                        bottom: { style: 'none' },
                        left: { style: 'none' },
                        right: { style: 'none' },
                      },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'DE    : ',
                              bold: true,
                              size: 22,
                            }),
                            new TextRun({
                              text: 'Abg. V. Nelson Sánchez L.',
                              size: 22,
                            }),
                          ],
                        }),
                        new Paragraph({
                          spacing: { after: 1 },
                        }),
                      ],
                      borders: {
                        top: { style: 'none' },
                        bottom: { style: 'none' },
                        left: { style: 'none' },
                        right: { style: 'none' },
                      },
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'DIRECTOR DE ORGANIZACIÓN ADMINISTRATIVA Y RECURSOS HUMANOS',
                              bold: true,
                              size: 22,
                            }),
                          ],
                        }),
                        new Paragraph({
                          spacing: { after: 1 },
                        }),
                      ],
                      borders: {
                        top: { style: 'none' },
                        bottom: { style: 'none' },
                        left: { style: 'none' },
                        right: { style: 'none' },
                      },
                    }),
                  ],
                }),
              ],
              borders: {
                top: { style: 'none' },
                bottom: { style: 'none' },
                left: { style: 'none' },
                right: { style: 'none' },
                insideHorizontal: { style: 'none' },
                insideVertical: { style: 'none' },
              },
            }),
            // REF
            new Paragraph({
              alignment: 'left',
              spacing: { after: 300 },
              children: [
                new TextRun({
                  text: 'REF  : ',
                  bold: true,
                  size: 22,
                }),
                new TextRun({
                  text: 'PARTICIPACIÓN DEL ENCENDIDO DE FOQUITOS NAVIDEÑOS',
                  bold: true,
                  size: 22,
                }),
              ],
            }),
            // Cuerpo del mensaje
            new Paragraph({
              alignment: 'left',
              spacing: { line: 276 },
              children: [
                new TextRun({
                  text: 'De nuestra mayor consideración:',
                  size: 22,
                }),
              ],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'documento_instructivo.docx';
      link.click();
    });
  }
}
