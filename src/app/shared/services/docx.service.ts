import { Injectable } from '@angular/core';
import { Document, Packer } from 'docx';

import { DocxTemplates } from '../../helpers';
import { Doc } from '../../communications/domain';
import { ProcurementProcedure } from '../../procedures/domain';

@Injectable({
  providedIn: 'root',
})
export class DocxService {
  constructor() {}

  async solicitudIniciContratacion(
    procedure: ProcurementProcedure,
    index: number
  ) {
    const fileName = procedure.documents[index].cite ?? 'SIN_CITE';
    const docx = await DocxTemplates.document_solicitudInicioContratacion(
      procedure,
      index
    );
    this._dowloadDocument(docx, `Solicitud_Inicio_Contratacion_${fileName}`);
  }

  async solicitudCertificacionPoa(
    procedure: ProcurementProcedure,
    index: number
  ) {
    const fileName = procedure.documents[index].cite ?? 'SIN_CITE';
    const docx = await DocxTemplates.document_solicitudCertificacionPoa(
      procedure,
      index
    );
    this._dowloadDocument(docx, `Solicitud_Certificacion_Poa_${fileName}`);
  }

  async solicitudCertificacionPresupuestaria(
    procedure: ProcurementProcedure,
    index: number
  ) {
    const fileName = procedure.documents[index].cite ?? 'SIN_CITE';
    const docx = await DocxTemplates.document_solicitudCertificacionPresupuestaria(
      procedure,
      index
    );
    this._dowloadDocument(
      docx,
      `Solicitud_Certificacion_Presupuestaria_${fileName}`
    );
  }

  async generateDocument(item: Doc) {
    const docx = new Document({
      sections: [
        {
          // headers: {
          //   default: await DocxTemplates.documentHeader(),
          // },
          properties: {
            page: {
              size: {
                width: 12240, // 8.5 pulgadas en 1/72 de pulgada
                height: 15840, // 11 pulgadas en 1/72 de pulgada
              },
            },
          },
          children: [],
        },
      ],
    });
  }

  private _dowloadDocument(docx: Document, fileName: string) {
    Packer.toBlob(docx).then((blob) => {
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace('/', '_').trim()}.docx`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }
}
