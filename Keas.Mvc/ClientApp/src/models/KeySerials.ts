import { ObjectSchema, number, object, string, mixed } from 'yup';
import { IKey } from './Keys';
import { IPerson } from './People';

export interface IKeySerial {
  id: number;
  number: string;
  status: string;
  notes: string;
  key: IKey;
  keyId?: number;
  keySerialAssignment?: IKeySerialAssignment;
}

export const keySerialSchema: ObjectSchema<IKeySerial> = object({
  id: number(),
  number: string()
    .required('Serial Number is required.')
    .max(64)
    .test(
      'checkIfKeySerialNumberIsValid',
      'The serial number you have chosen is already in use.',
      function test(value) {
        const context: any = this.options.context;
        // on people page, keyId is pulled from searching
        // on key serials page, key obj is passed in
        const keyId = this.parent.key ? this.parent.key.id : this.parent.keyId;
        return context.checkIfKeySerialNumberIsValid(
          keyId,
          value,
          this.parent.id
        );
      }
    ),
  status: string()
    .oneOf(['Active', 'Lost', 'Destroyed', 'Special', 'Dog ate'])
    .default('Active')
    .required(),
  notes: string().notRequired().nullable(),
  key: mixed<IKey>(),
  keyId: number().notRequired().nullable(),
  keySerialAssignment: mixed<IKeySerialAssignment>().nullable()
});

export interface IKeySerialAssignment {
  id: number;
  expiresAt: Date;
  keySerial: IKeySerial;
  keySerialId: number;
  person: IPerson;
}
