import { array, ObjectSchema, mixed, number, object, string } from 'yup';
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

export const equipmentSchema: ObjectSchema<IEquipment> = object({
  assignment: mixed<IEquipmentAssignment>().nullable(),
  equipmentAssignmentId: number().nullable(),
  id: number(),
  make: string().notRequired().nullable(),
  model: string().notRequired().nullable(),
  name: string().required().max(64),
  space: mixed<ISpace>().notRequired().nullable(),
  serialNumber: string().notRequired().nullable(),
  tags: string().notRequired().nullable(),
  teamId: number().notRequired().nullable(),
  type: string().notRequired().nullable(),
  protectionLevel: string().max(2).notRequired().nullable(),
  availabilityLevel: string().max(2).notRequired().nullable(),
  systemManagementId: string().max(16).notRequired().nullable(),
  notes: string().notRequired().nullable(),
  attributes: array<IEquipmentAttribute>().notRequired().nullable()
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
