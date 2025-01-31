import { Injectable } from '@angular/core';
import { Document, Packer } from 'docx';

import { DocxTemplates } from '../../helpers';
import { Doc } from '../../communications/domain';

@Injectable({
  providedIn: 'root',
})
export class DocxService {
  constructor() {}

  async generateDocument(item: Doc) {
    const docx = new Document({
      sections: [
        {
          headers: {
            default: await DocxTemplates.documentHeader(),
          },
          properties: {
            page: {
              size: {
                width: 12240, // 8.5 pulgadas en 1/72 de pulgada
                height: 15840, // 11 pulgadas en 1/72 de pulgada
              },
            },
          },
          children: [...DocxTemplates.documentTitle(item)],
        },
      ],
    });

    Packer.toBlob(docx).then((blob) => {
      const fileName = `${item.cite.trim().replace('/', '_')}.docx`;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }
}
