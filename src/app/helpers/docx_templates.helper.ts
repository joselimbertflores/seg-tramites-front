import {
  AlignmentType,
  BorderStyle,
  FileChild,
  Header,
  HeadingLevel,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableRow,
  TextRun,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
  WidthType,
} from 'docx';
import { convertImageABase64 } from './image_base64';
import { Doc } from '../communications/domain';

export class DocxTemplates {
  static async documentHeader(): Promise<Header> {
    const leftImage = await convertImageABase64(
      'images/institution/alcaldia.jpeg'
    );
    const rightImage = await convertImageABase64(
      'images/institution/sacaba.jpeg'
    );
    return new Header({
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              type: 'jpg',
              data: leftImage,
              transformation: {
                width: 200,
                height: 80,
              },
              floating: {
                horizontalPosition: {
                  relative: HorizontalPositionRelativeFrom.MARGIN,
                  align: HorizontalPositionAlign.LEFT,
                },
                verticalPosition: {
                  relative: VerticalPositionRelativeFrom.PARAGRAPH,
                  align: VerticalPositionAlign.TOP,
                },
              },
            }),
            new ImageRun({
              type: 'jpg',
              data: rightImage,
              transformation: {
                width: 80,
                height: 80,
              },
              floating: {
                horizontalPosition: {
                  relative: HorizontalPositionRelativeFrom.OUTSIDE_MARGIN,
                  align: HorizontalPositionAlign.RIGHT,
                },
                verticalPosition: {
                  relative: VerticalPositionRelativeFrom.PARAGRAPH,
                  align: VerticalPositionAlign.TOP,
                },
              },
            }),
          ],
        }),
      ],
    });
  }

  static documentTitle(item: Doc): FileChild[] {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: item.title,
            bold: true,
            color: '000000',
          }),
        ],
      }),
      new Paragraph({
        text: `Nº CITE: ${item.cite}`,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
        },
      }),
      new Table({
        borders: TableBorders.NONE,
        columnWidths: [20, 40, 40],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            height: { value: 500, rule: 'auto' },
            children: [
              new TableCell({
                width: { size: 1000, type: WidthType.DXA }, // 20%
                children: [new Paragraph('A  :')],
              }),
              new TableCell({
                width: { size: 3500, type: WidthType.DXA }, // 20%
                children: [new Paragraph(item.recipient.fullname)],
              }),
              new TableCell({
                width: { size: 4500, type: WidthType.DXA }, // 20%
                children: [new Paragraph(item.recipient.jobtitle)],
              }),
            ],
          }),
          new TableRow({
            height: { value: 500, rule: 'auto' },

            children: [
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                children: [new Paragraph('DE  :')],
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                children: [new Paragraph(item.sender.fullname)],
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                children: [new Paragraph(item.sender.jobtitle)],
              }),
            ],
          }),
          new TableRow({
            height: { value: 500, rule: 'auto' },
            children: [
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE }, // 20%
                children: [new Paragraph('MOTIVO :')],
              }),
              new TableCell({
                columnSpan: 2,
                width: { size: 80, type: WidthType.PERCENTAGE }, // 20%
                children: [new Paragraph(item.reference)],
              }),
            ],
          }),
          new TableRow({
            height: { value: 400, rule: 'auto' },
            children: [
              new TableCell({
                children: [new Paragraph('FECHA :')],
              }),
              new TableCell({
                columnSpan: 2,
                children: [
                  new Paragraph(
                    `Sacaba, ${item.createdAt.toLocaleString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}`
                  ),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 4,
            space: 1,
          },
        },
      }),
      new Paragraph({
        spacing: {
          before: 200,
        },
        text: 'Contenido',
      }),
    ];
  }
}
