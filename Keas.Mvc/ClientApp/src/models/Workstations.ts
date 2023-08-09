import { ObjectSchema, number, object, string, mixed } from 'yup';
import { IPerson } from './People';
import { ISpace } from './Spaces';

export interface IWorkstation {
  id: number;
  name: string;
  space: ISpace;
  tags: string;
  notes: string;
  teamId: number;
  assignment?: IWorkstationAssignment;
}

export const workstationSchema: ObjectSchema<IWorkstation> = object({
  id: number(),
  name: string().required().max(64),
  space: mixed<ISpace>().required(),
  tags: string().notRequired().nullable(),
  notes: string().notRequired().nullable(),
  teamId: number(),
  assignment: mixed<IWorkstationAssignment>().notRequired().nullable()
});

export interface IWorkstationAssignment {
  id: number;
  workstationId: number;
  expiresAt: Date;
  person: IPerson;
}
