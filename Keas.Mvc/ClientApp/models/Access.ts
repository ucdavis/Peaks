import * as yup from 'yup';
import { IPerson } from './People';

export interface IAccess {
  assignments: IAccessAssignment[];
  id: number;
  name: string;
  notes: string;
  tags: string;
  teamId: number;
}

export const keySchema = yup.object<IAccess>().shape({
  assignments: yup.array<IAccessAssignment>().nullable(),
  id: yup.number(),
  name: yup
    .string()
    .required()
    .max(64),
  notes: yup.string().notRequired(),
  tags: yup.string().notRequired(),
  teamId: yup.number()
});

export interface IAccessAssignment {
  id: number;
  accessId: number;
  access: IAccess;
  expiresAt: Date;
  person: IPerson;
  personId: number;
}
