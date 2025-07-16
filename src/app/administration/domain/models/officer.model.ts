interface OfficerProps {
  id: string;
  nombre: string;
  paterno: string;
  materno: string;
  dni: string;
  telefono: number;
  activo: boolean;
}

interface credentials {
  login: string;
  password: string;
}
export class Officer {
  public id: string;
  public nombre: string;
  public paterno: string;
  public materno: string;
  public dni: string;
  public telefono: number;
  public activo: boolean;

  constructor({
    id: _id,
    nombre,
    paterno,
    materno,
    dni,
    telefono,
    activo,
  }: OfficerProps) {
    this.id = _id;
    this.nombre = nombre;
    this.paterno = paterno;
    this.materno = materno;
    this.dni = dni;
    this.telefono = telefono;
    this.activo = activo;
  }

  generateCredentials(): credentials {
    return {
      login: `${
        this.nombre.charAt(0) + this.paterno + this.materno.charAt(0)
      }`.trim(),
      password: this.dni.trim(),
    };
  }

  get fullname() {
    return `${this.nombre} ${this.paterno} ${this.materno}`;
  }
}
