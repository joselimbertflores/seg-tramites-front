import { Content } from 'pdfmake/interfaces';
import { Account } from '../../administration/domain';
function createContent(
  account: Account,
  login: string,
  password: string
): Content {
  return [
    {
      marginTop: 50,
      text: [
        'NOMBRE: ',
        {
          text: `${account.fullnameManager}\n\n`.toUpperCase(),
          bold: false,
        },
        'CARGO: ',
        {
          text: `${account.jobtitle}\n\n`,
          bold: false,
        },
        'UNIDAD: ',
        {
          text: `${account.dependencia.nombre}`.toUpperCase(),
          bold: false,
        },
      ],
      style: 'header',
      alignment: 'center',
      fontSize: 12,
    },
    {
      marginTop: 25,
      text: '\n\nCUENTA\n\n',
      style: 'header',
      alignment: 'center',
    },
    {
      text: [
        'Usuario: ',
        { text: `${login}\n\n`, bold: false },
        'Contraseña: ',
        { text: `${password ? password : '*********'}\n\n`, bold: false },
      ],
      style: 'header',
      alignment: 'center',
      fontSize: 12,
    },
    {
      text: 'La contraseña ingresada en el reporte debe ser cambiada una vez ingresada al sistema para que sea solo de conocimiento del usuario ',
      style: 'header',
      alignment: 'center',
      fontSize: 10,
    },
    {
      text: '\n\nEs responsabilidad del usuario el uso de la cuenta asignada\n\n',
      style: 'header',
      alignment: 'center',
      fontSize: 10,
      marginBottom: 50,
    },
    {
      qr: `${account.fullnameManager} Dni: ${account.officer?.dni}`,
      alignment: 'right',
      fit: 100,
    },
    {
      marginTop: 20,
      columns: [
        {
          width: 90,
          text: '',
        },
        {
          width: '*',
          text: 'Sello y firma \n USUARIO',
          alignment: 'center',
        },
        {
          width: '*',
          text: 'Sello y firma \n ADMINISTRADOR',
          alignment: 'center',
        },
        {
          width: 90,
          text: '',
        },
      ],
    },
  ];
}

export const AccountSheet = {
  createContent,
};
