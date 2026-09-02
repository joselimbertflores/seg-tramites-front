import { role } from './role.interface';

export class user {
  _id: string;
  fullname: string;
  externalKey?: string;
  login?: string;
  isActive: boolean;
  roles: role[];
}
