// Main Type of the context
// tslint:disable-next-line:interface-name
export interface AppContext {
  fetch: (url: string, init?: RequestInit) => any;
  person: IPerson;
  team: ITeam;
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
}

export interface IAccessAssignment {
    id: number;
    accessId: number;
    expiresAt: Date;
    access: IAccess;
}