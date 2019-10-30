import * as yup from 'yup';
import { ISpace } from '../Types';
import { IKeySerial } from './KeySerials';

export interface IKeyInfo {
  id: number;
  key: IKey;
  serialsTotalCount: number;
  serialsInUseCount: number;
  spacesCount: number;
  code?: string;
}

export interface IKey {
  id: number;
  teamId: number;
  name: string;
  code: string;
  notes: string;
  tags: string;
  serials?: IKeySerial[];
  keyXSpaces?: IKeySpaceAssociation[];
}

export const keySchema = yup.object<IKey>().shape({
  code: yup
    .string()
    .required()
    .test(
      'checkIfKeyCodeIsValid',
      'The key code you have chosen is already in use.',
      function test(value) {
        const context: any = this.options.context;
        return context.checkIfKeyCodeIsValid(value, this.parent.id);
      }
    ),
  id: yup.number(),
  keyXSpaces: yup.array<IKeySpaceAssociation>().nullable(),
  name: yup.string().required(),
  notes: yup.string().notRequired(),
  serials: yup.array<IKeySerial>().nullable(),
  tags: yup.string().notRequired(),
  teamId: yup.number()
});

export interface IKeySpaceAssociation {
  id: number;
  spaceId: number;
  keyId: number;
  space?: ISpace;
  key?: IKey;
}
