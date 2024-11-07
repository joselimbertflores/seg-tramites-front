import { Injectable } from '@angular/core';
import { Document, Packer, Paragraph, TextRun } from 'docx';

@Injectable({
  providedIn: 'root',
})
export class WordGeneratorService {
  constructor() {}

  // Método para generar Word
  generateWord(): void {
    // Crear un nuevo documento
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun('COMUNICACIÓN INTERNA')],
            }),
            new Paragraph({
              children: [new TextRun(`N° CITE: `), new TextRun(`\tFECHA: `)],
            }),
          ],
        },

        {
          children: [
            new Paragraph({
              children: [new TextRun('A: '), new TextRun('sd')],
            }),
            new Paragraph({
              children: [new TextRun('MOTIVO: '), new TextRun('ss')],
            }),
          ],
        },
        {
          children: [
            new Paragraph({
              children: [new TextRun('Gobierno Autónomo Municipal de Sacaba')],
            }),
          ],
        },
      ],
    });
    Packer.toBlob(doc).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.docx';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
