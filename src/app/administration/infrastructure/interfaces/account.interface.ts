import { user } from '../../../users/infrastructure';
import { dependency } from './dependency.interface';
import { officer } from './officer.interface';

export interface account {
  _id: string;
  dependencia: dependency;
  officer?: officer;
  jobtitle: string;
  employmentType?: string;
  isVisible: boolean;
  user: user;
  area?: number;
}

export interface MailResult {
  ok: boolean;
  message: string;
}
