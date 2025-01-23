import { Officer } from './officer.model';

interface AccountProps {
  _id: string;
  officer?: Officer;
  isVisible: boolean;
  dependencia: dependency;
  user: user;
  jobtitle: string;
  area?: number;
}

interface dependency {
  _id: string;
  nombre: string;
  codigo: string;
}

interface user {
  login: string;
  isActive: boolean;
  role: string;
}

export class Account {
  _id: string;

  officer?: Officer;
  isVisible: boolean;
  dependencia: dependency;
  jobtitle: string;
  user: user;

  constructor({
    _id,
    officer,
    isVisible,
    dependencia,
    jobtitle,
    user,
  }: AccountProps) {
    this._id = _id;
    this.officer = officer;
    this.dependencia = dependencia;
    this.isVisible = isVisible;
    this.jobtitle = jobtitle;
    this.user = user;
  }

  get fullnameManager(): string {
    return this.officer ? this.officer.fullname : 'DESVINCULADO';
  }
}
