interface OfficerProps {
  id: string;
  nombre: string;
  paterno: string | null;
  materno: string | null;
  dni: string;
}

export class Officer {
  public id: string;
  public nombre: string;
  public paterno: string | null;
  public materno: string | null;
  public dni: string;

  constructor({
    id: _id,
    nombre,
    paterno,
    materno,
    dni,
  }: OfficerProps) {
    this.id = _id;
    this.nombre = nombre;
    this.paterno = paterno;
    this.materno = materno;
    this.dni = dni;
  }

  get fullName() {
    return [this.nombre, this.paterno, this.materno]
      .filter(Boolean)
      .join(' ');
  }
}
