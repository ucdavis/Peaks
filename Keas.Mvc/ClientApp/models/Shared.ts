import * as yup from 'yup';
import { IPerson } from '../Types';

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
