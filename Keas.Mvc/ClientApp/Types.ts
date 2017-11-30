// Main Type of the context
export interface AppContext {
  teamId: number;
  fetch: (url: string, init?: RequestInit) => any;
  person: IPerson;
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

export interface IKey {
  id: number;
  teamId: number;
  name: string;
  serialNumber: string;
}

export interface IKeyAssignment {
  id: number;
  keyId: number;
  expiresAt: Date;
  key: IKey;
}
