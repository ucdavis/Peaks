import * as yup from 'yup';
import { IPerson, ISpace } from '../Types';

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
    .oneOf(['A1', 'A2', 'A3', 'A4'])
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
    .oneOf(['P1', 'P2', 'P3', 'P4'])
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
