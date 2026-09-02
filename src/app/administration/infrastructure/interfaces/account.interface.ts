import { user } from '../../../users/infrastructure';
import { dependency } from './dependency.interface';
import { officer } from './officer.interface';
import { institution } from './institution.interface';
import { role } from '../../../users/infrastructure';

export interface account {
  _id: string;
  dependencia: dependency;
  institution: institution;
  officer?: officer | null;
  jobtitle: string;
  employmentType?: string | null;
  isVisible: boolean;
  user: user | null;
  role: role;
  area?: number;
}
