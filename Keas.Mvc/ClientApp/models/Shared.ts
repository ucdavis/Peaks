import { endOfDay } from 'date-fns';
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
    .min(endOfDay(new Date()), 'You must choose a date after today.'),
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
    if (
      !!assignment && // validate when assignment is passed in
      (asset.id !== 0 || // and we are assigning an asset that already exists
        (asset.id === 0 && !!assignment.person)) // or we are creating a new one and the user has selected a person
    ) {
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
