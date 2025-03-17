import { Injectable } from '@angular/core';
import { Procedure } from '../../procedures/domain';
import { Communication } from '../../communications/domain';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PdfTemplates } from '../../helpers';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  async generateRouteSheet(procedure: Procedure, workflow: Communication[]) {
    // workflow = workflow
    //   .map(({ dispatches, ...values }) => ({
    //     ...values,
    //     dispatches: dispatches.filter(
    //       (el) => el.status !== StatusMail.Rejected
    //     ),
    //   }))
    //   .filter((el) => el.dispatches.length > 0);
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [30, 30, 30, 30],
      content: await PdfTemplates.routeMap(procedure, workflow),
      footer: {
        margin: [10, 0, 10, 0],
        fontSize: 7,
        pageBreak: 'after',
        text: [
          {
            text: 'NOTA: Esta hoja de ruta de correspondencia, no debera ser separada ni extraviada del documento del cual se encuentra adherida, por constituirse parte indivisible del mismo',
            bold: true,
          },
          {
            text: '\nDireccion: Plaza 6 de agosto E-0415 - Telefono: No. Piloto 4701677 - 4702301 - 4703059 - Fax interno: 143',
            color: '#BC6C25',
          },
          {
            text: '\nE-mail: info@sacaba.gob.bo - Pagina web: www.sacaba.gob.bo',
            color: '#BC6C25',
          },
        ],
      },
      styles: {
        cabecera: {
          margin: [0, 0, 0, 2],
        },
        header: {
          fontSize: 10,
          bold: true,
        },
        tableExample: {
          fontSize: 8,
          alignment: 'center',
          margin: [0, 0, 0, 5],
        },
        selection_container: {
          fontSize: 7,
          alignment: 'center',
          margin: [0, 10, 0, 0],
        },
      },
    };
    pdfMake.createPdf(docDefinition).print();
  }
}
