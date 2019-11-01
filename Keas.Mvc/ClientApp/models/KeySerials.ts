import * as yup from 'yup';
import { IPerson } from '../Types';
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
      'checkIfKeySerialNumberIsValid',
      'The serial number you have chosen is already in use.',
      function test(value) {
        const context: any = this.options.context;
        return context.checkIfKeySerialNumberIsValid(value, this.parent.id);
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