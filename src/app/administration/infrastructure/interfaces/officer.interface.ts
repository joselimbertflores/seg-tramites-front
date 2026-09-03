export interface officer {
  _id: string;
  nombre: string;
  paterno: string | null;
  materno: string | null;
  dni: string;
  telefono: number | null;
  direccion: string;
  activo: boolean;
  email?: string | null;
}
