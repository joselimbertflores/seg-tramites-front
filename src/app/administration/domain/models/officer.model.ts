interface OfficerProps {
  id: string;
  nombre: string;
  paterno: string;
  materno: string;
  dni: string;
  telefono: number;
  activo: boolean;
  email?: string;
}

export class Officer {
  public id: string;
  public nombre: string;
  public paterno: string;
  public materno: string;
  public dni: string;
  public telefono: number;
  public activo: boolean;
  public email?: string;

  constructor({
    id: _id,
    nombre,
    paterno,
    materno,
    dni,
    telefono,
    activo,
    email,
  }: OfficerProps) {
    this.id = _id;
    this.nombre = nombre;
    this.paterno = paterno;
    this.materno = materno;
    this.dni = dni;
    this.telefono = telefono;
    this.activo = activo;
    this.email = email;
  }

  get fullName() {
    return `${this.nombre} ${this.paterno} ${this.materno}`;
  }
}
