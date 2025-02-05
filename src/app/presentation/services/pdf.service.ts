import { Injectable, inject } from '@angular/core';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {
  ExternalProcedure,
  GroupProcedure,
  InternalProcedure,
  Procedure,
  StatusMail,
  Workflow,
} from '../../domain/models';

import { CreateRouteMap } from '../../helpers/pdf/route-map';
import {
  account,
  communicationResponse,
} from '../../infraestructure/interfaces';
import {
  AccountSheet,
  ApprovedSheet,
  IndexCard,
  PdfTemplates,
  convertImageABase64,
} from '../../helpers';
import { UnlinkSheet } from '../../helpers/pdf/unlink-form';
import { AuthService } from '../../auth/presentation/services/auth.service';
import { createReportSheet } from '../../helpers/pdf/report-sheet';
import { ReportSheetProps } from '../../domain/interfaces';
import { Account } from '../../administration/domain';
import { ProcurementProcedure } from '../../procedures/domain';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private readonly authService = inject(AuthService);
  async generateRouteSheet(procedure: Procedure, workflow: Workflow[]) {
    workflow = workflow
      .map(({ dispatches, ...values }) => ({
        ...values,
        dispatches: dispatches.filter(
          (el) => el.status !== StatusMail.Rejected
        ),
      }))
      .filter((el) => el.dispatches.length > 0);
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [30, 30, 30, 30],
      content: await CreateRouteMap(procedure, workflow),
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

  async GenerateUnlinkSheet(data: communicationResponse[], account: account) {
    const date = new Date();
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      content: [
        await ApprovedSheet.createHeader({
          code: 'SF-000-74-RG31',
          title:
            'SOLICITUD DE BAJA DE USUARIO DE SISTEMA DE SEGUIMIENTO DE TRAMITES',
          date: '20/06/2023',
        }),
        UnlinkSheet.CreateSectionDetails(account, date, data),
        UnlinkSheet.CreateSectionList(data, date),
      ],
      footer: function (currentPage, pageCount) {
        if (currentPage === 1)
          return [
            {
              margin: [10, 0, 10, 0],
              fontSize: 8,
              text: 'Este formulario no exime que a futuro se solicite al servidor(a) público información respecto a trámites o procesos que hubieran estado a su cargo hasta el último día laboral en la Entidad, también NO impide ni se constituye en prueba para ninguna Auditoria u otros.',
            },
          ];
        currentPage--;
        pageCount--;
        return [
          {
            margin: [0, 20, 20, 0],
            fontSize: 9,
            text: {
              text: 'Pagina ' + currentPage.toString() + ' de ' + pageCount,
              alignment: 'right',
            },
          },
        ];
      },
    };
    pdfMake.createPdf(docDefinition).print();
  }

  async createAccountSheet(account: Account, login: string, password: string) {
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [40, 40, 40, 40],
      content: [
        await ApprovedSheet.createHeader({
          title:
            'ASIGNACION DE USUARIO DE SISTEMA DE SEGUIMIENTO DE TRAMITES INTERNOS Y EXTERNOS',
          code: 'SF-000-74-RG26',
          date: '20/02/2020',
        }),
        AccountSheet.createContent(account, login, password),
      ],
    };
    pdfMake.createPdf(docDefinition).print();
  }

  async GenerateIndexCard(procedure: Procedure, workflow: Workflow[]) {
    const docDefinition: TDocumentDefinitions = {
      header: {
        columns: [
          {
            width: 100,
            image: await convertImageABase64(
              '../../../assets/img/gams/logo_alcaldia.jpeg'
            ),
          },
          {
            width: '*',
            text: [
              `\nFicha de tramite ${
                procedure.group === GroupProcedure.External
                  ? 'EXTERNO'
                  : 'INTERNO'
              }`,
              { text: `\n${procedure.code}`, fontSize: 12 },
            ],
            bold: true,
            fontSize: 16,
          },
          {
            width: 100,
            text: `${new Date().toLocaleString()}`,
            fontSize: 10,
            bold: true,
            alignment: 'left',
          },
        ],
        alignment: 'center',
        margin: [10, 10, 10, 10],
      },
      footer: {
        margin: [10, 0, 10, 0],
        fontSize: 8,
        text: `Generado por: 
        })`,
      },
      pageSize: 'LETTER',
      pageMargins: [30, 110, 40, 30],
      content: [
        IndexCard.CreateDetailSection(procedure),
        ...(procedure.group === GroupProcedure.External
          ? [IndexCard.CreateExternalSection(procedure as ExternalProcedure)]
          : [IndexCard.CreateInternalSection(procedure as InternalProcedure)]),
        IndexCard.CreateLocationSection(workflow),
        IndexCard.CreateSectionWorkflow(workflow),
      ],
      styles: {
        table: {
          marginTop: 20,
        },
        tableHeader: {
          fillColor: '#0077B6',
          color: 'white',
          bold: true,
          fontSize: 9,
          alignment: 'center',
        },
      },
    };
    pdfMake.createPdf(docDefinition).print();
  }

  async GenerateReportSheet(props: ReportSheetProps) {
    const sheet = await createReportSheet(props, this.manager);
    pdfMake.createPdf(sheet).print();
  }

  async solicitudIniciContratacion(
    procedure: ProcurementProcedure,
    index: number
  ) {
    const documentDefinition =
      await PdfTemplates.document_solicitudInicioContratacion(procedure, index);
    pdfMake.createPdf(documentDefinition).print();
  }

  private get manager() {
    return 'Desvinculado';
  }
}
