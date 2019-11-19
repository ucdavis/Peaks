import * as yup from 'yup';

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

export const personSchema = yup.object<IPerson>().shape({
  active: yup
    .boolean()
    .notRequired()
    .nullable(),
  category: yup
    .string()
    .notRequired()
    .nullable(),
  email: yup
    .string()
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
  endDate: yup
    .date()
    .notRequired()
    .nullable(),
  firstName: yup
    .string()
    .max(50)
    .required('First name is a required field.'),
  homePhone: yup
    .string()
    .notRequired()
    .nullable(),
  id: yup.number(),
  isSupervisor: yup
    .boolean()
    .notRequired()
    .nullable(),
  lastName: yup
    .string()
    .max(50)
    .required('Last name is a required field.'),
  name: yup.string(),
  notes: yup
    .string()
    .notRequired()
    .nullable(),
  startDate: yup
    .date()
    .notRequired()
    .nullable(),
  supervisor: yup
    .object<IPerson>()
    .notRequired()
    .nullable(),
  supervisorId: yup
    .number()
    .notRequired()
    .nullable(),
  tags: yup.string().notRequired(),
  teamId: yup.number(),
  teamPhone: yup
    .string()
    .notRequired()
    .nullable(),
  title: yup
    .string()
    .notRequired()
    .nullable(),
  user: yup.object<IUser>().nullable(),
  userId: yup.string()
});
