import * as yup from 'yup';
import { ValidateOptions, ValidationError } from 'yup';
import { IPerson } from '../Types';
import { IKey } from './Keys';
import { IKeySerial } from './KeySerials';

export const assignmentSchema = yup.object().shape({
  date: yup
    .date()
    .nullable()
    .required('A date is required for this assignment.')
    .min(new Date(), 'You must choose a date after today.'),
  person: yup
    .object<IPerson>()
    .nullable()
    .required('A person is required for this assignment.')
});

export interface IValidationError {
  message: string;
  path: string;
}

export interface IAssignmentSchema {
  date: Date;
  person: IPerson;
}

export const yupAssetValidation = (
  schema: yup.ObjectSchema<IKey | IKeySerial>,
  asset: IKey | IKeySerial,
  options?: ValidateOptions,
  assignment?: IAssignmentSchema
) => {
  const error: IValidationError = {
    message: '',
    path: ''
  };
  try {
    const validObject = schema.validateSync(asset, options);
    if (!!assignment && asset.id !== 0) {
      // if asset is already created, require assignment
      const validAssignment = assignmentSchema.validateSync(assignment);
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      error.path = err.path;
    }
    error.message = err.message;
  }
  return error;
};
