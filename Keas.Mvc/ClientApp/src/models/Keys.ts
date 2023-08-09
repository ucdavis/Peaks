import { array, ObjectSchema, number, object, string } from 'yup';
import { IKeySerial } from './KeySerials';
import { ISpace } from './Spaces';

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

export const keySchema: ObjectSchema<IKey> = object({
  id: number(),
  teamId: number(),
  name: string().required().max(64),
  code: string()
    .required()
    .max(64)
    .test(
      'checkIfKeyCodeIsValid',
      'The key code you have chosen is already in use.',
      function test(value) {
        const context: any = this.options.context;
        return context.checkIfKeyCodeIsValid(value, this.parent.id);
      }
    ),
  notes: string().notRequired().nullable(),
  tags: string().notRequired().nullable(),
  serials: array<IKeySerial>().nullable(),
  keyXSpaces: array<IKeySpaceAssociation>().nullable()
});

export interface IKeySpaceAssociation {
  id: number;
  spaceId: number;
  keyId: number;
  space?: ISpace;
  key?: IKey;
}
