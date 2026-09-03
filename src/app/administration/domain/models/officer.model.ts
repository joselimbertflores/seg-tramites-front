interface OfficerProps {
  id: string;
  nombre: string;
  paterno: string | null;
  materno: string | null;
  dni: string;
  telefono: number | null;
  activo: boolean;
  email?: string | null;
}

export class Officer {
  public id: string;
  public nombre: string;
  public paterno: string | null;
  public materno: string | null;
  public dni: string;
  public telefono: number | null;
  public activo: boolean;
  public email?: string | null;

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
    return [this.nombre, this.paterno, this.materno]
      .filter(Boolean)
      .join(' ');
  }
}
