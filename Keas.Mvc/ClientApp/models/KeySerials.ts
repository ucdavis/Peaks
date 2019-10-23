import { IPerson } from 'ClientApp/Types';
import * as yup from 'yup';
import { IKey } from './Keys';

export interface IKeySerial {
  id: number;
  number: string;
  status: string;
  notes: string;
  key: IKey;
  keySerialAssignment?: IKeySerialAssignment;
}

export const keySerialSchema = yup.object<IKeySerial>().shape({
  id: yup.number(),
  key: yup.object<IKey>(),
  keySerialAssignment: yup.object<IKeySerialAssignment>().nullable(),
  notes: yup
    .string()
    .notRequired()
    .nullable(),
  number: yup
    .string()
    .required('Serial Number is required.')
    .max(64)
    .test(
      'reservedNames',
      'The serial number you have chosen is already in use.',
      function test(value) {
        const context: any = this.options.context;
        const val = !context.reservedNames.some(x => x === value);
        return val;
      }
    ),
  status: yup
    .string()
    .oneOf(['Active', 'Lost', 'Destroyed', 'Special'])
    .default('Active')
    .required()
});

export interface IKeySerialAssignment {
  id: number;
  expiresAt: Date;
  keySerial: IKeySerial;
  keySerialId: number;
  person: IPerson;
}

export const keySerialAssignmentSchema = yup.object<IKeySerialAssignment>({
  expiresAt: yup.date(),
  id: yup.number(),
  keySerial: yup.object<IKeySerial>(),
  keySerialId: yup.number(),
  person: yup.object<IPerson>()
});
