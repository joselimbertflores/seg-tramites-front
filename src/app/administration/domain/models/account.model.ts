import { Officer } from './officer.model';

interface AccountProps {
  id: string;
  officer?: Officer | null;
  isVisible: boolean;
  dependencia: dependency;
  institution: institution;
  user: user | null;
  role: role;
  jobtitle: string;
  employmentType?: string | null;
  area: number | null;
}

interface dependency {
  _id: string;
  nombre: string;
  codigo: string;
}

interface institution {
  _id: string;
  nombre: string;
}

interface user {
  externalKey?: string;
  fullname: string;
  login?: string;
  isActive: boolean;
  roles: role[];
}

interface role {
  _id: string;
  name: string;
}

export class Account {
  id: string;
  officer?: Officer | null;
  isVisible: boolean;
  dependencia: dependency;
  institution: institution;
  jobtitle: string;
  user: user | null;
  role: role;
  area: number | null;
  employmentType?: string | null;

  constructor({
    id: _id,
    officer,
    isVisible,
    dependencia,
    institution,
    jobtitle,
    user,
    role,
    area,
    employmentType,
  }: AccountProps) {
    this.id = _id;
    this.officer = officer;
    this.dependencia = dependencia;
    this.institution = institution;
    this.isVisible = isVisible;
    this.jobtitle = jobtitle;
    this.user = user;
    this.role = role;
    this.area = area;
    this.employmentType = employmentType;
  }

  get fullnameManager(): string {
    return this.officer ? this.officer.fullName : 'SIN ASIGNAR';
  }
}
