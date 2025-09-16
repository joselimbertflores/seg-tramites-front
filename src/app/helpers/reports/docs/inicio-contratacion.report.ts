import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { ProcurementProcedure } from '../../../procedures/domain';
import { heeaderSection } from './header-doc.section';

export const getInicioContratacionReport = async (
  procedure: ProcurementProcedure,
  index: number
) => {
  const {
    cite = '',
    sender = { fullname: '', jobtitle: '' },
    recipient = { fullname: '', jobtitle: '' },
    via,
    date,
    reference,
  } = procedure.documents[index];

  const docx = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'defaultStyle',
          name: 'Default Style',
          basedOn: 'Normal',
          run: {
            size: 18,
          },
        },
      ],
    },

    sections: [
      {
        headers: {
          default: await heeaderSection(),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'aaa', size: 14 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: 'Cc. Arch.', size: 14 })],
              }),
            ],
          }),
        },
        properties: {
          page: {
            size: {
              width: 12240, // 8.5 pulgadas en 1/72 de pulgada
              height: 15840, // 11 pulgadas en 1/72 de pulgada
            },
          },
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'COMUNICACION INTERNA',
                bold: true,
                color: '000000',
              }),
            ],
          }),
          new Paragraph({
            text: `Nº CITE: ${cite}`,
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 400,
            },
          }),
          new Table({
            borders: TableBorders.NONE,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              // ...to.map((recipient) =>
              //   this._communicatioPropsRow(
              //     'A:',
              //     recipient.fullname,
              //     recipient.jobtitle
              //   )
              // ),
              // ...via.map((recipient) =>
              //   this._communicatioPropsRow(
              //     'VIA:',
              //     recipient.fullname,
              //     recipient.jobtitle
              //   )
              // ),
              // this._communicatioPropsRow('DE:', from.fullname, from.jobtitle),
              // this._communicatioPropsRow('MOTIVO:', referenec),
              // this._communicatioPropsRow('FECHA', `Sacaba, ${created}`),
            ],
          }),
        ],
      },
    ],
  });
  return docx;
};

interface participant {
  name: string;
  jobtitle: string;
  prefix: string;
}

const communicatioDetail = (participants: participant[], reference: string) => {
  return new TableRow({
    height: { value: 500, rule: 'auto' },
    children: [
    //   ...participants.map(
    //     (item) =>
    //       new TableCell({
    //         width: { size: 20, type: WidthType.PERCENTAGE },
    //         children: [
    //           new Paragraph({
    //             style: 'defaultStyle',
    //             alignment: 'right',
    //             children: [new TextRun({ text: prop, bold: true })],
    //           }),
    //         ],
    //       })
    //   ),

    //   new TableCell({
    //     width: { size: 35, type: WidthType.PERCENTAGE },
    //     children: [new Paragraph({ text: value, style: 'defaultStyle' })],
    //     ...(detail && { columnSpan: 2 }),
    //   }),
    //   ...(detail
    //     ? [
    //         new TableCell({
    //           width: { size: 45, type: WidthType.PERCENTAGE },
    //           children: [
    //             new Paragraph({
    //               style: 'defaultStyle',
    //               children: [new TextRun({ text: detail, bold: true })],
    //             }),
    //           ],
    //         }),
    //       ]
    //     : []),
    ],
  });
};
