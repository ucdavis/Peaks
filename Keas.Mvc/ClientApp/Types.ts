import { IPerson } from './models/People';

// Main Type of the context
// tslint:disable-next-line:interface-name
export interface AppContext {
  fetch: (url: string, init?: RequestInit) => any;
  team: ITeam;
  permissions: string[];
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

export interface IAccess {
  id: number;
  teamId: number;
  name: string;
  notes: string;
  tags: string;
  assignments: IAccessAssignment[];
}

export interface IAccessAssignment {
  id: number;
  accessId: number;
  access: IAccess;
  expiresAt: Date;
  person: IPerson;
  personId: number;
}

export interface IHasExpiration {
  expiresAt: Date;
}

export interface ISpaceInfo {
  space: ISpace;
  id: number;
  equipmentCount: number;
  keyCount: number;
  workstationsTotal: number;
  workstationsInUse: number;
  tags: string; // comma separated list of workstation tags in this space
}

export interface ISpace {
  id: number;
  roomKey: string;
  orgId: string;
  deptName: string;
  bldgName: string;
  floorName: string;
  roomName: string;
  roomNumber: string;
  sqFt: string;
  roomCategoryName: string;
}

export interface IHistory {
  description: string;
  actedDate: Date;
  actionType?: string;
  assetType?: string;
  id: number;
}

export interface IBigFixSearchedName {
  id: string;
  name: string;
}
