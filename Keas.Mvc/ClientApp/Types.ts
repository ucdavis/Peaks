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
  person: IPerson;
  personId: number;
}

export interface IEquipment {
  assignment?: IEquipmentAssignment;
  id: number;
  make: string;
  model: string;
  name: string;
  room: IRoom;
  serialNumber: string;
  teamId: number;
  type: string;
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

export interface IRoom {
  bldgName: string;
  roomKey: string;
  roomName: string;
  roomNumber: string;
}
