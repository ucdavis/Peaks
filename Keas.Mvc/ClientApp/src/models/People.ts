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

export interface IPersonInfo {
  person: IPerson;
  id: number;
  accessCount: number;
  equipmentCount: number;
  keyCount: number;
  workstationCount: number;
}

export const personSchema: ObjectSchema<IPerson> = object().shape({
  active: boolean().notRequired().nullable(),
  category: string().notRequired().nullable(),
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
  endDate: date().notRequired().nullable(),
  firstName: string().max(50).required('First name is a required field.'),
  homePhone: string().notRequired().nullable(),
  id: number(),
  isSupervisor: boolean().notRequired().nullable(),
  lastName: string().max(50).required('Last name is a required field.'),
  name: string(),
  notes: string().notRequired().nullable(),
  startDate: date().notRequired().nullable(),
  supervisor: object<IPerson>().notRequired().nullable(),
  supervisorId: number().notRequired().nullable(),
  tags: string().notRequired().nullable(),
  teamId: number(),
  teamPhone: string().notRequired().nullable(),
  title: string().notRequired().nullable(),
  user: mixed<IUser>().nullable(),
  userId: string()
});
