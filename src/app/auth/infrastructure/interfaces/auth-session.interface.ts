import { account } from '../../../administration/infrastructure/interfaces/account.interface';
import { menu, validResource } from './menu-front.interface';

export interface SessionUser {
  userId: string;
  fullname: string;
  login?: string;
  externalKey?: string;
}

export type AuthMethod = 'LOCAL' | 'IDENTITY_HUB';

export type AuthSession = {
  user: SessionUser;
  menu: menu[];
  permissions: Partial<Record<validResource, string[]>>;
  account: account | null;
} & (
  | { authMethod: 'LOCAL'; updatedPassword: boolean }
  | { authMethod: 'IDENTITY_HUB'; updatedPassword?: never }
);
