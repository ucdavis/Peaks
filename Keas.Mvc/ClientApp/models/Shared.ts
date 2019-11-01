import * as yup from 'yup';
import { ValidateOptions, ValidationError } from 'yup';
import { IPerson } from '../Types';
import { IKey } from './Keys';
import { IKeySerial } from './KeySerials';

export const assignmentSchema = yup.object().shape({
  date: yup
    .date()
    .required('A date is required for this assignment.')
    .min(new Date(), 'You must choose a date after today.'),
  person: yup
    .object<IPerson>()
    .required('A person is required for this assignment.')
});

export interface IValidationError {
  message: string;
  path: string;
}

export const yupAssetValidation = (
  schema: yup.ObjectSchema<IKey | IKeySerial>,
  object: IKey | IKeySerial,
  options?: ValidateOptions
) => {
  const error: IValidationError = {
    message: '',
    path: ''
  };
  try {
    const validObject = schema.validateSync(object, options);
  } catch (err) {
    if (err instanceof ValidationError) {
      error.path = err.path;
    }
    error.message = err.message;
  }
  return error;
};
