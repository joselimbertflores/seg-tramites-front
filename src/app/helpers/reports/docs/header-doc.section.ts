import {
  Header,
  TextRun,
  ImageRun,
  Paragraph,
  TabStopType,
  TabStopPosition,
} from 'docx';

import { imageToBase64 } from '../../image-base64.helper';

export const heeaderSection = async (): Promise<Header> => {
  const leftImage = await imageToBase64('images/institution/alcaldia.jpeg');
  const rightImage = await imageToBase64('images/institution/sacaba.jpeg');
  return new Header({
    children: [
      new Paragraph({
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        children: [
          new ImageRun({
            type: 'jpg',
            data: leftImage,
            transformation: {
              width: 200,
              height: 80,
            },
          }),
          new TextRun('\t'),
          new ImageRun({
            type: 'jpg',

            data: rightImage,
            transformation: {
              width: 80,
              height: 80,
            },
          }),
        ],
      }),
    ],
  });
};
