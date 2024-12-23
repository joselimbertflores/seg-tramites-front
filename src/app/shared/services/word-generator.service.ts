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
  generateWord() {
    const data = {
      fecha: 'Sacaba, 06 de diciembre de 2020',
      cite: 'Nº CITE: INST/SF-DRH-25/206/2020',
      a: 'TODO EL PERSONAL DE GAMS',
      via: {
        name: 'Lic. Griselda R. Rojas V.',
        title: 'SECRETARIA MUNICIPAL DE FINANZAS Y ADMINISTRACIÓN',
      },
      de: {
        name: 'Abg. V. Nelson Sánchez L.',
        title: 'DIRECTOR DE ORGANIZACIÓN ADMINISTRATIVA Y RECURSOS HUMANOS',
      },
      ref: 'PARTICIPACIÓN DEL ENCENDIDO DE FOQUITOS NAVIDEÑOS',
    };

    // Documento Word
    const doc = new Document({
      sections: [
        {
          children: [
            this.createTitle('INSTRUCTIVO'),
            this.createRightAlignedText(data.fecha),
            this.createRightAlignedText(data.cite, true),
            this.createKeyValuePair('A', data.a, true),
            this.createTable(data.via, data.de),
            this.createKeyValuePair('REF', data.ref, true),
            this.createBodyText('De nuestra mayor consideración:'),
          ],
        },
      ],
    });

    // generar word
    Packer.toBlob(doc).then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'documento_instructivo.docx';
      link.click();
    });
  }

  private createTitle(text: string): Paragraph {
    return new Paragraph({
      alignment: 'center',
      spacing: { after: 300 },
      children: [
        new TextRun({
          text,
          bold: true,
          size: 36,
        }),
      ],
    });
  }

  private createRightAlignedText(text: string, bold: boolean = false): Paragraph {
    return new Paragraph({
      alignment: 'right',
      spacing: { after: 200 },
      children: [
        new TextRun({
          text,
          bold,
          size: 22,
        }),
      ],
    });
  }

  private createKeyValuePair(key: string, value: string, bold: boolean = false): Paragraph {
    return new Paragraph({
      alignment: 'left',
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `${key} : `,
          bold: true,
          size: 22,
        }),
        new TextRun({
          text: value,
          bold,
          size: 22,
        }),
      ],
    });
  }

  private createTable(via: { name: string; title: string }, de: { name: string; title: string }): Table {
    return new Table({
      rows: [
        this.createTableRow('VIA', via.name, via.title),
        this.createTableRow('DE', de.name, de.title),
      ],
      borders: {
        top: { style: 'none' },
        bottom: { style: 'none' },
        left: { style: 'none' },
        right: { style: 'none' },
        insideHorizontal: { style: 'none' },
        insideVertical: { style: 'none' },
      },
    });
  }

  private createTableRow(key: string, name: string, title: string): TableRow {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: `${key} : `, bold: true, size: 22 }),
                new TextRun({ text: name, size: 22 }),
              ],
            }),
          ],
          borders: { top: { style: 'none' }, bottom: { style: 'none' }, left: { style: 'none' }, right: { style: 'none' } },
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: title, bold: true, size: 22 })],
              spacing: { after: 200 },
            }),
          ],
          borders: { top: { style: 'none' }, bottom: { style: 'none' }, left: { style: 'none' }, right: { style: 'none' } },
        }),
      ],
    });
}


  private createBodyText(text: string): Paragraph {
    return new Paragraph({
      alignment: 'left',
      spacing: { line: 276 },
      children: [
        new TextRun({
          text,
          size: 22,
        }),
      ],
    });
  }
}
