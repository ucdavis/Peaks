import { endOfDay } from 'date-fns';
import * as yup from 'yup';
import { ValidateOptions, ValidationError } from 'yup';
import { IAccess } from './Access';
import { IEquipment } from './Equipment';
import { IKey } from './Keys';
import { IKeySerial } from './KeySerials';
import { IPerson } from './People';
import { IWorkstation } from './Workstations';

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
  schema: yup.ObjectSchema<
    IKey | IKeySerial | IEquipment | IWorkstation | IPerson | IAccess
  >,
  asset: IKey | IKeySerial | IEquipment | IWorkstation | IPerson | IAccess,
  options?: ValidateOptions,
  assignment?: IAssignmentSchema
) => {
  const error: IValidationError = {
    message: '',
    path: ''
  };
  try {
    schema.validateSync(asset, options);
    if (
      !!assignment && // validate when assignment is passed in
      (asset.id !== 0 || // and we are assigning an asset that already exists
        (asset.id === 0 && !!assignment.person)) // or we are creating a new one and the user has selected a person
    ) {
      assignmentSchema.validateSync(assignment);
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      error.path = err.path;
    }
    error.message = err.message;
  }
  return error;
};

// Main Type of the context
export interface AppContext {
  fetch: (url: string, init?: RequestInit) => any;
  team: ITeam;
  permissions: string[];
  tags: string[];
}

// /:team/${container}/:containerAction?/:containerId?/:assetType?/:action?/:id
export interface IMatchParams {
  containerAction: string;
  containerId: string;
  assetType: string;
  action: string;
  id: string;
}

export interface IRouteProps {
  id: string;
  action: string;

  assetType: string;

  personId: string;
  personAction: string;

  spaceId: string;
  spaceAction: string;

  keyId: string;
  keyAction: string;
}

export interface ITeam {
  id: number;
  name: string;
  slug: string;
}

export interface IHasExpiration {
  expiresAt: Date;
}

export interface IHistory {
  description: string;
  actedDate: Date;
  actionType?: string;
  assetType?: string;
  id: number;
  link: string;
}

export interface IFilter {
  filter: string;
  type: string;
}
