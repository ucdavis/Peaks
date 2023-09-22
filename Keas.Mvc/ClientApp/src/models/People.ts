import {
  ObjectSchema,
  boolean,
  date,
  mixed,
  number,
  object,
  string
} from 'yup';

export interface IUser {
  firstName: string;
  lastName: string;
  name: string;
  pronouns: string;
  email: string;
  id: string;
  iam: string;
}

export interface IPerson {
  active?: boolean;
  id: number;
  userId: string;
  teamId: number;
  user?: IUser;
  tags: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  homePhone: string;
  teamPhone: string;
  title: string;
  supervisorId?: number;
  supervisor?: IPerson;
  startDate: Date;
  endDate: Date;
  category: string;
  notes: string;
  isSupervisor: boolean;
}

export const personSchema: ObjectSchema<IPerson> = object({
  active: boolean().notRequired().nullable(),
  id: number(),
  userId: string(),
  teamId: number(),
  user: mixed<IUser>().nullable(),
  tags: string().notRequired().nullable(),
  firstName: string().max(50).required('First name is a required field.'),
  lastName: string().max(50).required('Last name is a required field.'),
  name: string(),
  email: string()
    .max(256)
    .required()
    .test(
      'validateEmail',
      'The email you have entered is not valid',
      function test(value) {
        const context: any = this.options.context;
        return context.validateEmail(value);
      }
    ),
  homePhone: string().notRequired().nullable(),
  teamPhone: string().notRequired().nullable(),
  title: string().notRequired().nullable(),
  supervisor: mixed<IPerson>().notRequired().nullable(),
  supervisorId: number().notRequired().nullable(),
  startDate: date().notRequired().nullable(),
  endDate: date().notRequired().nullable(),
  category: string().notRequired().nullable(),
  notes: string().notRequired().nullable(),
  isSupervisor: boolean().notRequired().nullable()
});

export interface IPersonInfo {
  person: IPerson;
  id: number;
  accessCount: number;
  equipmentCount: number;
  keyCount: number;
  workstationCount: number;
}
