import { array, ObjectSchema, number, object, string } from 'yup';
import { IPerson } from './People';

export interface IAccess {
  assignments: IAccessAssignment[];
  id: number;
  name: string;
  notes: string;
  tags: string;
  teamId: number;
}

export const accessSchema: ObjectSchema<IAccess> = object({
  assignments: array<IAccessAssignment>()
    .nullable()
    .test(
      'checkValidAssignmentToPerson',
      'The user you have selected is already assigned this access.',
      function test(value) {
        const context: any = this.options.context;
        if (!context) {
          // if we haven't been supplied context (e.g. on edit)
          return true; // default to true
        }
        const valid = context.checkValidAssignmentToPerson(
          value,
          context.personId
        );
        return valid;
      }
    ),
  id: number(),
  name: string().required().max(64),
  notes: string().notRequired().nullable(),
  tags: string().notRequired().nullable(),
  teamId: number()
});

export interface IAccessAssignment {
  id: number;
  accessId: number;
  access: IAccess;
  expiresAt: Date;
  person: IPerson;
  personId: number;
}
