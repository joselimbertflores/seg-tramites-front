import { Officer } from '../../domain';
import { officer } from '../interfaces/officer.interface';

export class OfficerMapper {
  static fromResponse(response: officer): Officer {
    return new Officer({
      id: response['_id'],
      nombre: response['nombre'],
      paterno: response['paterno'] ?? null,
      materno: response['materno'] ?? null,
      dni: response['dni']?.toString() ?? '',
      telefono: response['telefono'] ?? null,
      activo: response['activo'],
      email: response['email'] ?? null,
    });
  }
}
