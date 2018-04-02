import { History, Location } from "history";
import { match } from "react-router";

// Main Type of the context
// tslint:disable-next-line:interface-name
export interface AppContext {
  fetch: (url: string, init?: RequestInit) => any;
  router: {
    history: History;
    route: {
      location: Location;
      match: match<IRouteProps>;
    };
  };
  team: ITeam;
}

export interface IRouteProps {
  id: string;
  action: string;
  assetType: string;
  personId: string;
  personAction: string;
}

export interface IUser {
  name: string;
  email: string;
}

export interface IPerson {
  id: number;
  userid: number;
  teamId: number;
  user: IUser;
  accessAssignments: IAccessAssignment[];
}

export interface ITeam {
  id: number;
  name: string;
}

export interface IKey {
  id: number;
  teamId: number;
  name: string;
  serialNumber: string;
  assignment?: IKeyAssignment;
}

export interface IKeyAssignment {
  id: number;
  keyId: number;
  expiresAt: Date;
  key: IKey;
}

export interface IAccess {
  id: number;
  teamId: number;
  name: string;
  assignments: IAccessAssignment[];
}

export interface IAccessAssignment {
  id: number;
  accessId: number;
  expiresAt: Date;
  // access: IAccess;
  person: IPerson;
  personId: number;
}

export interface IEquipment {
  id: number;
  teamId: number;
  name: string;
  serialNumber: string;
  make: string;
  model: string;
  type: string;
  assignment?: IEquipmentAssignment;
  // attributes?: IEquipmentAttribute[];
}

export interface IEquipmentAssignment {
  id: number;
  equipmentId: number;
  expiresAt: Date;
  equipment: IEquipment;
}

export interface IEquipmentAttribute {
  equipment: IEquipment;
  id: number;
  equipmentId: number;
  key: string;
  value: string;
}
