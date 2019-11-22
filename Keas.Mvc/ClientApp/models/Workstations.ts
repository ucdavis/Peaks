import * as yup from 'yup';
import { ISpace } from '../Types';
import { IPerson } from './People';

export interface IWorkstation {
  id: number;
  name: string;
  space: ISpace;
  tags: string;
  notes: string;
  teamId: number;
  assignment?: IWorkstationAssignment;
}

export const workstationSchema = yup.object<IWorkstation>().shape({
  assignment: yup
    .object<IWorkstationAssignment>()
    .notRequired()
    .nullable(),
  id: yup.number(),
  name: yup
    .string()
    .required()
    .max(64),
  notes: yup
    .string()
    .notRequired()
    .nullable(),
  space: yup.object<ISpace>().required(),
  tags: yup
    .string()
    .notRequired()
    .nullable(),
  teamId: yup.number()
});

export interface IWorkstationAssignment {
  id: number;
  workstationId: number;
  expiresAt: Date;
  person: IPerson;
}
