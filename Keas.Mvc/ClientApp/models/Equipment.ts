import * as yup from 'yup';
import { IPerson } from './People';
import { ISpace } from './Spaces';

export interface IEquipment {
  assignment?: IEquipmentAssignment;
  equipmentAssignmentId?: number;
  id: number;
  make: string;
  model: string;
  name: string;
  space: ISpace;
  serialNumber: string;
  tags: string;
  teamId: number;
  type: string;
  protectionLevel: string;
  availabilityLevel: string;
  systemManagementId: string;
  notes: string;
  attributes: IEquipmentAttribute[];
}

export const equipmentSchema = yup.object<IEquipment>().shape({
  assignment: yup.object<IEquipmentAssignment>().nullable(),
  attributes: yup
    .array<IEquipmentAttribute>()
    .notRequired()
    .nullable(),
  availabilityLevel: yup
    .string()
    .max(2)
    .notRequired()
    .nullable(),
  equipmentAssignmentId: yup.number().nullable(),
  id: yup.number(),
  make: yup
    .string()
    .notRequired()
    .nullable(),
  model: yup
    .string()
    .notRequired()
    .nullable(),
  name: yup
    .string()
    .required()
    .max(64),
  notes: yup
    .string()
    .notRequired()
    .nullable(),
  protectionLevel: yup
    .string()
    .max(2)
    .notRequired()
    .nullable(),
  serialNumber: yup
    .string()
    .notRequired()
    .nullable(),
  space: yup
    .object<ISpace>()
    .notRequired()
    .nullable(),
  systemManagementId: yup
    .string()
    .max(16)
    .notRequired()
    .nullable(),
  tags: yup
    .string()
    .notRequired()
    .nullable(),
  teamId: yup
    .number()
    .notRequired()
    .nullable(),
  type: yup
    .string()
    .notRequired()
    .nullable()
});

export interface IEquipmentAssignment {
  id: number;
  equipmentId: number;
  expiresAt: Date;
  equipment: IEquipment;
  person: IPerson;
}

export interface IEquipmentLabel {
  equipment: IEquipment;
  label: string;
}

export interface IEquipmentAttribute {
  id?: number;
  equipmentId: number;
  key: string;
  value: string;
}

export interface IManagedSystemSearchedName {
  hardware_u_bigfix_id: string;
  hardware_display_name: string;
  hardware_u_device_name: string;
}
