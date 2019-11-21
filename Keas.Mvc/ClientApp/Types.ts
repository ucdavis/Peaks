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

export interface IUser {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  id: string;
  iam: string;
}

export interface IPerson {
  active?: boolean;
  id: number;
  userId: string;
  teamId: number;
  user?: IUser;
  tags: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  homePhone: string;
  teamPhone: string;
  title: string;
  supervisorId?: number;
  supervisor?: IPerson;
  startDate: Date;
  endDate: Date;
  category: string;
  notes: string;
  isSupervisor: boolean;
}

export interface IPersonInfo {
  person: IPerson;
  id: number;
  accessCount: number;
  equipmentCount: number;
  keyCount: number;
  workstationCount: number;
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

export interface IWorkstation {
  id: number;
  name: string;
  space: ISpace;
  tags: string;
  notes: string;
  teamId: number;
  assignment?: IWorkstationAssignment;
}

export interface IWorkstationAssignment {
  id: number;
  workstationId: number;
  expiresAt: Date;
  person: IPerson;
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
